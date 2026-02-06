# 🔑 Environment Variables for William Loans Deployment

## 📋 Required Environment Variables

Your William Loans system uses **Supabase** which automatically manages most environment variables. Here's what you need:

---

## 🎯 Current Configuration

### **Your Supabase Project Details:**

```
Project ID: tmelmmhephgyzccezfgd
Project URL: https://tmelmmhephgyzccezfgd.supabase.co
```

### **Environment Variables (Automatically Set by Figma Make):**

| Variable | Value | Where Used |
|----------|-------|------------|
| `SUPABASE_URL` | `https://tmelmmhephgyzccezfgd.supabase.co` | Backend (Edge Function) |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Frontend & Backend |
| `SUPABASE_SERVICE_ROLE_KEY` | (Secure - Set in Supabase Dashboard) | Backend Only |
| `SUPABASE_DB_URL` | (Auto-configured) | Database Connection |

---

## 📁 Where Variables Are Stored

### **1. Frontend (Hardcoded - Safe)**
**File:** `/utils/supabase/info.tsx`
```typescript
export const projectId = "tmelmmhephgyzccezfgd"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZWxtbWhlcGhneXpjY2V6ZmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTUwNTMsImV4cCI6MjA4MzgzMTA1M30.dBhMKrLXJzklbV25Ob582pouQ1FOlaEcGN7WK7y9fNY"
```
✅ **Safe to expose** - These are public keys designed for frontend use

### **2. Backend (Environment Variables)**
**Managed by:** Supabase Dashboard
- `SUPABASE_URL` - Automatically set
- `SUPABASE_ANON_KEY` - Automatically set  
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically set
- `SUPABASE_DB_URL` - Automatically set

---

## 🚀 Deployment Options

You have **3 deployment options**:

---

## **Option 1: Deploy to Figma Make (Current Setup)**

### ✅ **Already Configured!**

Your app is currently running on Figma Make and **requires NO additional environment variable setup** because:

1. **Frontend variables** are in `/utils/supabase/info.tsx`
2. **Backend variables** are automatically injected by Supabase
3. **Database** is already connected

### **Your Current URL:**
```
https://app-tmelmmhephgyzccezfgd.makeproxy-c.figma.site/
```

### **Status:** ✅ **READY TO USE!**

---

## **Option 2: Deploy to Vercel/Netlify/Other Host**

If you want to deploy to a different platform:

### **Step 1: Set Frontend Variables**

**File:** `/utils/supabase/info.tsx` (Already configured)
```typescript
export const projectId = "tmelmmhephgyzccezfgd"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZWxtbWhlcGhneXpjY2V6ZmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTUwNTMsImV4cCI6MjA4MzgzMTA1M30.dBhMKrLXJzklbV25Ob582pouQ1FOlaEcGN7WK7y9fNY"
```

### **Step 2: Deploy Backend to Supabase**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref tmelmmhephgyzccezfgd

# Deploy edge function
supabase functions deploy server
```

### **Step 3: No Additional Environment Variables Needed!**

Because:
- Frontend uses hardcoded values from `/utils/supabase/info.tsx`
- Backend gets environment variables automatically from Supabase

### **Step 4: Build and Deploy Frontend**

```bash
# Build for production
npm run build

# Deploy 'dist' folder to your hosting platform
```

**Deployment platforms:**
- **Vercel:** Connect GitHub repo, auto-deploy
- **Netlify:** Connect GitHub repo, auto-deploy
- **Cloudflare Pages:** Deploy `dist` folder
- **AWS S3 + CloudFront:** Upload `dist` folder

---

## **Option 3: Self-Hosted (VPS/DigitalOcean/AWS)**

If you're hosting on your own server:

### **Frontend Environment Variables**
✅ **Already configured** in `/utils/supabase/info.tsx`

### **Backend Environment Variables**
Supabase Edge Functions handle this automatically.

### **Steps:**

1. **Build Frontend:**
```bash
npm run build
```

2. **Deploy Backend:**
```bash
supabase functions deploy server
```

3. **Serve Frontend:**
```bash
# Option A: Using Nginx
sudo nginx -s reload

# Option B: Using Node
npx serve dist

# Option C: Using PM2
pm2 serve dist 3000 --spa
```

---

## 🔐 Security Best Practices

### ✅ **What's Safe to Expose:**

**Frontend (Public):**
- `projectId` = `"tmelmmhephgyzccezfgd"`
- `publicAnonKey` = Full anon key shown above
- These are **designed** to be public

**Supabase Dashboard URL:**
```
https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd
```

### ❌ **What to Keep Secret:**

**Backend Only:**
- `SUPABASE_SERVICE_ROLE_KEY` - Never expose to frontend
- `SUPABASE_DB_URL` - Never expose to frontend
- Database password - Never expose

**How it's protected:**
✅ Edge functions run server-side only
✅ Service role key never sent to client
✅ Database credentials stay in Supabase

---

## 📊 Environment Variable Summary Table

| Variable | Type | Location | Public? | Auto-Set? |
|----------|------|----------|---------|-----------|
| `projectId` | Frontend | `/utils/supabase/info.tsx` | ✅ Yes | ✅ Yes |
| `publicAnonKey` | Frontend | `/utils/supabase/info.tsx` | ✅ Yes | ✅ Yes |
| `SUPABASE_URL` | Backend | Supabase Dashboard | ❌ No | ✅ Yes |
| `SUPABASE_ANON_KEY` | Backend | Supabase Dashboard | ❌ No | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Supabase Dashboard | ❌ No | ✅ Yes |
| `SUPABASE_DB_URL` | Backend | Supabase Dashboard | ❌ No | ✅ Yes |

---

## 🧪 Testing Your Deployment

### **Test 1: Frontend Connection**

Open browser console (F12) and run:
```javascript
console.log('Project ID:', 'tmelmmhephgyzccezfgd');
console.log('Anon Key:', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
```

### **Test 2: Backend Health Check**

```bash
curl https://tmelmmhephgyzccezfgd.supabase.co/functions/v1/make-server-68baa523/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-01-18T..."}
```

### **Test 3: Full Integration**

1. Login to your app
2. Add a test client
3. Check Supabase Dashboard → Table Editor → `kv_store_68baa523`
4. Verify data appears with `clients:` prefix

---

## 🎯 Quick Deployment Checklist

### **For Current Figma Make Deployment:**
- [x] ✅ Environment variables configured
- [x] ✅ Frontend connected to Supabase
- [x] ✅ Backend edge function deployed
- [x] ✅ Database table created
- [x] ✅ Ready to use!

### **For External Deployment (Vercel/Netlify):**
- [ ] Deploy backend: `supabase functions deploy server`
- [ ] Build frontend: `npm run build`
- [ ] Deploy `dist` folder to hosting platform
- [ ] Test health endpoint
- [ ] Test login and data creation

### **For Self-Hosted Deployment:**
- [ ] Set up server (Nginx/Apache)
- [ ] Deploy backend to Supabase
- [ ] Build frontend: `npm run build`
- [ ] Copy `dist` to server web directory
- [ ] Configure SSL certificate
- [ ] Test all features

---

## 🔧 Common Deployment Scenarios

### **Scenario 1: Share Current App**
✅ **No additional setup needed!**

**Your shareable URL:**
```
https://app-tmelmmhephgyzccezfgd.makeproxy-c.figma.site/
```

Give this URL + login credentials (from `SHARE_WITH_FRIEND.md`)

---

### **Scenario 2: Deploy to Custom Domain**

1. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```

2. **Add custom domain in Vercel dashboard**

3. **Update Supabase auth settings:**
   - Go to: https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd
   - Settings → Authentication → Site URL
   - Add your custom domain

---

### **Scenario 3: Deploy to Client's Server**

1. **Build production bundle:**
```bash
npm run build
```

2. **Deploy backend:**
```bash
supabase functions deploy server
```

3. **Upload `dist` folder to server**

4. **Configure web server (Nginx example):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/william-loans/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📞 Support & Troubleshooting

### **Issue: "Cannot connect to database"**
**Solution:** 
- Verify backend is deployed: `supabase functions list`
- Check health endpoint: `curl https://tmelmmhephgyzccezfgd.supabase.co/functions/v1/make-server-68baa523/health`

### **Issue: "Unauthorized" error**
**Solution:**
- Verify `publicAnonKey` in `/utils/supabase/info.tsx` matches Supabase dashboard

### **Issue: CORS errors**
**Solution:**
- Backend already has CORS configured
- Clear browser cache: Ctrl+Shift+Delete
- Try incognito/private mode

---

## ✅ Summary

### **Your Current Setup:**

**Deployment Platform:** Figma Make  
**Database:** Supabase (tmelmmhephgyzccezfgd)  
**Backend:** Supabase Edge Functions  
**Frontend:** React + TypeScript + Tailwind  

**Environment Variables:** ✅ **ALL CONFIGURED AUTOMATICALLY**

### **Required Actions for Deployment:**

**For Figma Make (Current):** ✅ **ZERO - Already deployed!**  
**For Vercel/Netlify:** 2 commands (build + deploy)  
**For Self-Hosted:** 3 steps (build, deploy backend, upload frontend)  

---

## 🎉 Conclusion

**Your William Loans app is deployment-ready!**

✅ No `.env` file needed  
✅ All environment variables auto-configured  
✅ Frontend and backend connected  
✅ Database ready  
✅ 5 user accounts set up  
✅ Mobile-optimized  
✅ Production-ready  

**Share your current URL and start using the system!** 🇺🇬💰✨
