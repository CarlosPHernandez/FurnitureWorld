-- Create custom types
CREATE TYPE driver_status AS ENUM ('Available', 'On Delivery', 'Off Duty');

-- Create drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    status driver_status DEFAULT 'Available',
    deliveries_completed INTEGER DEFAULT 0,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Policy for viewing drivers (authenticated users only)
CREATE POLICY "Allow authenticated users to view drivers"
    ON drivers
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for inserting drivers (authenticated users only)
CREATE POLICY "Allow authenticated users to insert drivers"
    ON drivers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for updating drivers (authenticated users only)
CREATE POLICY "Allow authenticated users to update drivers"
    ON drivers
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for deleting drivers (authenticated users only)
CREATE POLICY "Allow authenticated users to delete drivers"
    ON drivers
    FOR DELETE
    TO authenticated
    USING (true);

-- Create index for common queries
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_email ON drivers(email);
CREATE INDEX idx_drivers_is_active ON drivers(is_active);

-- Insert initial data
INSERT INTO drivers (name, email, phone, status, deliveries_completed, avatar_url)
VALUES
    ('Robert Wilson', 'robert.w@example.com', '(555) 123-4567', 'Available', 142, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert'),
    ('Emma Davis', 'emma.d@example.com', '(555) 234-5678', 'On Delivery', 98, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'),
    ('James Miller', 'james.m@example.com', '(555) 345-6789', 'Off Duty', 215, 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'); 