# Deploy BizxFlow frontend on Vercel + custom domain

## 1. Push your code to GitHub

If you haven’t already:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
2. Click **Add New…** → **Project**.
3. **Import** your GitHub repo (the one that contains this frontend).
4. Vercel will detect Vite. Keep:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. (Optional) **Environment variables:**
   - `VITE_API_BASE_URL` = your backend API URL (e.g. `https://bizxflow-production.up.railway.app`)  
   If you don’t set it, the app uses the default in `src/api/client.ts`.
6. Click **Deploy**.

After the first deploy you’ll get a URL like `your-project.vercel.app`.

## 3. Add your custom domain

1. In the Vercel dashboard, open your project.
2. Go to **Settings** → **Domains**.
3. Enter your domain (e.g. `app.bizxflow.com` or `bizxflow.com`) and click **Add**.
4. Vercel will show DNS records. In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
   - **For a subdomain** (e.g. `app.bizxflow.com`): add a **CNAME** record:  
     Name: `app` (or your subdomain), Value: `cname.vercel-dns.com`.
   - **For the root domain** (`bizxflow.com`): add an **A** record:  
     Name: `@`, Value: `76.76.21.21`  
     and optionally **CNAME** for `www`: Name: `www`, Value: `cname.vercel-dns.com`.
5. Save DNS and wait for propagation (a few minutes to 48 hours). Vercel will show a check when the domain is verified.
6. (Optional) In **Domains**, enable **Redirect** so `www` → root or root → `www`, as you prefer.

## 4. HTTPS

Vercel issues SSL for your domain automatically once DNS is correct. No extra steps.

## 5. Future updates

Push to your main branch; Vercel will build and deploy automatically. Preview deployments are created for other branches and pull requests.

---

**Quick checklist**

- [ ] Repo pushed to GitHub  
- [ ] Project imported and first deploy done on Vercel  
- [ ] `VITE_API_BASE_URL` set in Vercel if needed  
- [ ] Custom domain added under **Settings → Domains**  
- [ ] DNS CNAME/A records added at your registrar  
- [ ] Domain verified and HTTPS active in Vercel  
