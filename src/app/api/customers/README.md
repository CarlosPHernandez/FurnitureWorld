# Customer Management API

This API provides endpoints for managing customers in the Family Mattress application.

## Database Setup

To set up the customers table in your Supabase database:

1. Navigate to the Supabase dashboard for your project
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `create-table.sql` into the query editor
5. Run the query

This will create:
- A `customers` table with the necessary columns
- Indexes for faster searching
- A trigger to automatically update the `updated_at` column when a record is modified

## API Endpoints

### GET /api/customers
Retrieves all customers, ordered by creation date (newest first).

### POST /api/customers
Creates a new customer.

Required fields:
- `name`: Customer's full name
- `phone`: Customer's phone number

Optional fields:
- `email`: Customer's email address
- `address`: Customer's physical address
- `notes`: Additional notes about the customer

### GET /api/customers/[id]
Retrieves a specific customer by ID.

### PUT /api/customers/[id]
Updates a specific customer by ID.

Required fields:
- `name`: Customer's full name
- `phone`: Customer's phone number

Optional fields:
- `email`: Customer's email address
- `address`: Customer's physical address
- `notes`: Additional notes about the customer

### DELETE /api/customers/[id]
Deletes a specific customer by ID.

## Client-Side Usage

The customer management functionality is available at `/customers` in the application.

Features include:
- Viewing all customers
- Adding new customers
- Editing existing customers
- Deleting customers
- Searching for customers by name, email, or phone number 