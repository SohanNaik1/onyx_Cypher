# Launch-Your-Store (Cypher)

Next.js (App Router) + TypeScript + Tailwind.

## Run
```bash
npm install
cp .env.example .env.local   # fill in keys, never commit .env.local
npm run dev                  # http://localhost:3000
```

## Structure
- `app/(onboarding)` onboarding wizard
- `app/(store)` public storefront
- `app/(admin)` store owner dashboard
- `app/api` route handlers
- `components/`, `lib/` shared code
- `mock/` mock data matching `docs/schema.sql`
- `docs/` schema + `docs/test-data/` sample/messy CSVs
