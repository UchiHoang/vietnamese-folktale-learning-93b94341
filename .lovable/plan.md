

# Plan: Database Documentation Page

## Overview
Create a `/db-docs` page that displays all 17 tables with their columns, types, defaults, RLS policies, foreign keys, and database functions. The data will be hardcoded as a structured constant (since we cannot query `information_schema` from the client). This serves as a dev reference page.

## Implementation

### 1. Create `src/pages/DatabaseDocs.tsx`
A single-page component with:
- **Header** with title "Database Schema Documentation" and last-updated date
- **Summary section**: table count (17), function count (11), storage buckets (2)
- **Table list** using Accordion for each table, containing:
  - Column table (name, type, nullable, default) using the Table component
  - RLS policies summary (command, policy name, expression preview)
  - Foreign keys (if any)
- **Functions section**: collapsible list of all 11 functions with signature and purpose
- **Storage section**: list of 2 buckets
- Search/filter input to quickly find tables or columns

### 2. Data source
Define a `DB_SCHEMA` constant inside the file (or a separate `src/data/dbSchema.ts`) containing all 17 tables' metadata extracted from the current Supabase schema. This is static documentation — no runtime DB queries needed.

### 3. Add route
Add `/db-docs` route in `App.tsx` (no auth protection — dev tool).

### 4. UI Components Used
- `Accordion` for collapsible table sections
- `Table` for column listings
- `Card` for summary stats
- `Tabs` for Tables / Functions / Storage sections
- `Badge` for column types and RLS commands
- Search `Input` for filtering

### Technical Details
- All schema data comes from the Supabase configuration already provided in context
- No database queries or migrations needed
- Single new file + one route addition to App.tsx
- Approximately 400-500 lines for the page component with embedded schema data

