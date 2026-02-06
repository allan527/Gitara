-- William Loans Database Schema
-- Migration: Create all tables for the loan management system

-- ============================================================
-- CLIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
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

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_start_date ON clients(start_date);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone_number);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================================
-- CASHBOOK TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cashbook (
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_cashbook_date ON cashbook(date DESC);
CREATE INDEX IF NOT EXISTS idx_cashbook_type ON cashbook(type);
CREATE INDEX IF NOT EXISTS idx_cashbook_status ON cashbook(status);

-- ============================================================
-- OWNER CAPITAL TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS owner_capital (
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
CREATE INDEX IF NOT EXISTS idx_owner_capital_date ON owner_capital(date DESC);
CREATE INDEX IF NOT EXISTS idx_owner_capital_type ON owner_capital(type);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- APPLY TRIGGERS
-- ============================================================
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cashbook_updated_at
    BEFORE UPDATE ON cashbook
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================
COMMENT ON TABLE clients IS 'Stores all client/borrower information with loan details';
COMMENT ON TABLE transactions IS 'Records all payment transactions made by clients';
COMMENT ON TABLE cashbook IS 'Tracks all income and expenses for daily cash flow management';
COMMENT ON TABLE owner_capital IS 'Records owner William Kalamuzi''s capital injections and withdrawals';

COMMENT ON COLUMN clients.daily_payment IS 'Calculated daily payment amount (total_payable / 30 days)';
COMMENT ON COLUMN clients.total_payable IS 'Loan amount + 20% monthly interest';
COMMENT ON COLUMN cashbook.status IS 'Categorizes entries: Paid (repayment), Expense, Profit (fees), Disbursement';
