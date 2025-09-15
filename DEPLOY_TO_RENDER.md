Deploying this Flask + React (Vite) project to Render
=================================================

This file maps the deployment checklist to this repository and gives minimal commands and Render settings to deploy both backend (Flask) and frontend (static site).

1) Project layout in this repo
- Backend: `src/` (Flask app entry at `src/app.py`, WSGI at `src/wsgi.py`)
- Frontend: `dist/` (Vite build output). Source frontend is under `src/front/`.

Important files added to help deploy:
- `.env.example` — template of production environment variables (DO NOT put real secrets in the repo).
- `Procfile` — recommended start command for Render's Web Service: `gunicorn --chdir src wsgi:app -b 0.0.0.0:$PORT --workers ${GUNICORN_WORKERS:-4}`

2) Recommendations (short)
- Use separate repos for backend and frontend when possible. For quick deploy you can deploy this monorepo as two services:
  - Backend: Web Service using Python build commands
  - Frontend: Static Site using npm build output published from `dist/`
- Use PostgreSQL in production (Render provides managed Postgres). Set `DATABASE_URL` to the Render-provided Postgres URL.
- Ensure `FLASK_DEBUG=0` in production. Set this in Render Environment Variables (do not set to 1).

3) Backend (Flask) — Render Web Service settings
- Repository: link the backend repo (or this repo and set the Root Directory to project root if monorepo).
- Build Command:
```
pip install -r requirements.txt
```
- Start Command (Procfile will be used automatically). If you need an explicit Start Command, use:
```
gunicorn --chdir src wsgi:app -b 0.0.0.0:$PORT --workers ${GUNICORN_WORKERS:-4}
```
- Environment variables (set these in Render > Environment):
  - FLASK_DEBUG=0
  - DATABASE_URL=<render-postgres-url>
  - JWT_SECRET_KEY=<secure-random-string>
  - FLASK_APP_KEY=<secure-random-string>
  - FRONTEND_URL=https://<your-frontend-domain>
  - MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_DEFAULT_SENDER (if you use email)
  - GUNICORN_WORKERS (optional)

4) Frontend (React + Vite) — Render Static Site settings (recommended)
- Repository: link the frontend repo (or this repo). If monorepo, set "Root Directory" to the frontend folder.
- Build Command:
```
npm ci && npm run build
```
- Publish Directory: `dist` (Vite outputs here in this project)
- Set an environment variable for the API base (if needed):
  - REACT_APP_API_URL = https://<your-backend-service>.onrender.com/api

5) Connecting Frontend and Backend
- After backend deploy, copy its public URL and set `FRONTEND_URL` in backend env and `REACT_APP_API_URL` in frontend env (or bake it into a deploy-time env file).

6) Database migration
- On Render, after the Postgres service is created and DATABASE_URL is set, run DB migrations:
```
source .venv/bin/activate  # if you use a venv during build or use pip directly on build image
flask db upgrade         # run in the service shell or via a one-off job
```
Or use a Render Shell/cron job to execute `flask db upgrade` against the production DB.

7) Smoke checks & verification
- After deploy, verify:
  - `GET /health` returns 200
  - `GET /sitemap.xml` returns sitemap
  - `GET /prerender/organizations/<id>` returns HTML with JSON-LD
  - Static assets load from the frontend site

8) Helpful tips
- Secrets: never commit real secret values. Use Render's Environment UI or a secrets manager.
- Worker count: tune `GUNICORN_WORKERS` based on available CPU. A common rule: workers = (2 x CPU) + 1.
- Sessions and token blacklist: consider using Redis for shared sessions/blacklist across workers.

9) Quick local commands
- Build frontend locally:
```
npm ci
npm run build
```
- Run backend locally with gunicorn (mirror Render):
```
source .venv/bin/activate
pip install -r requirements.txt
gunicorn --chdir src wsgi:app -b 0.0.0.0:5000 --workers 4
```

10) Next steps I can take for you (pick one):
- A: Commit these deploy docs and `.env.example`/`Procfile` and push the branch.
- B: Create separate small backend/frontend Render service example files (render.yaml) for one-click deploy.
- C: Hold — you’ll handle environment setup on Render and run the deploy.
