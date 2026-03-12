# BizxFlow Frontend — Folder setup, GitHub, and domain

This project is the **frontend** for BizxFlow. Backend runs on Railway; this repo deploys to Vercel (or Netlify) and uses your domain.

---

## Folder checklist (this repo)

- [x] `.gitignore` — includes `node_modules`, `.env`, `dist`, `build`, `.vercel`, `.netlify`
- [x] `.env.example` — `VITE_API_BASE_URL` (copy to `.env` locally; do not commit `.env`)
- [x] `package.json`, `README.md`, `index.html`, `vite.config.ts`
- [x] `src/api/`, `src/components/`, `src/pages/` — API client calls backend

**Important:** This app uses **`VITE_API_BASE_URL`** (not `VITE_API_URL`). Use that name in Vercel/Netlify env vars.

---

## 1. Local env (before first run)

```bash
cp .env.example .env
# Edit .env if you need a different API URL (default is Railway backend).
```

---

## 2. Put the frontend on GitHub (separate repo — recommended)

Run from this folder (`/path/to/frontend`):

```bash
cd /Users/uzairbaluch/Desktop/frontend   # or your actual path
git init
git add .
git commit -m "Initial frontend"
```

On GitHub: **New repository** (e.g. `BizxFlow-Frontend`). Do **not** add README or .gitignore.

Then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/BizxFlow-Frontend.git
git branch -M main
git push -u origin main
```

---

## 3. Deploy on Vercel and add your domain

1. [vercel.com](https://vercel.com) → Sign in with GitHub → **Add New Project** → Import your **frontend repo**.
2. **Root directory:** leave empty.
3. **Environment variables:** add  
   `VITE_API_BASE_URL` = `https://bizxflow-production.up.railway.app`  
   (or your backend URL).
4. Deploy. You get something like `bizxflow-frontend.vercel.app`.
5. **Settings → Domains** → Add your domain (e.g. `app.yourdomain.com`). Follow DNS (CNAME for subdomain, A for root).

See **DEPLOY.md** for detailed domain/DNS steps.

---

## 4. Backend CORS

On the **backend** (Railway), ensure `CORS_ORIGIN` (or your CORS config) includes your frontend origin, e.g.:

- `https://app.yourdomain.com`
- Or your Vercel URL: `https://your-project.vercel.app`

Otherwise the browser will block API requests from your domain.

---

## Full checklist

- [ ] `.env` created from `.env.example` (not committed)
- [ ] Repo pushed to GitHub (e.g. `BizxFlow-Frontend`)
- [ ] Deployed on Vercel; build succeeds
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] Custom domain added in Vercel and DNS updated
- [ ] Backend CORS includes your frontend domain
- [ ] In browser: your domain loads the app and can call the API (check Network tab if login fails)
