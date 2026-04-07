#!/bin/bash

# Database Reset Script
# Pension Management System - Drops and recreates database

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

echo "🗄️  Pension Management System - Database Reset"
echo "============================================="
echo "📍 Script location: $SCRIPT_DIR"
echo "🔧 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "🌐 Host: $DB_HOST"
echo ""

# Check MySQL connection
echo "📋 Checking MySQL connection..."
mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "SELECT 1;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ MySQL connection failed"
    echo "💡 Please check your MySQL credentials and service"
    exit 1
fi

echo "✅ MySQL connection successful"

# Drop database if exists
echo "🗑️  Dropping database '$DB_NAME' if it exists..."
mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Failed to drop database"
    exit 1
fi
echo "✅ Database dropped successfully"

# Create new database
echo "🆕 Creating new database '$DB_NAME'..."
mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Failed to create database"
    exit 1
fi
echo "✅ Database created successfully"

echo ""
echo "🎉 Database reset completed successfully!"
echo "📊 Database '$DB_NAME' is now ready for migration"
echo ""
echo "💡 Next step: Run migration script"
echo "   ./migrate.sh"
echo ""
