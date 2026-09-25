# Aktivnosti — izveštaj

Implementirana je javna stranica `/aktivnosti` i zaštićena administracija
`/admin/aktivnosti`, uz postojeći Nishkigram dizajn, navigaciju, autentifikaciju,
slike i JSON/GitHub arhitekturu. Nisu dodate zavisnosti.

## Kako radi

- Javna lista prikazuje objavljene aktivnosti sa današnjim ili budućim datumom,
  hronološki, uz sortiranje po vremenu unutar istog dana. Nepoznato vreme ide poslednje.
- Datum se poredi u zoni `Europe/Belgrade`. Aktivnost ostaje vidljiva celog dana;
  istek je izveden iz datuma. Istekli zapisi ostaju u JSON-u i adminu.
- Kartice sadrže sliku, kategoriju, naziv, datum, opciono vreme, lokaciju i
  eksterni HTTP(S) link sa `target="_blank"` i `rel="noopener noreferrer"`.
  Nema stranice detalja ni sluga aktivnosti.
- Admin omogućava dodavanje, izmenu, brisanje, objavljivanje i povlačenje objave,
  pregled kartice, upload/izbor postojeće slike, alt tekst i podešavanje kadra.
  Novi zapisi počinju kao nacrti; postoje upozorenja za nesačuvane izmene.
- Kategorije se mogu dodavati. Preimenovanje i brisanje dostupni su za nekorišćene
  kategorije. Korišćenu kategoriju prvo treba promeniti na povezanim aktivnostima;
  tako izmena kategorije zahteva samo jedan JSON upis.
- Sadržaj koristi `data/activities.json`, a kategorije
  `data/activity-categories.json`. Upisi koriste postojeći GitHub Contents API
  ili lokalne fajlove. Neuspešno živo čitanje prekida izmenu umesto upisa zastarelih podataka.
- Slike koriste postojeći `/api/admin/blog/upload`, biblioteku i lokalni/Vercel
  Blob sistem. Provera korišćenja i automatsko čišćenje obuhvataju sve tri sekcije.
- Početna lista je prazna, sa šest traženih kategorija. Test sadržaj nije dodat u repozitorijum.

## Kreirani fajlovi

- `app/aktivnosti/page.tsx`
- `app/admin/aktivnosti/page.tsx`
- `app/api/admin/aktivnosti/route.ts`
- `app/api/admin/aktivnosti/[id]/route.ts`
- `app/api/admin/aktivnosti/categories/route.ts`
- `components/ActivityCard.tsx`
- `components/ActivityForm.tsx`
- `components/AdminActivityManager.tsx`
- `lib/activities.ts`
- `lib/activityMeta.ts`
- `lib/activityApi.ts`
- `lib/activityCategories.ts`
- `lib/categoryStore.ts`
- `data/activities.json`
- `data/activity-categories.json`
- `tests/activities.test.mjs`
- `ACTIVITIES_IMPLEMENTATION.md`

## Izmenjeni fajlovi

- `components/Navbar.tsx`, `components/Footer.tsx` — linkovi ka aktivnostima;
  navbar pretraga i manji razmak linkova na tablet širini.
- `app/admin/blog/page.tsx`, `app/admin/preporuke/page.tsx`,
  `app/admin/uploads/page.tsx` — pristup novoj admin sekciji.
- `lib/adminMedia.ts`, `lib/blogUploads.ts` — praćenje aktivnosti i zaštita
  deljenih slika pri automatskom čišćenju.
- `lib/github.ts` — opciono strogo čitanje za bezbedne izmene i čišćenje.
- `lib/recommendationCategories.ts` — koristi izdvojenu zajedničku logiku
  kategorija; postojeće ponašanje preporuka je sačuvano i testirano.
- `package.json` — dodat `npm test` bez novih paketa.
- `eslint.config.mjs`, `tsconfig.json` — izuzeti privremeni verifikacioni fajlovi u `coverage`.
- `README.md` — opis funkcionalnosti, čuvanja i test komande.

## Provere

- `npm run lint` — prolazi.
- `npm run build` — prolazi, uključujući TypeScript proveru.
- `tsc --noEmit` — prolazi.
- `npm test` — 12 testova: datumi/DST, validacija, sortiranje, nacrti/istek,
  lokalni CRUD, kategorije, neispravni podaci, deljene slike i simulirani GitHub upisi.
- Headless Edge na izolovanoj kopiji: admin prijava i odjava, zaštita API-ja i CSRF,
  CRUD, kategorije, javni statusi, linkovi, metadata, upload, alt tekst, kadar i biblioteka.
- Javni/admin raspored i navigacija: 375, 390, 430, 768, 1024 i 1440 px;
  bez horizontalnog prelivanja. Provereno učitavanje slika.
- Postojeće javne/admin rute, dostupan blog detalj i API-ji za kategorije odgovaraju.
- Lokalni upload proveren u razvojnom režimu; produkcioni build i admin tokovi
  provereni odvojeno. Produkcija koristi postojeću Vercel Blob konfiguraciju.

Nije potrebna nova ručna konfiguracija ako su postojeće admin/GitHub/Blob
promenljive već podešene. Stvarni upisi u GitHub i Vercel Blob nisu izvršavani:
GitHub upisi provereni su simuliranim API odgovorima, a lokalno čuvanje stvarnim
fajlovima u izolovanoj kopiji. Izmene nisu objavljene niti poslate na GitHub.
