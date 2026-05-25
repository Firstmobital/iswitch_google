# iSwitch Google — Distributor Portal

Google Pixel distributor management portal for retailers and admins.

---

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Deploy**: Vercel

---

## Setup — Step by step

### 1. Supabase — Run schema
1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Click **New query**
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**
5. You should see tables created + 6 mobile models seeded

### 2. Supabase — Auth settings
1. Go to **Authentication → Settings**
2. Set **Site URL** to your Vercel URL (or `http://localhost:3000` for dev)
3. Add `http://localhost:3000/auth/callback` and `https://your-vercel-url.vercel.app/auth/callback` to **Redirect URLs**
4. Enable **Email confirmations** (recommended)

### 3. Create your admin account
1. Go to **Authentication → Users** in Supabase
2. Click **Invite user** or **Add user** → enter your email
3. After user is created, go to **Table Editor → profiles**
4. Find your user row
5. Set `role` = `admin`
6. Set `approval_status` = `approved`

### 4. Local development
```bash
# Clone your repo
git clone https://github.com/Firstmobital/iswitch_google.git
cd iswitch_google

# Install dependencies
npm install

# Copy env file (already filled in for you)
# .env.local is already configured — DO NOT commit it to git

# Run dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel
```bash
# Push code to GitHub
git add .
git commit -m "Initial commit — iSwitch Google portal"
git push origin main
```
Then:
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo `Firstmobital/iswitch_google`
3. Add these **Environment Variables** in Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lntarbxacajbwfgdidrj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (your anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (your service role key) |
| `NEXT_PUBLIC_APP_NAME` | `iSwitch Google` |
| `NEXT_PUBLIC_APP_URL` | `https://your-vercel-url.vercel.app` |

4. Click **Deploy**

---

## Adding schemes (admin workflow)
1. Login at `/auth/login` with your admin account
2. Go to **Admin → Schemes → New scheme**
3. Select model, fill pricing, cashback, EMI options
4. Set status to **Published**
5. Save — retailers see it instantly

## Approving retailers
1. When a retailer signs up, they land on the **Approval pending** screen
2. You go to **Admin → Retailers → Approvals**
3. Click **Approve** next to their name
4. They can now login and view all published schemes

---

## Folder structure
```
src/
  app/
    auth/           → login, signup, verify, pending, callback
    retailer/       → retailer portal (schemes listing, detail)
    admin/          → admin panel (schemes CRUD, retailers)
  components/
    layout/         → sidebars, bottom nav, approve button
    schemes/        → scheme card, scheme form
  lib/
    supabase/       → client, server, admin clients
    config.ts       → app name, routes (change name here)
  types/
    database.ts     → all TypeScript types
supabase/
  schema.sql        → run this once in Supabase SQL editor
```

---

## Changing the app name
Edit `src/lib/config.ts` — change `name` in `APP_CONFIG`. Done.

---

## Phase 2 (coming next)
- Orders module
- Inventory management
- Sales target tracking
- Finance EMI calculator
- WhatsApp notifications
