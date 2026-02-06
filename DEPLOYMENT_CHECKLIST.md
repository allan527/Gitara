# ✅ DEPLOYMENT CHECKLIST

## 🎯 YOUR MISSION: Deploy GITARA BRANCH to Supabase

---

## 📋 CHECKLIST

### ☐ STEP 1: Database Table
- [ ] Open SQL Editor
- [ ] Copy SQL from `/supabase_setup.sql`
- [ ] Paste and Run
- [ ] See "Database setup complete!"
- [ ] Verify table exists in Table Editor

**Link:** https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/sql/new

---

### ☐ STEP 2: Edge Function
- [ ] Open Edge Functions
- [ ] Click "Create a new function"
- [ ] Name it `server`
- [ ] Copy code from `/supabase/functions/server/index.tsx`
- [ ] Paste into Supabase
- [ ] Click "Deploy function"
- [ ] Wait for deployment
- [ ] Go to Settings → Secrets
- [ ] Add `SUPABASE_URL`
- [ ] Add `SUPABASE_ANON_KEY`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Click "Save"

**Link:** https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/functions

---

### ☐ STEP 3: Test Connection
- [ ] Refresh GITARA BRANCH app
- [ ] Look for GREEN banner: "✅ Backend Connected"
- [ ] Add a test client
- [ ] Check Table Editor for data
- [ ] Celebrate! 🎉

**Link:** https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/editor

---

## 🎯 SUCCESS CRITERIA

**You know it worked when:**
1. ✅ Green banner shows "Backend Connected"
2. ✅ Test client appears in Supabase table
3. ✅ No errors in browser console
4. ✅ Data persists in cloud

---

## 🆘 TROUBLESHOOTING

### Yellow Banner?
→ Edge Function not deployed yet (complete Step 2)

### Red Banner?
→ Missing secrets (check Step 2, secrets section)

### "CORS Error"?
→ Redeploy Edge Function with correct code

### "Unauthorized"?
→ Double-check SUPABASE_ANON_KEY matches

---

## ⏱️ TIME ESTIMATE

- Step 1: 2 minutes
- Step 2: 5 minutes
- Step 3: 1 minute
- **Total: ~8 minutes**

---

## 📞 QUICK REFERENCE

### Environment Variables (for Step 2 Secrets):
```
SUPABASE_URL = https://ayxpxobgwyoydntsygil.supabase.co

SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHB4b2Jnd3lveWRudHN5Z2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MDc0NzIsImV4cCI6MjA1NDM4MzQ3Mn0.sb_publishable_NuD42Ywib3fv1WAuwjtTxg_1f8UXBZR

SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHB4b2Jnd3lveWRudHN5Z2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODgwNzQ3MiwiZXhwIjoyMDU0MzgzNDcyfQ.sb_secret_FYQQB0xDrnt25jdmhBDtCg_UBquDJFW
```

### Table Name:
```
kv_store_68baa523
```

### Function Name:
```
server
```

---

## 🎊 READY TO DEPLOY?

**Open `/START_HERE.md` for step-by-step instructions!**

**Or use `/DEPLOY_NOW.md` for detailed guide!**

**You got this! 💪🇺🇬**
