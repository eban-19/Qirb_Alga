@echo off
REM Database Reset Script for Windows
REM Pension Management System - Drops and recreates database

REM Get absolute path of script
set SCRIPT_DIR=%~dp0

REM Load environment variables from .env file
if exist "%SCRIPT_DIR%..\.env" (
    echo 📋 Loading environment variables from .env file...
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

echo 🗄️  Pension Management System - Database Reset
echo =============================================
echo 📍 Script location: %SCRIPT_DIR%
echo 🔧 Database: %DB_NAME%
echo 👤 User: %DB_USER%
echo 🌐 Host: %DB_HOST%
echo.

echo 📋 Checking MySQL connection...
mysql -u %DB_USER% -p%DB_PASS% -h %DB_HOST% -e "SELECT 1;" 2>nul
if errorlevel 1 (
    echo ❌ MySQL connection failed
    echo 💡 Please check your MySQL credentials and service
    pause
    exit /b 1
)

echo ✅ MySQL connection successful

REM Drop database if exists
echo 🗑️  Dropping database '%DB_NAME%' if it exists...
mysql -u %DB_USER% -p%DB_PASS% -h %DB_HOST% -e "DROP DATABASE IF EXISTS %DB_NAME%;" 2>nul
if errorlevel 1 (
    echo ❌ Failed to drop database
    pause
    exit /b 1
)
echo ✅ Database dropped successfully

REM Create new database
echo 🆕 Creating new database '%DB_NAME%'...
mysql -u %DB_USER% -p%DB_PASS% -h %DB_HOST% -e "CREATE DATABASE %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if errorlevel 1 (
    echo ❌ Failed to create database
    pause
    exit /b 1
)
echo ✅ Database created successfully

echo.
echo 🎉 Database reset completed successfully!
echo 📊 Database '%DB_NAME%' is now ready for migration
echo.
echo 💡 Next step: Run migration script
echo    migrate.bat
echo.
pause
