# GITARA BRANCH - Supabase Backend Setup Guide

## 🚀 Overview

Your GITARA BRANCH loan management system is now configured to work with Supabase as the backend database. The app currently runs in **LOCAL MODE** (data stored in browser memory) until you complete the Supabase setup.

## 📋 Prerequisites

1. A Supabase account (free tier available)
2. Supabase CLI installed (optional, for deploying Edge Functions)
3. Africa's Talking account (optional, for SMS functionality)

---

## 🔧 Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com
   - Sign in or create an account
   - Click "New Project"

2. **Project Setup**
   - **Organization**: Select or create one
   - **Name**: `gitara-branch` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to Uganda (e.g., Frankfurt, London)
   - **Pricing Plan**: Free tier is fine to start
   - Click "Create new project"

3. **Wait for provisioning** (takes 1-2 minutes)

---

## 🔑 Step 2: Get Your API Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:

   ```
   Project URL: https://xxxxx.supabase.co
   Project ID: xxxxx (extract from URL)
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (keep this secret!)
   ```

---

## 📊 Step 3: Database Setup

The KV store table is already set up automatically. But you can verify:

1. Go to **Database** → **Tables** in Supabase dashboard
2. You should see a table named: `kv_store_68baa523`
3. If it doesn't exist, it will be created automatically when you first use the app

**Table Structure:**
- `key` (text, primary key) - Unique identifier
- `value` (jsonb) - The data stored as JSON
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## 🌐 Step 4: Deploy Edge Function (Backend Server)

### Option A: Using Supabase Dashboard (Easiest)

1. Go to **Edge Functions** in your Supabase dashboard
2. Click **Deploy a new function**
3. **Function name**: `server`
4. **Copy the code** from `/supabase/functions/server/index.tsx`
5. Click **Deploy function**

### Option B: Using Supabase CLI (Recommended for developers)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Deploy the Edge Function
supabase functions deploy server

# Verify deployment
supabase functions list
```

---

## 🔐 Step 5: Set Environment Variables

### In Supabase Dashboard:

1. Go to **Project Settings** → **Edge Functions**
2. Click **Add secret** and add these:

   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc... (your anon key)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your service role key)
   SUPABASE_DB_URL=(auto-provided, check Connection String)
   ```

### For SMS (Optional):

Add these if you want SMS functionality:

```
AFRICASTALKING_API_KEY=your_api_key_here
AFRICASTALKING_USERNAME=your_username_here
```

**How to get Africa's Talking credentials:**
1. Visit: https://africastalking.com
2. Sign up / Login
3. Go to Dashboard → Settings → API Key
4. Copy API Key and Username

---

## 🖥️ Step 6: Configure Frontend

### For Local Development:

Create a `.env` file in your project root:

```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
```

### For Production (Figma Make):

The environment variables will be automatically set by the deployment system. You just need to:

1. Ensure `/utils/supabase/info.tsx` uses environment variables
2. The config is already set up in `/src/app/config/supabase.ts`

---

## ✅ Step 7: Test the Connection

1. **Refresh your app**
2. You should see a **green banner** saying "✅ Backend Connected"
3. If you see an **orange banner**, backend is not configured yet
4. If you see a **red banner**, there's a connection issue

### Test Backend Health:

Open browser console and run:
```javascript
fetch('https://your-project-id.supabase.co/functions/v1/make-server-68baa523/health')
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T..."
}
```

---

## 📱 Step 8: SMS Setup (Optional)

### Get Africa's Talking Account:

1. **Sign up**: https://africastalking.com
2. **Verify your account** (upload ID for Ugandan numbers)
3. **Go to Sandbox** (for testing) or **Go Live** (for production)
4. **Get API credentials**:
   - Dashboard → Settings → API Key
   - Username (usually "sandbox" for testing)

### Set Environment Variables:

In Supabase Edge Functions settings:
```
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_USERNAME=sandbox (or your username)
```

### Test SMS:

```javascript
// In your app, try sending a test SMS
// The system will automatically format phone numbers (0XXX format)
```

---

## 🔄 Step 9: Data Migration (If you have existing local data)

If you've been using the app in local mode and want to migrate data:

1. **Export from Local Storage**:
   - Open browser console
   - Run: `localStorage.getItem('gitara_clients')`
   - Copy all data (clients, transactions, cashbook)

2. **Import to Supabase**:
   - Once backend is connected, the app will automatically sync
   - Or use the Data View page to bulk import

---

## 🎯 API Endpoints Reference

All endpoints are prefixed with:
```
https://your-project-id.supabase.co/functions/v1/make-server-68baa523
```

### Clients:
- `GET /clients` - Get all clients
- `GET /clients/:id` - Get single client
- `POST /clients` - Create client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

### Transactions:
- `GET /transactions` - Get all transactions
- `GET /transactions/client/:clientId` - Get client transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Cashbook:
- `GET /cashbook` - Get all entries
- `POST /cashbook` - Create entry
- `PUT /cashbook/:id` - Update entry
- `DELETE /cashbook/:id` - Delete entry

### Owner Capital:
- `GET /owner-capital` - Get all transactions
- `POST /owner-capital` - Create transaction
- `DELETE /owner-capital/:id` - Delete transaction

### SMS:
- `POST /sms/send` - Send SMS
- `GET /sms/history` - Get SMS history
- `GET /sms/history/client/:clientId` - Get client SMS history

---

## 🐛 Troubleshooting

### "Backend not configured" banner shows:

- Check environment variables are set
- Verify `.env` file exists (local dev)
- Clear browser cache and reload

### "Backend Connection Failed" banner:

- Check Edge Function is deployed
- Verify API keys are correct
- Check Supabase project is not paused (free tier pauses after inactivity)
- Look at browser console for error details

### SMS not sending:

- Verify Africa's Talking credentials
- Check phone number format (should be 0XXX...)
- Ensure you're not in sandbox mode if sending to real numbers
- Check SMS API logs in Africa's Talking dashboard

### Data not saving:

- Check browser console for errors
- Verify you're connected to backend (green banner)
- Check Supabase logs: Dashboard → Logs → Edge Functions
- Ensure table permissions are correct

---

## 🚨 Security Notes

1. **Never commit your `.env` file to git**
2. **Never expose service_role key** in frontend code
3. **Keep your database password secure**
4. **Use Row Level Security (RLS)** in production (optional for internal use)
5. **Regularly rotate API keys**

---

## 📊 Database Schema

All data is stored in the `kv_store_68baa523` table with this structure:

### Key Prefixes:
- `clients:*` - Client records
- `transactions:*` - Payment transactions
- `cashbook:*` - Income/Expense entries
- `owner_capital:*` - Owner capital transactions
- `sms_history:*` - SMS history

### Example Data:
```json
{
  "key": "clients:123e4567-e89b-12d3-a456-426614174000",
  "value": {
    "id": "123e4567...",
    "fullName": "John Doe",
    "phoneNumber": "0771234567",
    "loanAmount": 1000000,
    "status": "Active",
    ...
  }
}
```

---

## 🎉 Success!

Once everything is set up, you should see:
- ✅ Green "Backend Connected" banner
- 💾 All data saved to Supabase
- 📱 SMS sending working (if configured)
- 🔄 Data syncing across devices
- 📊 Full persistence (no data loss on refresh)

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Verify all environment variables are set
4. Try redeploying the Edge Function

**Your GITARA BRANCH app is now enterprise-ready with cloud database! 🚀🇺🇬**
