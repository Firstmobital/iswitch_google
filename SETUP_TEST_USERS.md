# Test Users Setup Guide

## Users to Create

| Email | Role | Purpose | Approval Status |
|-------|------|---------|-----------------|
| mail@techwheels.in | admin | Super Admin - manage retailers & schemes | approved |
| vinodexodus@gmail.com | retailer | Test Retailer - view schemes & submit requests | approved |

---

## Setup Instructions

### Step 1: Create Supabase Auth Users

Go to: https://supabase.com/dashboard → Your Project → Authentication → Users

Click **"Create a new user"** and add:

**User 1 (Admin):**
- Email: `mail@techwheels.in`
- Password: `Test@12345` (change after first login)
- Auto Confirm User: ✅ Check this

**User 2 (Retailer):**
- Email: `vinodexodus@gmail.com`
- Password: `Test@12345` (change after first login)
- Auto Confirm User: ✅ Check this

### Step 2: Update Profiles with SQL

Go to: https://supabase.com/dashboard → Your Project → SQL Editor

Run this SQL script to create/update their profiles:

```sql
-- Super Admin
INSERT INTO profiles (id, email, full_name, shop_name, phone, city, role, approval_status, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'mail@techwheels.in'),
  'mail@techwheels.in',
  'Techwheels Admin',
  NULL,
  '+91-XXXXXXXXXX',
  'Bangalore',
  'admin'::user_role,
  'approved'::approval_status,
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  approval_status = 'approved'::approval_status,
  is_active = true;

-- Test Retailer
INSERT INTO profiles (id, email, full_name, shop_name, phone, city, role, approval_status, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'vinodexodus@gmail.com'),
  'vinodexodus@gmail.com',
  'Vinod Kumar',
  'Exodus Mobile Store',
  '+91-98765-43210',
  'Delhi',
  'retailer'::user_role,
  'approved'::approval_status,
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'retailer'::user_role,
  approval_status = 'approved'::approval_status,
  is_active = true;

-- Verify creation
SELECT id, email, full_name, shop_name, role, approval_status, is_active FROM profiles 
WHERE email IN ('mail@techwheels.in', 'vinodexodus@gmail.com');
```

### Step 3: Test Login

**Admin Frontend:**
1. Go to https://iswitch-google.vercel.app/auth/login (or localhost:3000 for local dev)
2. Email: `mail@techwheels.in`
3. Password: `Test@12345`
4. Should redirect to `/admin` dashboard

**Retailer Frontend:**
1. Go to https://iswitch-google.vercel.app/auth/login
2. Email: `vinodexodus@gmail.com`
3. Password: `Test@12345`
4. Should redirect to `/retailer/schemes` dashboard

---

## Notes

- First time users won't see pending approval screen (already approved)
- Both passwords are set to `Test@12345` - **Change in production**
- Admin can access `/admin` routes to manage retailers & schemes
- Retailer can access `/retailer` routes to view schemes
- For additional test users, follow same signup → SQL update process

## For Future Test Users

Just use the signup flow in the app:
1. Go to `/auth/signup`
2. Fill retailer details
3. Verify email
4. Sign in (will show "pending approval" screen)
5. Admin approves via `/admin/retailers`
6. Retailer can then access `/retailer` routes

Or use SQL INSERT if you want to skip the approval workflow.
