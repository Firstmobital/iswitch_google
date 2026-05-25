# CLAUDE CODE — iSwitch Google: Full Project Instructions
# Google Pixel Distributor Management Portal
# Hand this file to Claude Code after connecting the GitHub repo.
# Last updated: May 2026

---

## WHO YOU ARE AND WHAT THIS PROJECT IS

You are the lead developer for **iSwitch Google**, a Google Pixel mobile distributor management
portal built for a distributor in India. The project is already scaffolded and partially built.
Your job is to make it fully working, fix any issues, and extend it as instructed.

The owner (Firstmobital) is a non-technical Google Pixel distributor. They will give you feature
requests in plain English. You must implement them completely — no half-built features, no TODOs
left behind, no "you can add X later" in comments. Every feature must work end-to-end.

---

## TECH STACK — NEVER CHANGE THESE

- **Framework**: Next.js 14 with App Router (not Pages Router)
- **Language**: TypeScript (strict mode, no `any` except where truly unavoidable)
- **Database**: Supabase (PostgreSQL) — project URL: https://lntarbxacajbwfgdidrj.supabase.co
- **Auth**: Supabase Auth (email/password + email verification)
- **Styling**: Tailwind CSS — utility classes only, no CSS modules, no styled-components
- **UI components**: lucide-react for icons, custom components only — no shadcn, no MUI, no Chakra
- **Forms**: react-hook-form + zod for all forms
- **Package manager**: npm (never yarn, never pnpm)
- **Deployment**: Vercel
- **Mode**: Light mode only — no dark mode classes

---

## PROJECT STRUCTURE — DO NOT REORGANIZE

```
src/
  app/
    auth/
      login/page.tsx          ← Retailer login
      signup/page.tsx         ← Retailer signup
      verify/page.tsx         ← Email sent confirmation
      pending/page.tsx        ← Approval pending screen
      callback/route.ts       ← Supabase auth callback handler
      layout.tsx              ← Centered auth layout
    retailer/
      layout.tsx              ← Sidebar + mobile bottom nav layout
      page.tsx                ← Retailer dashboard/home
      schemes/
        page.tsx              ← All published schemes as model cards
        [id]/page.tsx         ← Individual scheme full detail
    admin/
      layout.tsx              ← Dark sidebar admin layout
      page.tsx                ← Admin dashboard with stats
      schemes/
        page.tsx              ← Schemes table with edit/preview
        new/page.tsx          ← Create new scheme
        [id]/edit/page.tsx    ← Edit existing scheme
      retailers/
        page.tsx              ← Retailers list + approval actions
    globals.css               ← Tailwind + global utility classes
    layout.tsx                ← Root layout
    page.tsx                  ← Redirects to /auth/login
  components/
    layout/
      RetailerSidebar.tsx     ← Left sidebar for retailer portal (desktop)
      AdminSidebar.tsx        ← Dark left sidebar for admin panel
      MobileBottomNav.tsx     ← Bottom tab bar for mobile retailer view
      ApproveButton.tsx       ← Approve/reject retailer client component
    schemes/
      SchemeCard.tsx          ← Model card shown in schemes grid
      SchemeForm.tsx          ← Create/edit scheme form (shared)
    ui/                       ← Add new shared UI components here
  lib/
    supabase/
      client.ts               ← Browser Supabase client
      server.ts               ← Server Supabase client (uses cookies)
      admin.ts                ← Service role client (admin ops only)
    config.ts                 ← APP_CONFIG and ROUTES — single source of truth
  types/
    database.ts               ← All TypeScript interfaces matching DB schema
  middleware.ts               ← Route protection and role-based redirects
supabase/
  schema.sql                  ← Full DB schema (already run, do not re-run)
```

---

## DATABASE SCHEMA — ALREADY EXISTS IN SUPABASE

These tables exist. Do not alter the schema unless the owner explicitly asks for a schema change,
and if you do, always write a migration SQL snippet they can run in Supabase SQL Editor.

### Tables

**profiles** — one row per user (auto-created on signup via trigger)
- id (uuid, FK to auth.users)
- email, full_name, shop_name, phone, city (text)
- role: enum('retailer', 'admin')
- approval_status: enum('pending', 'approved', 'rejected')
- is_active (bool), created_at, updated_at

**mobile_models** — Google Pixel models
- id, name, storage, color_options, image_url
- is_active (bool), sort_order (int)
- Seeded with: Pixel 9a, Pixel 10, Pixel 10 Pro, Pixel 10 Pro XL, Pixel 10 Pro Fold, Pixel 10a

**schemes** — monthly scheme per model
- id, model_id (FK), status: enum('draft','published','expired')
- mop, dealer_landing, consumer_offer_gst, consumer_offer_note
- cashback_hdfc_emi, cashback_hdfc_full
- min_swipe, max_swipe, swipe_type: enum('Full Swipe','NCEMI','Full Swipe/NCEMI')
- emi_months (text array e.g. ['6','9','12'])
- valid_from, valid_to (dates), notes, created_by (FK)

**exchange_offers** — exchange bonus per scheme
- id, scheme_id (FK), platform (text e.g. 'Servify', 'Cashify')
- bonus_label, tier_3_10k, tier_10_15k, tier_15k_plus (numeric)

**finance_schemes** — loan/EMI partners per scheme
- id, scheme_id (FK), partner: enum('Bajaj Finance','IDFC Paper Finance','TVS Credit')
- tenure_options (text), dealer_charge_pct (numeric), notes

### RLS Rules (already set up)
- Retailers can only SELECT published schemes, their own profile
- Admins can do everything
- Never bypass RLS in server components — use the server client
- Only use the admin client (service role) in API routes for admin operations

---

## ENVIRONMENT VARIABLES

Already set in `.env.local` (local) and must be set in Vercel dashboard (production):

```
NEXT_PUBLIC_SUPABASE_URL=https://lntarbxacajbwfgdidrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudGFyYnhhY2FqYndmZ2RpZHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTg0OTIsImV4cCI6MjA5NTI3NDQ5Mn0.ubPVsa85L_E8jMtW1cUpmjXqL9wbEj34gx_I7LOv9JA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudGFyYnhhY2FqYndmZ2RpZHJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTY5ODQ5MiwiZXhwIjoyMDk1Mjc0NDkyfQ.rTpACP4ftqUHlM6e_9M4tGe6YFdEwppmL8TkWk1IqEk
NEXT_PUBLIC_APP_NAME=iSwitch Google
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

---

## DESIGN SYSTEM — FOLLOW STRICTLY

### Colors
- Primary brand: `#4285F4` (Google blue) — Tailwind class `bg-brand-500`
- Brand scale: brand-50 through brand-900 (defined in tailwind.config.ts)
- Success green: Tailwind `green-*` classes
- Warning amber: Tailwind `amber-*` classes
- Danger red: Tailwind `red-*` classes
- Gray neutrals: Tailwind `gray-*` classes

### Typography
- Font: Inter (loaded via Google Fonts in globals.css)
- Body: text-sm (14px), text-gray-700
- Headings: text-xl font-semibold text-gray-900 (page titles)
- Muted: text-xs text-gray-500 (labels, metadata)

### Components (already defined as Tailwind @layer in globals.css)
Use these class names consistently:
- `.card` → white card with border and subtle shadow
- `.btn-primary` → full-width blue button
- `.btn-secondary` → full-width white outlined button
- `.btn-danger` → red outlined button
- `.input-field` → styled text/select/textarea input
- `.label` → form field label
- `.badge-published` → green pill for published status
- `.badge-draft` → gray pill for draft status
- `.badge-pending` → amber pill for pending status
- `.badge-approved` → green pill for approved status
- `.badge-rejected` → red pill for rejected status

### Layout rules
- Retailer sidebar: white, 224px wide on md+, hidden on mobile
- Admin sidebar: bg-gray-900 (dark), 224px wide on md+
- Mobile: bottom tab navigation, no sidebar
- Max content width: max-w-4xl for most pages, max-w-2xl for forms
- Padding: p-4 md:p-6 on all page wrappers
- Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 for scheme cards
- Always responsive: mobile → tablet → desktop

### Indian locale rules
- All currency: Indian Rupee ₹ symbol, formatted with toLocaleString('en-IN')
- Example: `₹1,09,999` not `₹109,999`
- Dates: toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
- Phone numbers: Indian format (10 digits)

---

## AUTHENTICATION FLOW — DO NOT CHANGE LOGIC

```
User visits / → middleware redirects to /auth/login

Signup flow:
  /auth/signup → supabase.auth.signUp() with metadata →
  profile auto-created via DB trigger →
  /auth/verify (check email) →
  email link → /auth/callback →
  profile approval_status is 'pending' →
  /auth/pending (wait for admin approval)

Login flow:
  /auth/login → supabase.auth.signInWithPassword() →
  check profile.role and approval_status →
  admin → /admin
  approved retailer → /retailer/schemes
  pending retailer → /auth/pending

Middleware protects:
  /retailer/* → must be logged in + approved retailer (or admin)
  /admin/* → must be logged in + role === 'admin'
  /auth/* → logged-in users redirected to their home
```

---

## SUPABASE CLIENT USAGE RULES

**In Server Components and Route Handlers:**
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()
```

**In Client Components ('use client'):**
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

**For admin operations (bypassing RLS) — only in API routes:**
```typescript
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()
```

**Never use the admin client in client components or server components directly.**
**Never hardcode Supabase URLs or keys — always use process.env.**

---

## CONFIG — SINGLE SOURCE OF TRUTH

Everything brand-related lives in `src/lib/config.ts`:
```typescript
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'iSwitch Google',
  company: 'iSwitch Distributors',
  tagline: 'Authorized Google Pixel Distributor Portal',
  supportEmail: 'support@iswitchgoogle.com',
  schemeNote: 'Cashback applicable via Pinelab terminals at select stores.',
}

export const ROUTES = {
  login: '/auth/login',
  signup: '/auth/signup',
  pending: '/auth/pending',
  verify: '/auth/verify',
  retailer: { home: '/retailer', schemes: '/retailer/schemes' },
  admin: {
    home: '/admin',
    schemes: '/admin/schemes',
    schemesNew: '/admin/schemes/new',
    retailers: '/admin/retailers',
  },
}
```
**Always import from config.ts. Never hardcode route strings or app names.**

---

## WHAT IS ALREADY BUILT (DO NOT REBUILD)

1. ✅ Auth pages: login, signup, verify, pending, callback
2. ✅ Retailer layout with sidebar (desktop) and bottom nav (mobile)
3. ✅ Retailer dashboard (home page with stats)
4. ✅ Schemes listing page with model cards grid
5. ✅ Scheme detail page with full scheme breakdown
6. ✅ Admin layout with dark sidebar
7. ✅ Admin dashboard with stats
8. ✅ Admin schemes table (list, create, edit, delete)
9. ✅ Admin retailers page with approve/reject buttons
10. ✅ Middleware for route protection and role checks
11. ✅ All Supabase clients (browser, server, admin)
12. ✅ All TypeScript types in database.ts
13. ✅ Tailwind config with brand colors
14. ✅ Global CSS with component classes

---

## WHAT NEEDS TO BE DONE FIRST (IMMEDIATE TASKS)

When Claude Code first opens this project, run these checks in order:

### Task 1: Verify the app runs
```bash
npm install
npm run build
```
Fix any TypeScript errors or missing imports before doing anything else.

### Task 2: Fix the SchemeForm to handle exchange_offers and finance_schemes
The current SchemeForm (`src/components/schemes/SchemeForm.tsx`) saves the main scheme but does
NOT yet save exchange_offers and finance_schemes to their separate tables.

Add this to the SchemeForm onSubmit function after saving the scheme:

For exchange offers — after getting schemeId, delete existing and re-insert:
```typescript
// Delete existing exchange offers for this scheme
await supabase.from('exchange_offers').delete().eq('scheme_id', schemeId)

// Insert Servify offer
await supabase.from('exchange_offers').insert({
  scheme_id: schemeId,
  platform: 'Servify',
  bonus_label: 'Flat bonus',
  tier_3_10k: Number(data.servify_3_10k || 0),
  tier_10_15k: Number(data.servify_10_15k || 0),
  tier_15k_plus: Number(data.servify_15k_plus || 0),
})

// Insert Cashify offer
await supabase.from('exchange_offers').insert({
  scheme_id: schemeId,
  platform: 'Cashify',
  bonus_label: 'Upto bonus',
  tier_3_10k: Number(data.cashify_3_10k || 0),
  tier_10_15k: Number(data.cashify_10_15k || 0),
  tier_15k_plus: Number(data.cashify_15k_plus || 0),
})
```

Add exchange offer fields to the Zod schema and form UI:
- servify_3_10k, servify_10_15k, servify_15k_plus (number fields)
- cashify_3_10k, cashify_10_15k, cashify_15k_plus (number fields)

For finance schemes — delete existing and re-insert based on checkboxes:
```typescript
await supabase.from('finance_schemes').delete().eq('scheme_id', schemeId)

const financePartners = []
if (data.bajaj_enabled) financePartners.push({
  scheme_id: schemeId,
  partner: 'Bajaj Finance',
  tenure_options: data.bajaj_tenures,
  dealer_charge_pct: 2.0,
})
if (data.idfc_enabled) financePartners.push({
  scheme_id: schemeId,
  partner: 'IDFC Paper Finance',
  tenure_options: data.idfc_tenures,
  dealer_charge_pct: 2.0,
})
if (data.tvs_enabled) financePartners.push({
  scheme_id: schemeId,
  partner: 'TVS Credit',
  tenure_options: data.tvs_tenures,
  dealer_charge_pct: 2.0,
})
if (financePartners.length > 0) {
  await supabase.from('finance_schemes').insert(financePartners)
}
```

Add these fields to the form UI in a "Finance partners" section with checkboxes for each partner
and a text input for their tenure options (e.g. "9/12/15/18/24").

### Task 3: Add the May 2026 scheme data
After fixing the form, enter the actual scheme data from the May 2026 scheme letter:

| Model | MOP | Dealer Landing | HDFC EMI CB | HDFC Full CB | Min Swipe | Max Swipe | EMI Months |
|-------|-----|---------------|-------------|--------------|-----------|-----------|------------|
| Pixel 9a 256GB | 49999 | 46999 | 3000 | NA | 25999 | 49999 | 6 |
| Pixel 10 | 79999 | 75199 | 5000 | 4000 | 48749 | 79999 | 6,9,12 |
| Pixel 10 Pro | 109999 | 103399 | 10000 | 8000 | 71499 | 109999 | 6,9,12 |
| Pixel 10 Pro XL | 124999 | 117499 | 10000 | 8000 | 81249 | 124999 | 6,9,12 |
| Pixel 10 Pro Fold | 172999 | 162619 | 10000 | 8000 | 112449 | 172999 | 6,9,12 |
| Pixel 10a | 49999 | 46999 | 2000 | 1000 | 32499 | 49999 | 6 |

Exchange offers (Servify — all 10 series, flat ₹5000 regardless of old device tier):
- Pixel 10, Pro, Pro XL, Pro Fold: tier_3_10k=5000, tier_10_15k=5000, tier_15k_plus=5000
- Pixel 10a: tier_3_10k=1000, tier_10_15k=1000, tier_15k_plus=1000

Exchange offers (Cashify — all 10 series):
- Pixel 10, Pro, Pro XL, Pro Fold: tier_3_10k=5000, tier_10_15k=6000, tier_15k_plus=7000
- Pixel 10a: tier_3_10k=1000, tier_10_15k=1000, tier_15k_plus=1000

Finance (all applicable models):
- Bajaj Finance: tenures "9/12/15/18/24/3/18/4/24/8/30/6 & 36/12", dealer charge 2%
- IDFC Paper Finance: tenures "6/9/12/15/18/24/3/18/1/24/2/24/3/15/3", dealer charge 2%
- TVS Credit: tenures "9/12/18/24/1/24/2/24/3/24/4/15/3/18/6/24/8", dealer charge 2%

Consumer offer note for all: "Valid on activation (without GST)"
Valid from: 2026-05-01, Valid to: 2026-05-31
Status: published

You can insert this via a SQL migration or via the admin UI — SQL is faster:
Write a file `supabase/seed_may2026.sql` with INSERT statements and tell the owner to run it.

### Task 4: Verify all pages load without errors
Test these routes manually or via build:
- /auth/login ✓
- /auth/signup ✓
- /retailer/schemes ✓
- /retailer/schemes/[any-scheme-id] ✓
- /admin ✓
- /admin/schemes ✓
- /admin/schemes/new ✓
- /admin/schemes/[id]/edit ✓
- /admin/retailers ✓

---

## CODING STANDARDS — ALWAYS FOLLOW

### TypeScript
- Use proper types from `src/types/database.ts` — never use `any` for DB types
- When Supabase returns joined data, cast it: `const model = scheme.mobile_models as MobileModel`
- Always handle null/undefined from Supabase queries with `?? fallback` or early returns
- Use `async/await`, never `.then().catch()` chains

### Components
- Server components by default — only add `'use client'` when you need:
  - useState / useEffect / useRef
  - Event handlers (onClick, onChange, onSubmit)
  - Browser APIs
  - useRouter, usePathname
- Never fetch data in client components — use server components or pass data as props
- Forms are always client components using react-hook-form

### Error handling
- Always show user-friendly error messages in forms (never `console.error` only)
- Use a red error box: `<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">`
- For loading states, disable the submit button and show "Saving…" text

### Navigation
- Use `next/link` for internal links, never `<a href>`
- After form submit success, use `router.push(ROUTES.xxx)` then `router.refresh()`
- Never use `window.location.href` for navigation

### Data fetching
- Server components: `const supabase = createClient()` then `await supabase.from(...).select()`
- Always select only needed columns — never `select('*')` on large tables in production
- Use `.single()` when expecting one row, handle the error case

### Responsive design
- Always use: `className="... sm:... md:... lg:..."`
- Mobile first — base classes are for mobile, then add breakpoints
- Test mental model: phone (320px), tablet (768px), laptop (1280px)

---

## PHASE 2 FEATURES — BUILD THESE WHEN ASKED

The owner will ask for these one by one. When they do, implement completely:

### Orders module
New tables needed (write migration SQL):
```sql
create table orders (
  id uuid primary key default uuid_generate_v4(),
  retailer_id uuid references profiles(id),
  model_id uuid references mobile_models(id),
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  total_amount numeric(10,2) not null,
  status text not null default 'pending', -- pending, confirmed, dispatched, delivered, cancelled
  notes text,
  ordered_at timestamptz default now(),
  updated_at timestamptz default now()
);
```
Pages to build:
- `/retailer/orders` — list of retailer's own orders with status tracking
- `/admin/orders` — all orders, update status

### Inventory module
New table:
```sql
create table inventory (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid references mobile_models(id),
  stock_quantity integer not null default 0,
  reserved_quantity integer not null default 0,
  updated_at timestamptz default now()
);
```
Pages:
- `/admin/inventory` — manage stock per model
- Show available stock on retailer scheme cards

### Sales targets module
New table:
```sql
create table sales_targets (
  id uuid primary key default uuid_generate_v4(),
  retailer_id uuid references profiles(id),
  model_id uuid references mobile_models(id),
  target_quantity integer not null,
  achieved_quantity integer not null default 0,
  period_month integer not null, -- 1-12
  period_year integer not null,
  created_at timestamptz default now()
);
```
Pages:
- `/admin/targets` — set targets per retailer per model per month
- `/retailer/targets` — retailer sees their own targets vs achievement

### Finance EMI calculator
New page: `/retailer/calculator`
- Select model → auto-fills MOP
- Select finance partner → shows tenure options
- Input: down payment amount
- Output: monthly EMI, total amount, dealer charge
- Formula: flat rate EMI = (Principal × Rate × Tenure) / 100

### Reports module
- `/admin/reports` — sales summary by model, by retailer, by month
- Export to CSV using native browser download (no libraries needed)
- Retailer-wise: total orders, total value, achievement vs target

---

## HOW TO ADD NEW FEATURES (PATTERN TO FOLLOW)

When the owner asks for a new feature, always follow this exact pattern:

1. **Write migration SQL** if new tables/columns are needed → save to `supabase/migration_YYYYMMDD_description.sql`
2. **Update types** in `src/types/database.ts` with new interfaces
3. **Update RLS** in the migration SQL — retailers see own data, admins see all
4. **Build server component** page first (data fetching)
5. **Add client components** only for interactive parts (forms, buttons)
6. **Add route to sidebar** in RetailerSidebar.tsx or AdminSidebar.tsx
7. **Add route to ROUTES** in config.ts
8. **Test the full flow** before declaring done

---

## COMMON TASKS THE OWNER WILL ASK

### "Update the scheme for next month"
→ In admin panel: Schemes → create new scheme per model, set new valid_from/valid_to, set status
   to 'draft', fill all fields, then publish. Old schemes auto-expire (no deletion needed).
→ OR write a SQL migration to INSERT new rows.

### "A retailer is not getting access"
→ Check: Admin → Retailers → find by email → click Approve.
→ Also check: Supabase Auth → Users → is email verified? If not, resend from there.

### "Change the app name"
→ Edit `src/lib/config.ts` → change `name` in APP_CONFIG → also update `NEXT_PUBLIC_APP_NAME` in Vercel env vars → redeploy.

### "Add a new Google Pixel model"
→ Admin → Models (not yet built — add this to Task list if asked)
→ OR: run SQL: `INSERT INTO mobile_models (name, storage, sort_order) VALUES ('Pixel X', '128 GB', 7);`

### "Show exchange offers on the scheme card"
→ Update SchemeCard.tsx to fetch and display exchange_offers data from the joined query.

### "Make the scheme downloadable as PDF"
→ Add a print stylesheet or use browser's `window.print()` with `@media print` CSS rules.
→ The scheme detail page (/retailer/schemes/[id]) should have a "Download / Print" button.
→ Do NOT use any PDF library — use CSS print media queries + window.print().

---

## DEPLOYMENT CHECKLIST (RUN BEFORE EVERY PRODUCTION DEPLOY)

```bash
# 1. Ensure no TypeScript errors
npm run build

# 2. Check all env vars are set in Vercel:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_ROLE_KEY
#    NEXT_PUBLIC_APP_NAME
#    NEXT_PUBLIC_APP_URL

# 3. Verify Supabase redirect URLs include production domain:
#    Authentication → Settings → Redirect URLs:
#    https://your-vercel-url.vercel.app/auth/callback

# 4. Push to main branch (Vercel auto-deploys)
git add .
git commit -m "description of changes"
git push origin main
```

---

## DO NOT EVER DO THESE THINGS

- ❌ Never use `pages/` directory — this is App Router only
- ❌ Never install shadcn/ui, MUI, Chakra, Ant Design, or any UI library
- ❌ Never use CSS modules or styled-components
- ❌ Never hardcode Supabase keys or URLs in source code
- ❌ Never use `getServerSideProps` or `getStaticProps` — use server components
- ❌ Never use the admin Supabase client in client-side components
- ❌ Never commit `.env.local` to git (it's in .gitignore)
- ❌ Never add dark mode styles (owner chose light mode only)
- ❌ Never use `yarn` or `pnpm` — always `npm`
- ❌ Never leave TypeScript errors in the codebase
- ❌ Never create mock/fake data in components — always fetch from Supabase
- ❌ Never use `useEffect` for data fetching — use server components
- ❌ Never use `window.location` for navigation — use next/navigation
- ❌ Never format currency without Indian locale: always `.toLocaleString('en-IN')`

---

## GITHUB REPO

URL: https://github.com/Firstmobital/iswitch_google
Branch: main (auto-deploys to Vercel on push)
Owner: Firstmobital

---

## QUICK REFERENCE — KEY FILE LOCATIONS

| What | Where |
|------|-------|
| Change app name | `src/lib/config.ts` → APP_CONFIG.name |
| Add a route | `src/lib/config.ts` → ROUTES |
| Add sidebar nav item | `src/components/layout/RetailerSidebar.tsx` or AdminSidebar.tsx |
| Add a DB type | `src/types/database.ts` |
| Protect a new route | `src/middleware.ts` |
| Global CSS classes | `src/app/globals.css` |
| Brand colors | `tailwind.config.ts` |
| Supabase browser client | `src/lib/supabase/client.ts` |
| Supabase server client | `src/lib/supabase/server.ts` |
| Supabase admin client | `src/lib/supabase/admin.ts` |
| DB schema | `supabase/schema.sql` |

---

## FINAL NOTE FOR CLAUDE CODE

The owner of this project is a mobile distributor, not a developer. When they describe a feature,
translate it into proper implementation. When something is broken, fix the root cause — not
the symptom. When in doubt about UI placement, follow the existing patterns in the codebase.

Every change must leave the app in a working, deployable state. Run `npm run build` before
declaring any task complete. If there are build errors, fix them before moving on.

The goal: a production-grade distributor management portal that a non-technical owner can
actually use to manage their Google Pixel retail network across India.
