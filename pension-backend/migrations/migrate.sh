#!/bin/bash

# Database Migration Script
# Pension Management System

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Auto-detect migrations directory
if [ -d "$SCRIPT_DIR/migrations" ]; then
    MIGRATIONS_DIR="$SCRIPT_DIR/migrations"
elif [ -d "$SCRIPT_DIR/../migrations" ]; then
    MIGRATIONS_DIR="$SCRIPT_DIR/../migrations"
else
    echo "❌ Cannot find migrations directory"
    echo "💡 Please run from: pension-backend/migrations/ or pension-backend/"
    exit 1
fi

# Load environment variables from .env file
if [ -f "$SCRIPT_DIR/../.env" ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(grep -v '^#' "$SCRIPT_DIR/../.env" | xargs)
else
    echo "⚠️  .env file not found, using default values"
fi

# Database configuration with defaults
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-root}"
DB_NAME="${DB_NAME:-pension_management_system}"
DB_PASS="${DB_PASS:-}"

echo "🗄️  Pension Management System - Database Migration"
echo "=================================================="
echo "📍 Script location: $SCRIPT_DIR"
echo "📂 Migrations directory: $MIGRATIONS_DIR"
echo "🔧 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "🌐 Host: $DB_HOST"
echo ""

# Check if database exists
echo "📋 Checking database connection..."
mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "USE $DB_NAME;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Database '$DB_NAME' does not exist or connection failed"
    echo "💡 Please create database first:"
    echo "   mysql -u $DB_USER -p -e \"CREATE DATABASE $DB_NAME;\""
    echo "   Or run: ./reset_database.sh""
    exit 1
fi

echo "✅ Database connection successful"

# Get list of migration files
echo "📂 Finding migration files..."
MIGRATION_FILES=($(ls $MIGRATIONS_DIR/*.sql | sort))

if [ ${#MIGRATION_FILES[@]} -eq 0 ]; then
    echo "❌ No migration files found in $MIGRATIONS_DIR"
    exit 1
fi

echo "📋 Found ${#MIGRATION_FILES[@]} migration files:"
for file in "${MIGRATION_FILES[@]}"; do
    echo "   - $(basename $file)"
done

echo ""
echo "🚀 Starting migration process..."
echo ""

# Run each migration
for migration_file in "${MIGRATION_FILES[@]}"; do
    filename=$(basename $migration_file)
    echo "📄 Running migration: $filename"
    
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" < $migration_file
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration completed: $filename"
    else
        echo "❌ Migration failed: $filename"
        echo "🛑 Stopping migration process"
        exit 1
    fi
    
    echo ""
done

echo "🎉 All migrations completed successfully!"
echo "📊 Database is now up to date"
echo ""
echo "🔍 To verify migration:"
echo "   mysql -u $DB_USER -p$DB_PASS -e \"SHOW TABLES;\" $DB_NAME"
echo ""
echo "📝 Migration log saved to: migrations/migration_$(date +%Y%m%d_%H%M%S).log"
