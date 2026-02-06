# 🔑 How to Get Your SUPABASE_SERVICE_ROLE_KEY and SUPABASE_DB_URL

## 🎯 Quick Answer

Your sensitive Supabase keys are stored in your **Supabase Dashboard**, not in code files (for security).

Here's how to retrieve them:

---

## 📋 Step-by-Step Instructions

### **Step 1: Go to Your Supabase Project Dashboard**

Open this URL in your browser:
```
https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd
```

**OR**

1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Find project: `tmelmmhephgyzccezfgd`
4. Click on it

---

### **Step 2: Get SUPABASE_SERVICE_ROLE_KEY**

1. In your project dashboard, click **"Settings"** (gear icon in left sidebar)
2. Click **"API"** in the settings menu
3. Scroll down to **"Project API keys"** section
4. Look for **"service_role"** key (marked as `secret`)
5. Click the **"Copy"** button or **"Reveal"** to see it

**It looks like this:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZWxtbWhlcGhneXpjY2V6ZmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI1NTA1MywiZXhwIjoyMDgzODMxMDUzfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **IMPORTANT:** This is a **SECRET KEY** - never share it publicly or commit it to GitHub!

---

### **Step 3: Get SUPABASE_DB_URL**

**Option A: From Settings > Database**

1. In your project dashboard, click **"Settings"** (gear icon)
2. Click **"Database"** in the settings menu
3. Scroll to **"Connection string"** section
4. Look for **"URI"** or **"Connection pooling"**
5. Copy the connection string

**It looks like this:**
```
postgresql://postgres.tmelmmhephgyzccezfgd:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**OR**

**Option B: From Project Settings**

1. Click **"Settings"** → **"Database"**
2. Under **"Connection Info"**, you'll see:
   - **Host:** `aws-0-[region].pooler.supabase.com`
   - **Database name:** `postgres`
   - **Port:** `6543` (pooler) or `5432` (direct)
   - **User:** `postgres`
   
3. Construct the URL:
```
postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres
```

⚠️ **Note:** You'll need your database password that you set when creating the Supabase project.

---

## 🖼️ Visual Guide

### **Supabase Dashboard Navigation:**

```
┌─────────────────────────────────────────────┐
│  Supabase Dashboard                         │
├─────────────────────────────────────────────┤
│  Left Sidebar:                              │
│  📊 Home                                     │
│  🗄️  Table Editor                           │
│  🔐 Authentication                           │
│  📁 Storage                                  │
│  🔧 Edge Functions                           │
│  📊 SQL Editor                               │
│  ⚙️  Settings  ← CLICK HERE                 │
│     └─ API  ← For SERVICE_ROLE_KEY          │
│     └─ Database  ← For DB_URL               │
└─────────────────────────────────────────────┘
```

### **API Settings Page:**

```
⚙️ Settings > API

Project API keys
┌──────────────────────────────────────────────┐
│ anon (public)                                │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │
│ [Copy] [Reveal]                              │
├──────────────────────────────────────────────┤
│ service_role (secret) ⚠️                     │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │
│ [Copy] [Reveal]  ← CLICK HERE                │
└──────────────────────────────────────────────┘
```

### **Database Settings Page:**

```
⚙️ Settings > Database

Connection string
┌──────────────────────────────────────────────┐
│ URI                                          │
│ postgresql://postgres.tmelmmhephgyzccezfgd...│
│ [Copy]  ← CLICK HERE                         │
└──────────────────────────────────────────────┘

Connection pooling
┌──────────────────────────────────────────────┐
│ Connection string                            │
│ postgresql://postgres:[PASSWORD]@aws-0-...   │
│ [Copy]  ← OR CLICK HERE                      │
└──────────────────────────────────────────────┘
```

---

## 📝 What to Do with These Keys

### **For Figma Make Deployment (Current Setup):**

These keys are **already automatically configured** in the Figma Make environment. You don't need to do anything!

### **For External Deployment (Vercel/Netlify/etc):**

You'll need to add these as **environment variables** in your hosting platform:

**For Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add:
   - `SUPABASE_URL` = `https://tmelmmhephgyzccezfgd.supabase.co`
   - `SUPABASE_ANON_KEY` = (The public anon key from API settings)
   - `SUPABASE_SERVICE_ROLE_KEY` = (The secret service_role key)
   - `SUPABASE_DB_URL` = (The database connection string)

**For Netlify:**
1. Go to Site Settings → Environment Variables
2. Add the same variables as above

**For Self-Hosted:**
Create a `.env` file in your backend directory:
```env
SUPABASE_URL=https://tmelmmhephgyzccezfgd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@aws-0-...
```

---

## 🔐 Security Best Practices

### ✅ **DO:**
- Store these in environment variables
- Keep them in your password manager
- Only share with trusted team members
- Use different keys for development/production

### ❌ **DON'T:**
- Commit them to GitHub
- Share them publicly
- Hardcode them in frontend code
- Post them in forums or chat

---

## 🧪 Test Your Keys

### **Test SERVICE_ROLE_KEY:**

```bash
curl -X GET \
  https://tmelmmhephgyzccezfgd.supabase.co/rest/v1/kv_store_68baa523 \
  -H "apikey: YOUR_SERVICE_ROLE_KEY_HERE" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY_HERE"
```

If it works, you'll get a JSON response with data.

### **Test DB_URL:**

```bash
psql "YOUR_DB_URL_HERE" -c "SELECT 1;"
```

If it works, you'll see:
```
 ?column? 
----------
        1
(1 row)
```

---

## 📋 Complete Key Reference

Here's what you have and need:

| Variable | Status | Where to Get |
|----------|--------|--------------|
| `SUPABASE_URL` | ✅ Known | `https://tmelmmhephgyzccezfgd.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ Known | Already in `/utils/supabase/info.tsx` |
| `SUPABASE_SERVICE_ROLE_KEY` | ❓ Get from Dashboard | Settings → API → service_role key |
| `SUPABASE_DB_URL` | ❓ Get from Dashboard | Settings → Database → Connection string |

---

## 🚀 Quick Action Steps

**To get your keys right now:**

1. **Open:** https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd
2. **Login** to your Supabase account
3. **Click:** Settings (⚙️) in left sidebar
4. **For SERVICE_ROLE_KEY:**
   - Click "API"
   - Find "service_role" key
   - Click "Reveal" or "Copy"
5. **For DB_URL:**
   - Click "Database"
   - Find "Connection string" → "URI"
   - Click "Copy"
6. **Save** these keys securely!

---

## 💾 Save Your Keys Template

Copy this template and fill in your keys:

```
==================================================
WILLIAM LOANS - SUPABASE CREDENTIALS
==================================================

Project ID: tmelmmhephgyzccezfgd

SUPABASE_URL:
https://tmelmmhephgyzccezfgd.supabase.co

SUPABASE_ANON_KEY:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZWxtbWhlcGhneXpjY2V6ZmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTUwNTMsImV4cCI6MjA4MzgzMTA1M30.dBhMKrLXJzklbV25Ob582pouQ1FOlaEcGN7WK7y9fNY

SUPABASE_SERVICE_ROLE_KEY:
[PASTE FROM DASHBOARD - Settings → API → service_role]

SUPABASE_DB_URL:
[PASTE FROM DASHBOARD - Settings → Database → Connection string]

==================================================
⚠️ KEEP THIS FILE SECURE - DO NOT SHARE PUBLICLY
==================================================
```

---

## ❓ Troubleshooting

### **Problem: "I don't see the service_role key"**
**Solution:** 
- Make sure you're logged into the correct Supabase account
- Verify you're viewing the project `tmelmmhephgyzccezfgd`
- The key should be under Settings → API → Project API keys

### **Problem: "Connection string doesn't have password"**
**Solution:**
- Replace `[YOUR-PASSWORD]` with your database password
- If you forgot it, you can reset it in Settings → Database → Database password → Reset

### **Problem: "I don't have access to this project"**
**Solution:**
- Verify you created this Supabase project
- Check if someone else on your team created it
- You may need to be added as a collaborator

---

## ✅ Summary

**To get your keys:**

1. Go to: https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd
2. **SERVICE_ROLE_KEY:** Settings → API → service_role (click Reveal/Copy)
3. **DB_URL:** Settings → Database → Connection string (click Copy)
4. Save them securely
5. Add to your deployment platform if needed

**For your current Figma Make deployment:**
✅ These are already configured automatically - no action needed!

**For external deployment:**
📝 Add them as environment variables in your hosting platform

---

## 📞 Need Help?

If you're still having trouble:

1. **Check:** You're logged into the correct Supabase account
2. **Verify:** Project ID matches: `tmelmmhephgyzccezfgd`
3. **Look:** Settings → API and Settings → Database sections
4. **Reset:** Database password if needed (Settings → Database)

---

## 🎉 Next Steps

Once you have your keys:

1. ✅ Save them securely (password manager)
2. ✅ Add to deployment platform if deploying externally
3. ✅ Test the connection
4. ✅ Start using your app!

**Your William Loans system is ready to go!** 🇺🇬💰✨
