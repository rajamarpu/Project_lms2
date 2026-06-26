Course Compass — Frontend (course-compass-main)

Quick start (developer machine)

Prerequisites
- Node.js 18+ installed
- Git (optional)

Local dev (recommended)
1. Open a terminal and change to the frontend folder:
   cd course-compass-main

2. Install dependencies:
   npm install

3. Start the dev server (Vite). The app runs on port 3000 by default:
   npm run dev

4. Open the app in your browser:
   http://localhost:3000

Notes
- The frontend expects a backend API. Set `VITE_API_URL` in a `.env` file at the project root to point to your backend, e.g. `VITE_API_URL=http://localhost:4000/api`.
- If you run into native SWC binding issues on Windows, we use the standard `@vitejs/plugin-react` plugin (no native bindings).
- If dependencies fail to install due to locked files, ensure there are no running Node/Vite processes and try removing `node_modules` and `package-lock.json`, then re-run `npm install`.

Troubleshooting
- "vite not found": run `npm exec vite -- --host 0.0.0.0` or ensure `node_modules/.bin` is on PATH via running npm scripts.
- Port conflict: the dev server uses port `3000`. Change `server.port` in `vite.config.ts` or pass `--port` to Vite.

Further
- To run the backend, open the repository `backend/` folder and follow its README (install dependencies then start your backend server).