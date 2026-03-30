# Database Migrations

This directory contains all database migration files for the pension management system.

## Migration Files

### 001_initial_schema.sql
- Creates all initial tables
- Sets up foreign key relationships
- Adds basic indexes for performance

### 002_add_pension_approval.sql
- Adds pension approval system columns
- Adds rejection_reason, reviewed_by, reviewed_at columns
- Updates existing pensions to 'active' status

### 003_add_websocket_tracking.sql
- Adds WebSocket connection tracking
- Monitors real-time user connections
- Optional for monitoring and analytics

## How to Run Migrations

### For New Setup (Fresh Database):
```bash
# Run all migrations in order
mysql -u username -p pension_management < migrations/001_initial_schema.sql
mysql -u username -p pension_management < migrations/002_add_pension_approval.sql
mysql -u username -p pension_management < migrations/003_add_websocket_tracking.sql
```

### For Existing Database:
```bash
# Only run new migrations that haven't been applied
mysql -u username -p pension_management < migrations/002_add_pension_approval.sql
mysql -u username -p pension_management < migrations/003_add_websocket_tracking.sql
```

### Quick Setup (All at once):
```bash
# Run all migrations in sequence
mysql -u username -p pension_management < migrations/001_initial_schema.sql && mysql -u username -p pension_management < migrations/002_add_pension_approval.sql && mysql -u username -p pension_management < migrations/003_add_websocket_tracking.sql
```

## Migration Naming Convention

- Use 3-digit prefix: `001_`, `002_`, `003_`, etc.
- Use descriptive names: `add_pension_approval.sql`
- Include date and description in file header
- Always include rollback comments

## Adding New Migrations

1. Create new file with next number: `004_new_feature.sql`
2. Add migration header with date and description
3. Write SQL changes
4. Add indexes for performance
5. Update this README

## Important Notes

- Always backup database before running migrations
- Run migrations in order (001, 002, 003, etc.)
- Test migrations on development database first
- Include foreign key constraints with proper ON DELETE behavior

## Current Database Schema

### Tables:
- `users` - User accounts and business information
- `pensions` - Pension properties with approval system
- `rooms` - Individual rooms within pensions
- `bookings` - Customer bookings and reservations
- `reviews` - Customer reviews and ratings
- `notifications` - Real-time notifications system
- `packages` - Pension packages and pricing
- `staff` - Pension staff management
- `expenses` - Financial expense tracking
- `websocket_connections` - Real-time connection tracking

### Key Features:
- Pension-level approval system
- Real-time notifications with WebSocket
- Complete booking workflow
- Review and rating system
- Financial tracking
- Staff management
