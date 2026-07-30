import { promises as fs } from "node:fs";
import path from "node:path";

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";

  if (!token || !repo) {
    throw new Error(
      "Čuvanje sadržaja nije podešeno. Dodajte GITHUB_TOKEN i GITHUB_REPO u Vercel Environment Variables, pa uradite redeploy.",
    );
  }

  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    throw new Error(
      "GITHUB_REPO mora biti u formatu vlasnik/repozitorijum (na primer MiticAndrija/nishkigram-test).",
    );
  }

  return { token, repo, branch };
}

async function fetchFileFromGitHub(filePath: string) {
  const { token, repo, branch } = getGitHubConfig();

  const url = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Niskigram-Web",
    },
    next: { revalidate: 0 },
  } satisfies NextFetchInit);

  if (!response.ok) {
    if (response.status === 404) {
      return { content: "", sha: null };
    }
    const details = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(
      `GitHub ne može da pročita ${filePath} (${response.status}): ${details?.message || response.statusText}`,
    );
  }

  const data = await response.json();
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { content, sha: data.sha };
}

async function updateFileInGitHub(
  filePath: string,
  content: string,
  message: string,
  sha: string | null,
) {
  const { token, repo, branch } = getGitHubConfig();

  const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const body: {
    message: string;
    content: string;
    branch: string;
    sha?: string;
  } = {
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "Niskigram-Web",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(
      `GitHub nije sačuvao ${filePath} (${response.status}): ${err.message || response.statusText}. Proverite GITHUB_REPO, GITHUB_BRANCH i da token ima Contents: Read and write dozvolu.`,
    );
  }
}

export async function readJsonFile<T>(
  relativePath: string,
  defaultValue: T,
  forceLive: boolean = false,
): Promise<{ data: T; sha: string | null }> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (forceLive && token && repo) {
    try {
      const { content, sha } = await fetchFileFromGitHub(relativePath);
      if (!content) {
        return { data: defaultValue, sha: null };
      }
      return { data: JSON.parse(content) as T, sha };
    } catch (error) {
      console.error(`Error reading ${relativePath} live from GitHub:`, error);
    }
  }

  const localPath = path.join(/*turbopackIgnore: true*/ process.cwd(), relativePath);
  try {
    const raw = await fs.readFile(localPath, "utf8");
    return { data: JSON.parse(raw) as T, sha: null };
  } catch {
    return { data: defaultValue, sha: null };
  }
}

export async function writeJsonFile<T>(
  relativePath: string,
  data: T,
  commitMessage: string,
  sha: string | null = null,
): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const contentString = JSON.stringify(data, null, 2);

  if (token || repo || process.env.VERCEL) {
    getGitHubConfig();
    let currentSha = sha;
    if (!currentSha) {
      try {
        const fileInfo = await fetchFileFromGitHub(relativePath);
        currentSha = fileInfo.sha;
      } catch {
        currentSha = null;
      }
    }
    await updateFileInGitHub(relativePath, contentString, commitMessage, currentSha);
    return;
  }

  const localPath = path.join(/*turbopackIgnore: true*/ process.cwd(), relativePath);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, contentString, "utf8");
}
