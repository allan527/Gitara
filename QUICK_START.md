# ⚡ William Loans - Quick Start Guide

## 🎯 Get Up and Running in 5 Minutes

### Step 1: Deploy Backend (2 minutes)

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

**What this does:**
- Installs Supabase CLI (if needed)
- Logs you into Supabase
- Links to your project (tmelmmhephgyzccezfgd)
- Deploys the edge function
- Tests the connection

### Step 2: Start Frontend (1 minute)

```bash
# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

Your app will open at: `http://localhost:5173`

### Step 3: Login & Test (2 minutes)

1. **Login** with:
   - Email: `william@boss.com`
   - Password: `admin@123`

2. **Add a test client:**
   - Click **Clients** in sidebar
   - Click **Add Client** button
   - Fill in:
     - Full Name: `Test Client`
     - Phone: `0700123456`
     - Address: `Kampala, Uganda`
     - Loan Amount: `500000`
     - Start Date: Today
   - Click **Submit**

3. **Verify it worked:**
   - You should see a success message
   - Client appears in the list
   - Dashboard shows updated KPIs

4. **Check database:**
   - Go to: https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd
   - Click **Table Editor**
   - Select `kv_store_68baa523` table
   - You should see your client data with prefix `client:`

---

## ✅ Success Checklist

You're ready to go when:

- [ ] Edge function deployed successfully
- [ ] Frontend running on localhost:5173
- [ ] Can login with william@boss.com
- [ ] Dashboard loads without errors
- [ ] Can add a test client
- [ ] Success toast appears
- [ ] Client shows in clients list
- [ ] Refresh page - client still there (proves database persistence)
- [ ] Supabase dashboard shows data in table

---

## 🚨 If Something Goes Wrong

### Issue: Deploy script fails

**Solution:**
```bash
# Install Supabase CLI manually
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref tmelmmhephgyzccezfgd

# Deploy
supabase functions deploy server
```

### Issue: "Failed to load data from server"

**Solution:**
1. Check if edge function is deployed:
   ```bash
   curl https://tmelmmhephgyzccezfgd.supabase.co/functions/v1/make-server-68baa523/health
   ```
   Should return: `{"status":"ok"}`

2. If that fails, redeploy:
   ```bash
   supabase functions deploy server
   ```

### Issue: Login doesn't work

**Valid credentials:**
- `william@boss.com` / `admin@123` ✅
- `cashier.com` / `admin@123` ✅
- `field.com` / `admin@123` ✅

### Issue: Can't see data in database

**Check these:**
1. Is edge function deployed? (see above)
2. Did you add test data in the app?
3. Are you looking at the right table? (`kv_store_68baa523`)
4. Check browser console for errors (F12)

---

## 🎓 What to Do Next

### 1. **Add Real Clients**
Start adding your actual loan clients with real data.

### 2. **Record Payments**
- Click on a client
- Click **Record Payment**
- Enter the amount received
- System updates everything automatically

### 3. **Track Expenses**
- Go to **Cashbook** page
- Click **Add Expense**
- Track operating costs

### 4. **Inject Capital** (William only)
- Click **Owner Capital** in sidebar
- Choose "Capital Injection"
- Enter amount
- Adds money to the business

### 5. **View Reports**
- Dashboard shows real-time KPIs
- Transaction History has complete archives
- PDF downloads available for receipts

---

## 📊 Understanding Your Dashboard

After adding some data, your dashboard shows:

### KPIs (Top Cards)
- **Total Active Loans**: Number of ongoing loans
- **Total Outstanding**: Money still owed by all clients
- **Total Collected Today**: Payments received today
- **Total Profit**: Processing fees + interest earned

### Charts
- **Payment Trends**: Daily payment volume over time
- **Loan Status**: Active vs Completed loans
- **Recent Transactions**: Latest 5 payments

---

## 🎯 Daily Workflow

### Morning
1. Login to William Loans
2. Check dashboard for today's expected payments
3. Review outstanding balances

### During Day
1. As payments come in, click **Record Payment**
2. Enter amount received
3. Print receipt if needed
4. Update client status automatically

### End of Day
1. Go to **Cashbook** page
2. Add any expenses incurred
3. Review total cash collected
4. Check dashboard for summary

---

## 📱 Mobile Access

The system works perfectly on mobile:

1. Open on your phone: `http://your-server-ip:5173`
2. Or deploy to production for public URL
3. Use hamburger menu (☰) to navigate
4. All features work on mobile

---

## 🔐 User Management

### Boss (william@boss.com)
- Can do everything
- Edit all data
- Access owner capital
- Full control

### Cashier (cashier.com)
- Record payments
- View all data
- Cannot edit other users' data
- Cannot access owner capital

### Field Officer (field.com)
- View clients
- Record payments
- Limited access
- Cannot edit or delete

---

## 💡 Pro Tips

1. **Daily Backups**: Supabase automatically backs up your database
2. **Search Clients**: Use the search box on Clients page
3. **Filter Transactions**: Use date filters on Transaction History
4. **PDF Receipts**: Click print on any transaction
5. **Refresh Data**: Data auto-loads on login, or refresh browser
6. **Check Logs**: Browser console (F12) shows detailed logs

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| **Login** | `william@boss.com` / `admin@123` |
| **Backend Health** | https://tmelmmhephgyzccezfgd.supabase.co/functions/v1/make-server-68baa523/health |
| **Database** | https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd |
| **Table Name** | `kv_store_68baa523` |
| **Frontend** | http://localhost:5173 (dev) |

---

## 🎉 You're All Set!

Your William Loans system is:

✅ Fully integrated with Supabase
✅ Frontend and backend connected
✅ Database persistence working
✅ Authentication configured
✅ Ready for production use

**Start managing loans today!** 🚀

---

For detailed information, see:
- [README.md](./README.md) - Complete overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed deployment steps
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - What's connected

**Need help?** Check the troubleshooting section in DEPLOYMENT_GUIDE.md
