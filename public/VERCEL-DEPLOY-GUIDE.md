# 🚀 Deploy to Vercel - Step by Step Guide

## Method 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub
```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Meme Animator Pro"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/meme-animator-pro.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js
5. Click **"Deploy"**

That's it! Your app will be live in ~2 minutes.

---

## Method 2: Deploy via CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
# or
bun install -g vercel
```

### Step 2: Login
```bash
vercel login
```

Choose your login method:
- GitHub
- GitLab
- Bitbucket
- Email

### Step 3: Deploy
```bash
cd meme-animator-pro

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Environment Variables

In Vercel Dashboard, add these environment variables:

| Name | Value | Required |
|------|-------|----------|
| `DATABASE_URL` | `file:./db/custom.db` | Yes |

### To Add Environment Variables:
1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add each variable

---

## Build Settings

Vercel auto-detects these from `vercel.json`:

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `bun run build` |
| Install Command | `bun install` |
| Output Directory | `.next` |

---

## After Deployment

### Your URL will be:
```
https://meme-animator-pro.vercel.app
```
Or with custom name:
```
https://YOUR_PROJECT_NAME.vercel.app
```

### Custom Domain (Optional)
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records

---

## Troubleshooting

### Build Fails
```bash
# Check build locally first
bun run build
```

### Database Issues
- SQLite works on Vercel with `file:./db/custom.db`
- Data persists in `/tmp` between serverless invocations
- For production, consider PostgreSQL/MySQL

### API Routes Not Working
- Check function timeout in `vercel.json`
- Default is 10s, max 60s on Pro plan

---

## Quick Commands

| Action | Command |
|--------|---------|
| Deploy preview | `vercel` |
| Deploy production | `vercel --prod` |
| View logs | `vercel logs` |
| Open dashboard | `vercel open` |
| Remove deployment | `vercel remove` |

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://nextjs.org/docs/deployment)
