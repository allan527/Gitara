-- GITARA BRANCH - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create the KV store table for GITARA BRANCH data
CREATE TABLE IF NOT EXISTS kv_store_7f28f6fd (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster prefix searches
CREATE INDEX IF NOT EXISTS kv_store_7f28f6fd_key_prefix_idx 
  ON kv_store_7f28f6fd (key text_pattern_ops);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_kv_store_7f28f6fd_updated_at ON kv_store_7f28f6fd;
CREATE TRIGGER update_kv_store_7f28f6fd_updated_at
    BEFORE UPDATE ON kv_store_7f28f6fd
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your security requirements)
-- For now, allow public access (you can restrict this later)
ALTER TABLE kv_store_7f28f6fd ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
  ON kv_store_7f28f6fd
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Display success message
SELECT 'Database setup complete! Table kv_store_7f28f6fd created successfully.' as status;
