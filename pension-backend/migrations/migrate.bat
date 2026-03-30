@echo off
REM Database Migration Script for Windows
REM Pension Management System

REM Database configuration
set DB_USER=root
set DB_NAME=pension_management_system
set MIGRATIONS_DIR=./migrations

echo 🗄️  Pension Management System - Database Migration
echo ==================================================

REM Check if database exists
echo 📋 Checking database connection...
mysql -u %DB_USER% -e "USE %DB_NAME%;" 2>nul
if errorlevel 1 (
    echo ❌ Database '%DB_NAME%' does not exist or connection failed
    echo 💡 Please create database first:
    echo    mysql -u %DB_USER% -p -e "CREATE DATABASE %DB_NAME%;"
    pause
    exit /b 1
)

echo ✅ Database connection successful

REM Get list of migration files
echo 📂 Finding migration files...
dir /b %MIGRATIONS_DIR%\*.sql > migration_list.txt 2>nul
if errorlevel 1 (
    echo ❌ No migration files found in %MIGRATIONS_DIR%
    pause
    exit /b 1
)

echo 📋 Found migration files:
for /f "tokens=*" %%f in (migration_list.txt) do echo    - %%f

echo.
echo 🚀 Starting migration process...
echo.

REM Run each migration
for /f "tokens=*" %%f in (migration_list.txt) do (
    echo 📄 Running migration: %%f
    mysql -u %DB_USER% %DB_NAME% < %MIGRIONS_DIR%\%%f
    
    if errorlevel 1 (
        echo ❌ Migration failed: %%f
        echo 🛑 Stopping migration process
        pause
        exit /b 1
    )
    
    echo ✅ Migration completed: %%f
    echo.
)

echo 🎉 All migrations completed successfully!
echo 📊 Database is now up to date
echo.
echo 🔍 To verify migration:
echo    mysql -u %DB_USER% -e "SHOW TABLES;" %DB_NAME%
echo.

REM Cleanup
del migration_list.txt 2>nul
echo 📝 Migration completed at: %date% %time%
pause
