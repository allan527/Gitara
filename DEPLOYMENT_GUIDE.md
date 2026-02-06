# 📋 Complete Setup - 3 Simple Steps

Your GITARA BRANCH app is ready to deploy to Supabase cloud storage!

---

## 🚀 Step 1: Run SQL Script (2 minutes)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/sql/new)
2. Click "New query"
3. Copy contents from `/supabase_setup.sql`
4. Paste and click "Run"

**✅ Expected result:** "Database setup complete!"

---

## 🚀 Step 2: Deploy Edge Function (5 minutes)

### Option A: Using Supabase Dashboard (Easiest!)

1. Go to [Edge Functions](https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/functions)
2. Click "Deploy a new function"
3. Name: `server`
4. Copy code from `/supabase/functions/server/index.tsx` (936 lines)
5. Paste and deploy
6. ✅ **NO SECRETS NEEDED!** Supabase automatically provides SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY

### Option B: Using Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login and link
supabase login
supabase link --project-ref ayxpxobgwyoydntsygil

# Deploy
supabase functions deploy server --no-verify-jwt
```

**⚠️ IMPORTANT:** You do NOT need to add SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY as secrets. These are automatically provided by Supabase to all Edge Functions!

---

## 🚀 Step 3: Test Connection (1 minute)

1. Click "Retry Connection" button in the app
2. Should see ✅ "Backend Connected"
3. Or use `/test_connection.html`

**✅ Success:** Green banner shows "Backend Connected"

---

## 📘 Full Guide

For more detailed instructions, see:
- `/SUPABASE_CONNECTION_STEPS.md` - Detailed steps
- `/HOW_TO_DEPLOY_SUPABASE.md` - Complete CLI guide
- `/test_connection.html` - Test page

---

## 🎯 Quick Links

- **SQL Editor:** https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/sql/new
- **Edge Functions:** https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/functions
- **Table Editor:** https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/editor

---

## ⏱️ Total Time: ~8 Minutes

- Step 1: 2 minutes
- Step 2: 5 minutes
- Step 3: 1 minute

---

**🚀 Let's deploy your GITARA BRANCH to the cloud!**