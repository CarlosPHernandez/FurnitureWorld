-- Create custom types
CREATE TYPE item_status AS ENUM ('active', 'discontinued', 'seasonal');
CREATE TYPE quality_status AS ENUM ('passed', 'failed', 'pending');
CREATE TYPE weight_unit AS ENUM ('kg', 'lb');
CREATE TYPE dimension_unit AS ENUM ('cm', 'in');
CREATE TYPE season AS ENUM ('spring', 'summer', 'fall', 'winter');

-- Create inventory table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    image_url TEXT DEFAULT '/download.jpg',
    
    -- Dimensions
    length DECIMAL(10, 2),
    width DECIMAL(10, 2),
    height DECIMAL(10, 2),
    dimension_unit dimension_unit DEFAULT 'cm',
    
    -- Physical properties
    weight DECIMAL(10, 2),
    weight_unit weight_unit DEFAULT 'kg',
    materials JSONB DEFAULT '[]'::jsonb,
    finish VARCHAR(100),
    color VARCHAR(100),
    
    -- Assembly
    assembly_required BOOLEAN DEFAULT false,
    assembly_time INTEGER, -- in minutes
    
    -- Warranty
    warranty_duration INTEGER, -- in months
    warranty_coverage TEXT,
    
    -- Supplier
    supplier_id VARCHAR(50),
    supplier_name VARCHAR(255),
    supplier_lead_time INTEGER,
    supplier_minimum_order INTEGER,
    supplier_price_breaks JSONB DEFAULT '[]'::jsonb,
    supplier_rating DECIMAL(3, 1),
    
    -- Location
    warehouse VARCHAR(50) DEFAULT 'MAIN',
    aisle VARCHAR(50),
    shelf VARCHAR(50),
    
    -- Status
    status item_status DEFAULT 'active',
    season season,
    
    -- Additional info
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    
    -- Quality control
    last_inspection DATE,
    inspector VARCHAR(100),
    quality_status quality_status DEFAULT 'pending',
    quality_issues JSONB DEFAULT '[]'::jsonb,
    
    -- Customization
    customization_available BOOLEAN DEFAULT false,
    customization_options JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_updated_at();

-- Create indexes for common queries
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_name ON inventory_items(name);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_inventory_brand ON inventory_items(brand);
CREATE INDEX idx_inventory_status ON inventory_items(status);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to view inventory"
    ON inventory_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert inventory"
    ON inventory_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update inventory"
    ON inventory_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete inventory"
    ON inventory_items
    FOR DELETE
    TO authenticated
    USING (true); 