# 🚀 EDGE FUNCTION CODE FOR SUPABASE

## 📍 WHERE TO FIND THE CODE

The Edge Function code is located at:
```
/supabase/functions/server/index.tsx
```

**If you can't see this folder structure:**
1. Look for a folder named `supabase` in your project root
2. Inside it, find `functions` folder
3. Inside that, find `server` folder
4. The file `index.tsx` is inside

---

## 📋 WHAT TO DO WITH THIS FILE

### **STEP 1: Open the file**
Navigate to `/supabase/functions/server/index.tsx` in your project

### **STEP 2: Copy ALL the code**
Select all the code in that file (it's about 900+ lines)

### **STEP 3: Paste into Supabase**
1. Go to: https://supabase.com/dashboard/project/ayxpxobgwyoydntsygil/functions
2. Click "Create a new function"
3. Name: `server`
4. Paste all the code
5. Click "Deploy function"

---

## ⚠️ IMPORTANT NOTES

### **DO NOT COPY JUST THIS FILE!**
There are TWO files you need to be aware of:
1. `/supabase/functions/server/index.tsx` - Main server code (THIS is what you deploy)
2. `/supabase/functions/server/kv_store.tsx` - Helper file (referenced by index.tsx)

**When deploying via Supabase Dashboard:**
- You only need to copy `index.tsx`
- The line `import * as kv from "./kv_store.tsx";` will need to be handled

---

## 🔧 HOW TO DEPLOY (EASIEST METHOD)

Since the file has dependencies, here's the **EASIEST** way:

### **Option 1: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref ayxpxobgwyoydntsygil

# Deploy (this handles dependencies automatically)
supabase functions deploy server --no-verify-jwt

# Add secrets
supabase secrets set SUPABASE_URL=https://ayxpxobgwyoydntsygil.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHB4b2Jnd3lveWRudHN5Z2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MDc0NzIsImV4cCI6MjA1NDM4MzQ3Mn0.sb_publishable_NuD42Ywib3fv1WAuwjtTxg_1f8UXBZR
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHB4b2Jnd3lveWRudHN5Z2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODgwNzQ3MiwiZXhwIjoyMDU0MzgzNDcyfQ.sb_secret_FYQQB0xDrnt25jdmhBDtCg_UBquDJFW
```

**Done! ✅**

---

### **Option 2: Manual Deployment (Dashboard)**

If you want to use the Supabase Dashboard instead of CLI:

1. **Combine the two files into one**

Since the dashboard doesn't handle file imports well, you need to inline the `kv_store.tsx` code into `index.tsx`.

I'll create a combined version for you below:

---

## 📦 COMBINED FILE (FOR MANUAL DEPLOYMENT)

I'll create a single file that combines everything...

**Actually, let me create it for you in the next file!**

See: `/EDGE_FUNCTION_COMBINED.tsx`

---

## 💡 RECOMMENDATION

**Use Option 1 (CLI)** - It's much easier and handles everything automatically!

If you don't want to install CLI, wait for the combined file I'm creating next.

---

## 📞 QUICK REFERENCE

**Project ID:** `ayxpxobgwyoydntsygil`

**Edge Function Name:** `server`

**Environment Secrets Needed:**
1. `SUPABASE_URL`
2. `SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`

(Values provided in other deployment guides)

---

**Next step:** Use Supabase CLI OR wait for the combined file!
