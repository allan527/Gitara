# 📋 Complete Setup - 3 Simple Steps

## 🚀 Step 1: Run SQL Script (2 minutes)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/sql/new)
2. Click "New query"
3. Copy contents from `/supabase_setup.sql`
4. Paste and click "Run"

✅ **Expected result:** "Database setup complete!"

---

## 🚀 Step 2: Deploy Edge Function (5 minutes)

1. Go to [Edge Functions](https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/functions)
2. Click "Deploy a new function"
3. Name: `server`
4. Copy code from `/supabase/functions/server/index.tsx`
5. Paste and deploy

**✅ NO SECRETS NEEDED!**  
Supabase automatically provides these environment variables to all Edge Functions:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

You do NOT need to manually add them as secrets!

---

## 🚀 Step 3: Test Connection (1 minute)

1. Click "Retry Connection" button above
2. Should see ✅ "Backend Connected"
3. Or use `/test_connection.html`

---

## 📘 Full Guide

See `/SUPABASE_CONNECTION_STEPS.md` for detailed instructions.