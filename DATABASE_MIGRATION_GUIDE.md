# 📊 William Loans - Database Migration Guide

## 🎯 Overview

Your system has been upgraded from a **key-value store** to **proper PostgreSQL tables** with a well-structured relational schema!

---

## 🆕 New Database Schema

### ✅ Tables Created

#### 1. **clients** table
Stores all client/borrower information with loan details.

```sql
CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT NOT NULL,
    loan_amount DECIMAL(15, 2) NOT NULL,
    outstanding_balance DECIMAL(15, 2) NOT NULL,
    total_paid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Completed', 'Defaulted')),
    start_date DATE NOT NULL,
    daily_payment DECIMAL(15, 2) NOT NULL,
    total_payable DECIMAL(15, 2) NOT NULL,
    guarantor_name TEXT,
    guarantor_id TEXT,
    guarantor_phone TEXT,
    guarantor_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT
);
```

**Indexes:**
- `idx_clients_status` - Fast filtering by loan status
- `idx_clients_start_date` - Quick date-based queries
- `idx_clients_phone` - Fast phone number lookups

---

#### 2. **transactions** table
Records all payment transactions made by clients.

```sql
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('Paid', 'Unpaid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);
```

**Features:**
- Foreign key relationship to `clients` table
- Cascade delete: When client is deleted, their transactions are auto-deleted
- Indexed for fast queries

**Indexes:**
- `idx_transactions_client_id` - Fast client transaction lookups
- `idx_transactions_date` - Date-ordered queries
- `idx_transactions_status` - Filter by payment status

---

#### 3. **cashbook** table
Tracks all income and expenses for daily cash flow management.

```sql
CREATE TABLE cashbook (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
    amount DECIMAL(15, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Paid', 'Expense', 'Profit', 'Disbursement')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT
);
```

**Indexes:**
- `idx_cashbook_date` - Fast date-based queries
- `idx_cashbook_type` - Filter by income/expense
- `idx_cashbook_status` - Category filtering

---

#### 4. **owner_capital** table
Records owner William Kalamuzi's capital injections and withdrawals.

```sql
CREATE TABLE owner_capital (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Capital Injection', 'Owner Withdrawal')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);
```

**Indexes:**
- `idx_owner_capital_date` - Date-ordered queries
- `idx_owner_capital_type` - Filter by transaction type

---

## 🔄 What Changed

### Before (KV Store)
```
kv_store_68baa523 table
├── key: "client:c123"
└── value: { ...all client data as JSON... }
```

### After (Proper Tables)
```
clients table
├── id: "c123"
├── full_name: "John Doe"
├── phone_number: "0700123456"
└── ... (structured columns)
```

---

## ✨ Benefits of New Schema

### 1. **Performance**
- ✅ Indexed columns for fast queries
- ✅ Optimized for filtering and sorting
- ✅ Efficient joins between related data

### 2. **Data Integrity**
- ✅ Foreign key constraints ensure referential integrity
- ✅ CHECK constraints prevent invalid data
- ✅ NOT NULL constraints enforce required fields

### 3. **Querying**
- ✅ Standard SQL queries (easier to write)
- ✅ Can join clients with transactions
- ✅ Aggregate functions work properly

### 4. **Scalability**
- ✅ Handles thousands of records efficiently
- ✅ Proper indexing for large datasets
- ✅ Query optimization built-in

### 5. **Maintenance**
- ✅ Automatic cascade deletes
- ✅ Auto-updating timestamps
- ✅ Clear schema documentation

---

## 🚀 Deployment Steps

### Step 1: Run the Migration

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref tmelmmhephgyzccezfgd

# Run migrations (creates all tables)
supabase db push
```

Or manually in Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd
2. Click **SQL Editor**
3. Copy and paste content from `/supabase/migrations/20260115000001_create_tables.sql`
4. Click **Run**

### Step 2: Deploy Updated Backend

```bash
# Deploy the new edge function
supabase functions deploy server
```

### Step 3: Verify Tables Created

1. Go to Supabase Dashboard → **Table Editor**
2. You should see 4 new tables:
   - `clients`
   - `transactions`
   - `cashbook`
   - `owner_capital`

### Step 4: Test the System

1. Start your frontend: `npm run dev`
2. Login with `william@boss.com` / `admin@123`
3. Add a test client
4. Check database - data should appear in `clients` table!

---

## 📊 Database Relationships

```
┌─────────────────┐
│    clients      │
│  (Primary)      │
└────────┬────────┘
         │
         │ one-to-many
         │
         ▼
┌─────────────────┐
│  transactions   │
│  (Foreign Key)  │
└─────────────────┘

┌─────────────────┐
│    cashbook     │
│  (Independent)  │
└─────────────────┘

┌─────────────────┐
│ owner_capital   │
│  (Independent)  │
└─────────────────┘
```

---

## 🔍 Example Queries

### Get all active loans with client details
```sql
SELECT * FROM clients 
WHERE status = 'Active' 
ORDER BY start_date DESC;
```

### Get client's complete payment history
```sql
SELECT 
    c.full_name,
    c.phone_number,
    c.loan_amount,
    c.total_paid,
    t.*
FROM clients c
LEFT JOIN transactions t ON c.id = t.client_id
WHERE c.id = 'c123'
ORDER BY t.date DESC;
```

### Calculate total cash collected today
```sql
SELECT SUM(amount) as total_collected
FROM cashbook
WHERE type = 'Income' 
AND date = CURRENT_DATE;
```

### Get owner capital summary
```sql
SELECT 
    type,
    SUM(amount) as total
FROM owner_capital
GROUP BY type;
```

---

## 🛡️ Data Validation

The schema includes automatic validation:

### Client Status
✅ Must be: `'Active'`, `'Completed'`, or `'Defaulted'`
❌ Cannot be: `'Pending'`, `'Unknown'`, etc.

### Transaction Status
✅ Must be: `'Paid'` or `'Unpaid'`

### Cashbook Type
✅ Must be: `'Income'` or `'Expense'`

### Cashbook Status
✅ Must be: `'Paid'`, `'Expense'`, `'Profit'`, or `'Disbursement'`

### Owner Capital Type
✅ Must be: `'Capital Injection'` or `'Owner Withdrawal'`

---

## 🔧 Automatic Features

### 1. **Auto-updating Timestamps**
Every time you update a record, `updated_at` is automatically set to current timestamp.

### 2. **Cascade Deletes**
When you delete a client, all their transactions are automatically deleted.

### 3. **Default Values**
- `total_paid` defaults to `0` for new clients
- `created_at` automatically set on insert
- `updated_at` automatically maintained

---

## 📝 Backend Changes

The backend now:
- ✅ Uses proper SQL queries instead of KV operations
- ✅ Transforms between camelCase (frontend) and snake_case (database)
- ✅ Validates data against schema constraints
- ✅ Returns proper error messages for constraint violations

### Example: Adding a Client

**Before (KV Store):**
```typescript
await kv.set(`client:${client.id}`, client);
```

**After (Proper Table):**
```typescript
await supabase
  .from('clients')
  .insert([{
    id: client.id,
    full_name: client.fullName,
    phone_number: client.phoneNumber,
    // ... structured fields
  }]);
```

---

## 🎯 Frontend Changes

**No frontend changes needed!** 

The API layer handles all transformations:
- Frontend sends: `{ fullName: "John" }`
- Backend stores: `{ full_name: "John" }`
- Backend returns: `{ fullName: "John" }`

---

## 🧪 Testing Checklist

After migration, verify:

- [ ] Can add a new client
- [ ] Client appears in database `clients` table
- [ ] Can record a payment
- [ ] Transaction appears in `transactions` table
- [ ] Transaction has `client_id` foreign key
- [ ] Can add cashbook entry
- [ ] Entry appears in `cashbook` table
- [ ] Can add owner capital
- [ ] Appears in `owner_capital` table
- [ ] Deleting client also deletes their transactions
- [ ] Timestamps auto-update on edit
- [ ] All KPIs calculate correctly
- [ ] Charts display properly

---

## 📊 Monitoring Your Data

### Check table sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('clients', 'transactions', 'cashbook', 'owner_capital')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Count records
```sql
SELECT 
    (SELECT COUNT(*) FROM clients) as total_clients,
    (SELECT COUNT(*) FROM transactions) as total_transactions,
    (SELECT COUNT(*) FROM cashbook) as total_cashbook_entries,
    (SELECT COUNT(*) FROM owner_capital) as total_owner_capital;
```

---

## 🚨 Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution**: Tables already created. Skip to Step 2.

### Issue: Foreign key constraint violation

**Cause**: Trying to add transaction for non-existent client.

**Solution**: Ensure client exists before adding transaction.

### Issue: CHECK constraint violation

**Cause**: Invalid status value (e.g., `'Pending'` instead of `'Active'`).

**Solution**: Use only allowed values as defined in schema.

---

## 🎉 You're Ready!

Your database is now properly structured with:

✅ **4 properly designed tables**
✅ **Foreign key relationships**
✅ **Indexes for performance**
✅ **Data validation constraints**
✅ **Automatic timestamp management**
✅ **Professional database architecture**

**Deploy the migration and enjoy your upgraded system!** 🚀

---

## 📞 Quick Commands

```bash
# Run migration
supabase db push

# Deploy backend
supabase functions deploy server

# Check migration status
supabase migration list

# View table structure
supabase db diff

# Reset database (CAUTION: deletes all data!)
supabase db reset
```

---

**Your William Loans system now has enterprise-grade database architecture!** 🏦
