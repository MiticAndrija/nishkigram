import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Load the project's TypeScript/alias imports without a new test dependency.
function loadProject(entry, mocks = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = new Module(filename);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    cache.set(filename, mod);
    const nativeRequire = mod.require.bind(mod);
    mod.require = (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith("@/")) return load(path.join(root, `${name.slice(2)}.ts`));
      return nativeRequire(name);
    };
    mod._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText, filename);
    return mod.exports;
  }
  return load(path.join(root, entry));
}

const meta = loadProject("lib/activityMeta.ts");
const valid = {
  title: "Koncert", category: "Muzika", date: "2026-10-12", time: "21:00",
  location: "Feedback, Niš", url: "https://example.com/event", published: true,
  coverImage: "/images/nis-hero.png", coverImageAlt: "Koncert u Nišu", coverImagePosition: "50% 75%",
};
const record = (id, changes = {}) => ({ ...valid, id, createdAt: "2026-09-25T12:00:00Z", updatedAt: "2026-09-25T12:00:00Z", ...changes });

test("Belgrade calendar dates handle midnight, year rollover and DST", () => {
  const cases = [
    ["2026-09-25T21:59:59Z", "2026-09-25"], ["2026-09-25T22:00:00Z", "2026-09-26"],
    ["2026-12-31T23:00:00Z", "2027-01-01"], ["2026-03-29T00:59:59Z", "2026-03-29"],
    ["2026-03-29T01:00:00Z", "2026-03-29"], ["2026-10-25T01:00:00Z", "2026-10-25"],
  ];
  for (const [instant, expected] of cases) assert.equal(meta.getBelgradeDate(new Date(instant)), expected);
});

test("real calendar dates only, including leap years", () => {
  for (const date of ["2026-02-29", "2026-02-30", "2026-13-01", "2026-00-12", "2026-1-02", "invalid", "0000-01-01"]) assert.equal(meta.isValidActivityDate(date), false, date);
  assert.equal(meta.isValidActivityDate("2028-02-29"), true);
  assert.equal(meta.isValidActivityDate("2026-10-12"), true);
  assert.match(meta.formatActivityDate("2026-10-12"), /12.*oktobar.*2026/);
});

test("drafts and expired events are hidden, today remains, sort is chronological", () => {
  const data = [record("nov", { date: "2026-11-02" }), record("draft", { published: false }), record("past", { date: "2026-10-11" }), record("late"), record("early", { time: "12:00" }), record("no-time", { time: "" })];
  assert.deepEqual(meta.upcomingActivities(data, "2026-10-12").map((item) => item.id), ["early", "late", "no-time", "nov"]);
  assert.equal(data.length, 6);
  assert.deepEqual(meta.sortActivities([record("unknown-time", { title: "A", time: "" }), record("last-minute", { time: "23:59" })]).map((item) => item.id), ["last-minute", "unknown-time"]);
});

test("external URLs only allow absolute HTTP(S), reject script and malformed URLs", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "//example.com", "/local", "ftp://example.com", "https://", "https://user:password@example.com", "https://example.com\\bad", "https://example.com/has space"]) {
    assert.throws(() => meta.parseActivityInput({ ...valid, url }), meta.ActivityValidationError, url);
  }
  for (const url of ["https://instagram.com/test/", "http://example.com/event?a=1&b=2"]) assert.equal(meta.parseActivityInput({ ...valid, url }).url, url);
});

test("required fields, types, time, status and image source are validated", () => {
  for (const key of ["title", "category", "date", "location", "url"]) assert.throws(() => meta.parseActivityInput({ ...valid, [key]: " " }));
  for (const bad of [null, [], "bad", { ...valid, title: 12 }, { ...valid, published: "true" }, { ...valid, time: "24:00" }, { ...valid, time: "12:61" }, { ...valid, coverImage: "https://unconfigured.example/image.jpg" }, { ...valid, coverImage: "/images/../secrets" }]) assert.throws(() => meta.parseActivityInput(bad));
  const parsed = meta.parseActivityInput({ ...valid, title: "  Koncert  ", time: "", coverImage: "" });
  assert.equal(parsed.title, "Koncert");
  assert.equal(parsed.time, "");
  assert.equal(parsed.coverImage, "/images/nis-hero.png");
});

test("malformed JSON records cannot crash or expose unsafe public links", () => {
  assert.deepEqual(meta.normalizeActivities({ wrong: "shape" }), []);
  const data = [null, 1, {}, record("bad-date", { date: "bad" }), record("script", { url: "javascript:alert(1)" }), record("bad-bool", { published: "true" }), record("good", { coverImage: 17 }), record("good")];
  const normalized = meta.normalizeActivities(data);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].id, "good");
  assert.equal(normalized[0].coverImage, "/images/nis-hero.png");
});

async function isolatedStorage(callback) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "nishkigram-activity-tests-"));
  const originalCwd = process.cwd();
  const keys = ["GITHUB_TOKEN", "GITHUB_REPO", "GITHUB_BRANCH", "VERCEL", "BLOB_READ_WRITE_TOKEN", "BLOB_STORE_ID"];
  const environment = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const originalFetch = global.fetch;
  try {
    for (const key of keys) delete process.env[key];
    process.chdir(fixture);
    await callback(fixture);
  } finally {
    global.fetch = originalFetch;
    process.chdir(originalCwd);
    for (const key of keys) {
      if (environment[key] === undefined) delete process.env[key]; else process.env[key] = environment[key];
    }
    const resolved = path.resolve(fixture);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith("nishkigram-activity-tests-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}

test("local JSON activity CRUD, category safety and automatic expiry deletion", async () => isolatedStorage(async (fixture) => {
  const activities = loadProject("lib/activities.ts");
  const categories = loadProject("lib/activityCategories.ts");
  const created = await activities.createActivity(valid);
  assert.equal((await activities.getAllActivities()).length, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(fixture, "data/activities.json")))[0].id, created.id);
  const updated = await activities.updateActivity(created.id, { ...valid, published: false, date: "2020-01-01" });
  assert.equal(updated.createdAt, created.createdAt);
  assert.equal((await activities.getUpcomingActivities()).length, 0);
  assert.equal((await activities.getAllActivities()).length, 0);
  const active = await activities.createActivity({ ...valid, date: "2099-10-12" });
  await assert.rejects(categories.deleteActivityCategory("Muzika"), /Kategorija se koristi/);
  await assert.rejects(categories.updateActivityCategory("Muzika", "Koncerti"), /Kategorija se koristi/);
  await categories.addActivityCategory("  Pozorište  ");
  await assert.rejects(categories.addActivityCategory("pozorište"), /postoji/);
  await categories.updateActivityCategory("Pozorište", "Predstave");
  assert.ok((await categories.getActivityCategories()).includes("Predstave"));
  await categories.deleteActivityCategory("Predstave");
  await assert.rejects(activities.createActivity({ ...valid, category: "Nepostojeća" }), /postojeću/);
  assert.equal(await activities.updateActivity("missing", valid), null);
  assert.equal(await activities.deleteActivity(active.id), true);
  assert.equal(await activities.deleteActivity(active.id), false);
  assert.deepEqual(await activities.getAllActivities(), []);
}));

test("an activity with a passed time is deleted while a later time remains", async () => isolatedStorage(async () => {
  const activities = loadProject("lib/activities.ts");
  const old = await activities.createActivity({ ...valid, title: "Prošao termin", date: "2020-01-01", time: "23:59" });
  const future = await activities.createActivity({ ...valid, title: "Budući termin", date: "2099-01-01", time: "00:01" });
  assert.ok(old.id && future.id);
  assert.deepEqual((await activities.getAllActivities()).map((activity) => activity.title), ["Budući termin"]);
}));

test("recommendation category behavior survives shared store extraction", async () => isolatedStorage(async () => {
  const categories = loadProject("lib/recommendationCategories.ts");
  assert.deepEqual(await categories.getRecommendationCategories(), categories.defaultRecommendationCategories);
  await categories.addRecommendationCategory("  Novi   lokali ");
  await assert.rejects(categories.addRecommendationCategory("novi lokali"), /postoji/);
  await categories.updateRecommendationCategory("Novi lokali", "Nova mesta");
  assert.ok((await categories.getRecommendationCategories()).includes("Nova mesta"));
  await categories.deleteRecommendationCategory("nova mesta");
  assert.deepEqual(await categories.getRecommendationCategories(), categories.defaultRecommendationCategories);
}));

test("mutations preserve malformed rows and refuse invalid JSON instead of overwriting it", async () => isolatedStorage(async (fixture) => {
  const activities = loadProject("lib/activities.ts");
  fs.mkdirSync(path.join(fixture, "data"));
  const file = path.join(fixture, "data/activities.json");
  fs.writeFileSync(file, JSON.stringify([null, { id: "broken", date: "bad" }]));
  const created = await activities.createActivity(valid);
  assert.equal(JSON.parse(fs.readFileSync(file)).length, 3);
  await activities.deleteActivity(created.id);
  assert.deepEqual(JSON.parse(fs.readFileSync(file)), [null, { id: "broken", date: "bad" }]);
  fs.writeFileSync(file, "invalid JSON");
  await assert.rejects(activities.createActivity(valid));
  assert.equal(fs.readFileSync(file, "utf8"), "invalid JSON");
}));

test("expired activity cleanup also removes its now-unused shared image", async () => isolatedStorage(async (fixture) => {
  const image = "/uploads/blog/shared.png";
  fs.mkdirSync(path.join(fixture, "public/uploads/blog"), { recursive: true });
  fs.mkdirSync(path.join(fixture, "data"));
  const imageFile = path.join(fixture, "public", image);
  fs.writeFileSync(imageFile, "fixture");
  fs.writeFileSync(path.join(fixture, "data/activities.json"), JSON.stringify([record("expired-draft", { published: false, date: "2020-01-01", coverImage: image })]));
  const uploads = loadProject("lib/blogUploads.ts");
  await uploads.removeUnusedBlogUploads({ coverImage: image }, []);
  assert.ok(fs.existsSync(imageFile));
  const media = loadProject("lib/adminMedia.ts");
  const items = await media.getAdminMediaItems();
  assert.equal(items.some((item) => item.url === image), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(fixture, "data/activities.json"))), []);
  assert.equal(fs.existsSync(imageFile), false);
}));

test("GitHub persistence reads live and writes base64 JSON with branch and SHA", async () => isolatedStorage(async () => {
  process.env.GITHUB_TOKEN = "test-only";
  process.env.GITHUB_REPO = "test/repo";
  process.env.GITHUB_BRANCH = "test-branch";
  const files = new Map([["data/activity-categories.json", ["Muzika"]], ["data/activities.json", []]]);
  let writes = 0;
  global.fetch = async (url, options) => {
    const file = new URL(url).pathname.split("/contents/")[1];
    assert.equal(options.headers.Authorization, "Bearer test-only");
    if (options.method === "PUT") {
      const body = JSON.parse(options.body);
      assert.equal(body.branch, "test-branch");
      assert.equal(body.sha, "sha-current");
      files.set(file, JSON.parse(Buffer.from(body.content, "base64").toString("utf8")));
      writes++;
      return Response.json({ content: { sha: "sha-next" } });
    }
    assert.equal(new URL(url).searchParams.get("ref"), "test-branch");
    return Response.json({ content: Buffer.from(JSON.stringify(files.get(file) || [])).toString("base64"), sha: "sha-current" });
  };
  const activities = loadProject("lib/activities.ts");
  const created = await activities.createActivity(valid);
  assert.equal(files.get("data/activities.json")[0].id, created.id);
  await activities.updateActivity(created.id, { ...valid, published: false });
  assert.equal((await activities.getAllActivities())[0].published, false);
  await activities.deleteActivity(created.id);
  assert.deepEqual(files.get("data/activities.json"), []);
  assert.equal(writes, 3);
}));

test("failed live GitHub read never falls back into an activity write", async () => isolatedStorage(async (fixture) => {
  process.env.GITHUB_TOKEN = "test-only";
  process.env.GITHUB_REPO = "test/repo";
  fs.mkdirSync(path.join(fixture, "data"));
  fs.writeFileSync(path.join(fixture, "data/activities.json"), "[]");
  let writes = 0;
  global.fetch = async (_url, options) => {
    if (options.method === "PUT") writes++;
    return Response.json({ message: "offline" }, { status: 503 });
  };
  const activities = loadProject("lib/activities.ts");
  await assert.rejects(activities.createActivity(valid), /503/);
  assert.equal(writes, 0);
}));
