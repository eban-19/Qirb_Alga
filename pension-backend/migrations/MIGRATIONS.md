# Database Migrations

## 📁 **Path:** `pension-backend/migrations/`

## ⚠️ **Important:**
- **Navigate to migrations folder first:** `cd pension-backend/migrations/`
- **Run from migrations directory:** All commands assume you're in the migrations folder
- **MySQL required:** Version 5.7+ recommended
- **Configure scripts first:** Edit migrate.bat/migrate.sh with your credentials
- **Smart path detection:** Scripts now work from any location within project

## 🔧 **Team Configuration Required**

### **For Windows Users (migrate.bat):**
```batch
# Edit lines 6-8 in migrate.bat
set DB_USER=your_username          # Your MySQL username
set DB_PASS=your_password          # Your MySQL password  
set DB_NAME=pension_management_system # Database name
```

```

### **Quick Setup with Scripts:**
```bash
# Windows: Double-click migrate.bat (after configuring)
# Linux/Mac: ./migrate.sh (after configuring)
```

## 🚀 Quick Setup

### One-Command Setup
```bash
# Navigate to migrations folder first
cd migrations

# Run complete setup
mysql -u root -p -e "CREATE DATABASE pension_management_system;" && \
mysql -u root -p pension_management_system < 001_initial_schema.sql && \
mysql -u root -p pension_management_system < 002_add_pension_approval.sql && \
mysql -u root -p pension_management_system < 004_add_payment_integration.sql && \
echo "✅ Database setup completed!"
```

### Step-by-Step Setup
```bash
# 1. Navigate to migrations folder
cd migrations

# 2. Create database
mysql -u root -p -e "CREATE DATABASE pension_management_system;"

# 3. Run migrations in order
mysql -u root -p pension_management_system < 001_initial_schema.sql
mysql -u root -p pension_management_system < 002_add_pension_approval.sql
mysql -u root -p pension_management_system < 004_add_payment_integration.sql

# 4. Verify setup
mysql -u root -p pension_management_system -e "SHOW TABLES;"
```

## 📋 Migration Files

### 001_initial_schema.sql
- Core database schema (Users, Pensions, Rooms, Bookings, etc.)
- **FIXED:** Updated to match actual database structure
- **ADDED:** Missing tables (ownerprofiles, emailnotifications, roomavailabilitylogs)

### 002_add_pension_approval.sql
- Pension approval system
- Adds rejection_reason, reviewed_by, reviewed_at columns

### 004_add_payment_integration.sql
- Integrates payments table with bookings
- Adds payment processing columns to bookings

## 🗄️ Database Schema

### Tables (13 total)
- `users` - User accounts
- `pensions` - Pension properties
- `rooms` - Individual rooms
- `bookings` - Customer bookings
- `reviews` - Customer reviews
- `notifications` - In-app notifications
- `emailnotifications` - Email queue
- `packages` - Pension packages
- `staff` - Staff management
- `expenses` - Financial tracking
- `ownerprofiles` - Owner business profiles
- `roomavailabilitylogs` - Room status audit trail
- `payments` - Payment processing

## ⚠️ Important Notes

- **Database name:** `pension_management_system`
- **MySQL version:** 5.7+ required
- **Migration order:** Must run 001 → 002 → 004
- **Existing databases:** Only run 002 → 004 (skip 001)
- **Unused files:** None (removed remove_expense_columns.sql)