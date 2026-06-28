Quick local dev startup

Start backend + admin + student frontends with one command from the repo root:

```powershell
# from LMS/ (root)
npm install
npm run dev
```

What this runs (scripts in `package.json`):
- `dev:backend` -> `cd backend && npm run dev` (nodemon)
- `dev:frontend` -> `cd course-compass-main && npm run dev` (Vite at :3000)
- `dev:admin` -> `cd admin && npm run dev` (Vite at :3001)

Tips to speed dev:
- Use persistent dev terminals (don't restart processes frequently).
- Keep `node_modules` installed at root so shared tools like `concurrently` are available.
- Let Vite's pre-bundling finish once; subsequent starts are much faster.
- For faster installs, consider `pnpm` (optional): `npm i -g pnpm` then `pnpm install`.

If you prefer to run just one app:
```powershell
# backend only
cd backend; npm run dev

# admin only
cd admin; npm run dev

# student frontend only
cd course-compass-main; npm run dev
```
