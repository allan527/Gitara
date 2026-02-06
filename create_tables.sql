-- William Loans Database Setup
-- Run this SQL in Supabase SQL Editor to create all tables

-- ============================================================
-- CLIENTS TABLE
-- ============================================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_start_date ON public.clients(start_date);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone_number);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- ============================================================
-- CASHBOOK TABLE
-- ============================================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cashbook_date ON public.cashbook(date DESC);
CREATE INDEX IF NOT EXISTS idx_cashbook_type ON public.cashbook(type);
CREATE INDEX IF NOT EXISTS idx_cashbook_status ON public.cashbook(status);

-- ============================================================
-- OWNER CAPITAL TABLE
-- ============================================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_owner_capital_date ON public.owner_capital(date DESC);
CREATE INDEX IF NOT EXISTS idx_owner_capital_type ON public.owner_capital(type);

-- ============================================================
-- TRIGGER FUNCTION FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- APPLY TRIGGERS
-- ============================================================
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

-- ============================================================
-- VERIFY TABLES CREATED
-- ============================================================
SELECT 
    'Tables created successfully!' as message,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') as clients_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') as transactions_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cashbook') as cashbook_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'owner_capital') as owner_capital_table;
