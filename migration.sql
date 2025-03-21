-- Migration script to update credit_accounts table structure

-- Add missing columns to credit_accounts table
ALTER TABLE credit_accounts 
  ADD COLUMN IF NOT EXISTS fullName TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phoneNumber TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS dateOfBirth TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS taxId TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS driversLicense TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS paymentMethod TEXT NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS cardName TEXT,
  ADD COLUMN IF NOT EXISTS cardNumber TEXT,
  ADD COLUMN IF NOT EXISTS paymentFrequency TEXT NOT NULL DEFAULT 'monthly';

-- Add constraints to ensure paymentMethod is one of the allowed values
ALTER TABLE credit_accounts
  ADD CONSTRAINT payment_method_check 
  CHECK (paymentMethod IN ('cash', 'check', 'debit', 'credit'));

-- Add constraints to ensure paymentFrequency is one of the allowed values
ALTER TABLE credit_accounts
  ADD CONSTRAINT payment_frequency_check 
  CHECK (paymentFrequency IN ('weekly', 'biweekly', 'monthly'));

-- Update any existing rows to have valid default values
UPDATE credit_accounts
SET 
  fullName = 'Legacy Customer',
  address = 'Unknown Address',
  phoneNumber = 'Unknown',
  dateOfBirth = '1900-01-01',
  paymentMethod = 'cash',
  paymentFrequency = 'monthly'
WHERE fullName IS NULL OR fullName = ''; 