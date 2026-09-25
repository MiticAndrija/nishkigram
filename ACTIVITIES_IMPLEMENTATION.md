# Aktuelnost — izveštaj

Javna stranica `/aktivnosti` i zaštićena administracija `/admin/aktivnosti`
koriste postojeći Nishkigram dizajn, sesiju, biblioteku slika i JSON/GitHub sloj.

Datum i opciono vreme porede se u zoni `Europe/Belgrade`. Kada rok prođe,
sledeće učitavanje javne stranice ili admina automatski uklanja zapis iz
`data/activities.json` ili GitHub skladišta. Brisanje se odnosi i na nacrte.

Aktuelnosti se čuvaju u `data/activities.json`, a kategorije u
`data/activity-categories.json`. Slike dele postojeći upload, Vercel Blob i
media sistem, uključujući čišćenje slika koje više nijedna sekcija ne koristi.

Provere: `npm run lint`, `npm run build`, `node node_modules/typescript/bin/tsc
--noEmit` i `npm test` prolaze. Testovi pokrivaju vremensko isticanje,
automatsko brisanje, CRUD, kategorije, GitHub upise, validaciju i slike.
