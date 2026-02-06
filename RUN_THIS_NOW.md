# ⚡ RUN THIS NOW - Create Tables in 60 Seconds

## 🚨 You're seeing this error because tables don't exist yet!

```
Error adding client: Error: Could not find the table 'public.clients' in the schema cache
```

---

## ✅ SOLUTION - Follow These EXACT Steps:

### STEP 1: Click this link
👉 **https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd/sql/new**

This opens the SQL Editor ready for a new query.

---

### STEP 2: Copy the SQL below (all of it!)

```sql
-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
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

CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_start_date ON public.clients(start_date);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone_number);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Create cashbook table
CREATE TABLE IF NOT EXISTS public.cashbook (
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

CREATE INDEX IF NOT EXISTS idx_cashbook_date ON public.cashbook(date DESC);
CREATE INDEX IF NOT EXISTS idx_cashbook_type ON public.cashbook(type);
CREATE INDEX IF NOT EXISTS idx_cashbook_status ON public.cashbook(status);

-- Create owner_capital table
CREATE TABLE IF NOT EXISTS public.owner_capital (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Capital Injection', 'Owner Withdrawal')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_owner_capital_date ON public.owner_capital(date DESC);
CREATE INDEX IF NOT EXISTS idx_owner_capital_type ON public.owner_capital(type);

-- Trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cashbook_updated_at ON public.cashbook;
CREATE TRIGGER update_cashbook_updated_at
    BEFORE UPDATE ON public.cashbook
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Verify success
SELECT 'SUCCESS! All tables created!' as message;
```

---

### STEP 3: Paste into the SQL Editor

Click in the text area and paste (Ctrl+V or Cmd+V)

---

### STEP 4: Click the "RUN" button

Look for the green "RUN" button or press **Ctrl+Enter**

---

### STEP 5: Wait for "SUCCESS!" message

You should see at the bottom:
```
message: "SUCCESS! All tables created!"
```

---

### STEP 6: Verify tables exist

Click this link: 👉 **https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd/editor**

You should now see 4 tables:
- ✅ clients
- ✅ transactions  
- ✅ cashbook
- ✅ owner_capital

---

### STEP 7: Refresh your William Loans app

Press **F5** or **Ctrl+R** to refresh the page

---

### STEP 8: Login again

- Email: `william@boss.com`
- Password: `admin@123`

---

### STEP 9: Try adding a client again

Click "Add Client" and fill in the form. 

**IT WILL WORK NOW!** ✅

---

## 🎉 DONE!

Your database tables are created and your app will work perfectly!

---

## 🚨 If you get "relation already exists"

**That's GOOD!** It means the tables are already there. Just refresh your app.

---

## 💡 This is a ONE-TIME setup

You never need to do this again. The tables stay in your database forever.

---

**Total time: 60 seconds**  
**Difficulty: Copy & Paste**  
**Result: Working app!** 🚀
