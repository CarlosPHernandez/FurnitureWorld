# Invoices API

This API provides endpoints for managing customer invoices in the Family Mattress application.

## Database Setup

To set up the invoices table in your Supabase database:

1. Navigate to the Supabase dashboard for your project
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/20240615000000_create_invoices_table.sql` into the query editor
5. Run the query

This will create:
- An `invoices` table with the necessary columns
- A custom type for invoice status ('pending', 'paid', 'overdue', 'cancelled')
- Indexes for faster searching
- A trigger to automatically update the `updated_at` column when a record is modified
- Row-level security policies for authenticated users

## API Endpoints

### GET /api/invoices
Retrieves all invoices, ordered by creation date (newest first).

### POST /api/invoices
Creates a new invoice.

Required fields:
- `customerName`: Customer's full name
- `date`: Invoice date
- `dueDate`: Due date for payment
- `items`: Array of items with description, quantity, unitPrice, and total
- `subtotal`: Subtotal amount
- `tax`: Tax amount
- `total`: Total amount

Optional fields:
- `customerEmail`: Customer's email address
- `customerPhone`: Customer's phone number
- `customerAddress`: Customer's address
- `notes`: Additional notes

### GET /api/invoices/[id]
Retrieves a specific invoice by ID.

### PUT /api/invoices/[id]
Updates a specific invoice by ID.

Required fields:
- At least one field to update

### DELETE /api/invoices/[id]
Deletes a specific invoice by ID.

## Client-Side Usage

The invoice management functionality is available at `/invoices` in the application.

Features include:
- Viewing all invoices
- Creating new invoices
- Editing existing invoices
- Deleting invoices
- Printing invoices
- Tracking payment status 