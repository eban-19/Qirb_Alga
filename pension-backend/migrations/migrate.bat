@echo off
REM Database Migration Script for Windows
REM Pension Management System

REM Get absolute path of script
set SCRIPT_DIR=%~dp0

REM Auto-detect migrations directory
if exist "%SCRIPT_DIR%\migrations" (
    set MIGRATIONS_DIR=%SCRIPT_DIR%\migrations
) else if exist "%SCRIPT_DIR%\..\migrations" (
    set MIGRATIONS_DIR=%SCRIPT_DIR%\..\migrations
) else (
    echo ❌ Cannot find migrations directory
    echo 💡 Please run from: pension-backend\migrations\ or pension-backend\
    pause
    exit /b 1
)

REM Load environment variables from .env file
if exist "%SCRIPT_DIR%..\.env" (
    echo � Loading environment variables from .env file...
    for /f "tokens=1,2 delims==" %%a in ('type "%SCRIPT_DIR%..\.env" ^| findstr /v "^#" ^| findstr /v "^$"') do (
        set %%a=%%b
    )
) else (
    echo ⚠️  .env file not found, using default values
)

REM Database configuration with defaults
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_USER%"=="" set DB_USER=root
if "%DB_NAME%"=="" set DB_NAME=pension_management_system
if "%DB_PASS%"=="" set DB_PASS=

echo �🗄️  Pension Management System - Database Migration
echo ==================================================
echo 📍 Script location: %SCRIPT_DIR%
echo 📂 Migrations directory: %MIGRATIONS_DIR%
echo 🔧 Database: %DB_NAME%
echo � User: %DB_USER%
echo 🌐 Host: %DB_HOST%
echo.

echo 📋 Checking database connection...
mysql -u %DB_USER% -p%DB_PASS% -h %DB_HOST% -e "USE %DB_NAME%;" 2>nul
if errorlevel 1 (
    echo ❌ Database '%DB_NAME%' does not exist or connection failed
    echo 💡 Please create database first:
    echo    mysql -u %DB_USER% -p -e "CREATE DATABASE %DB_NAME%;"
    echo    Or run: reset_database.bat
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
    mysql -u %DB_USER% -p%DB_PASS% -h %DB_HOST% %DB_NAME% < %MIGRATIONS_DIR%\%%f
    
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
