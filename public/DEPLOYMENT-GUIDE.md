# Meme Animator Pro - Production Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
# or
bun install -g vercel
```

**Step 2: Login to Vercel**
```bash
vercel login
```

**Step 3: Deploy**
```bash
cd meme-animator-pro
vercel --prod
```

**Or connect via GitHub:**
1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Deploy automatically

---

### Option 2: Docker Deployment

**Build Docker Image:**
```bash
# Create Dockerfile (already prepared)
docker build -t meme-animator-pro .

# Run Container
docker run -p 3000:3000 meme-animator-pro
```

**Or use Docker Compose:**
```bash
docker-compose up -d
```

---

### Option 3: Self-Hosted (PM2)

**Install PM2:**
```bash
npm install -g pm2
```

**Build and Start:**
```bash
cd meme-animator-pro
bun install
bun run build
pm2 start .next/standalone/server.js --name meme-animator
```

---

### Option 4: Static Export (Limited Features)

For static hosting (GitHub Pages, Netlify, etc.):

```bash
# Add to next.config.ts:
# output: 'export'

bun run build
# Upload 'out' folder to any static host
```

**Note:** API routes won't work with static export.

---

## Environment Variables

Create `.env` file with:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# AI Features (optional)
# Add your AI API keys if needed
```

---

## Production Checklist

- [ ] Build succeeds (`bun run build`)
- [ ] Environment variables configured
- [ ] Database migrations run (`bun run db:push`)
- [ ] Static assets optimized
- [ ] API routes functional

---

## Quick Deploy Commands

| Platform | Command |
|----------|---------|
| **Vercel** | `vercel --prod` |
| **Railway** | `railway up` |
| **Render** | Connect GitHub repo |
| **Fly.io** | `fly deploy` |
| **Docker** | `docker build -t app . && docker run -p 3000:3000 app` |

---

## Support

For issues, check:
- Build logs
- Environment variables
- Database connection
- Node.js version (18+)
