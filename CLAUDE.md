# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel 10.x Loyalty Management System with a React frontend. The application manages customer loyalty points, rewards, redemptions, and communication templates for businesses.

## Development Commands

### Backend (Laravel/PHP)
```bash
# Run migrations
php artisan migrate

# Run seeders
php artisan db:seed

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Generate models, controllers, migrations
php artisan make:model ModelName
php artisan make:controller ControllerName
php artisan make:migration create_table_name

# Run tests
php artisan test
php artisan test --filter=TestName

# Serve application (if not using XAMPP)
php artisan serve
```

### Frontend (React/Vite)
```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Production build
npm run build
```

### Code Quality
```bash
# Format PHP code (Laravel Pint)
./vendor/bin/pint

# Run PHPUnit tests
./vendor/bin/phpunit
```

## Architecture Overview

### Backend Structure
- **Models** (`app/Models/`): Eloquent ORM models for database entities
  - Core entities: User, Customer, Product, Reward, RewardRedemption, PointsTransaction
  - Communication: CommunicationTemplate, CommunicationLog, NotificationLog
  - Settings: AppSetting, EmailSettings, SmsSettings, WhatsappSettings

- **Controllers** (`app/Http/Controllers/`)
  - `Admin/`: Admin panel controllers for managing loyalty system
  - `Customer/`: Customer-facing controllers
  - `Auth/`: Authentication controllers

- **API Routes** (`routes/api.php`): RESTful API endpoints for the React frontend

- **Services** (`app/Services/`): Business logic layer

- **Database** (`database/`)
  - Migrations define the database schema
  - Seeders provide initial data

### Frontend Structure
- **React App** (`resources/js/`): Single-page React application
  - Entry point: `resources/js/app.jsx`
  - Uses React Router for navigation
  - Tailwind CSS for styling
  - Vite for bundling and hot module replacement

### Key Features
1. **Customer Management**: Track customers and their loyalty points
2. **Reward System**: Define and manage rewards that customers can redeem
3. **Points Transactions**: Track point earnings and redemptions
4. **Communication**: Templates and logs for SMS, Email, and WhatsApp
5. **Product Management**: Manage products that earn loyalty points
6. **Reporting**: Generate reports on customer activity and redemptions
7. **Import/Export**: Excel import/export functionality using Maatwebsite/Excel

## Database Configuration

Using MySQL via XAMPP at `/opt/lampp/`:
- Default connection: MySQL on localhost:3306
- Configure in `.env` file (copy from `.env.example`)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set database credentials
3. Generate application key: `php artisan key:generate`
4. Run migrations: `php artisan migrate`
5. Seed database: `php artisan db:seed`

## Testing

Tests are organized in:
- `tests/Unit/`: Unit tests
- `tests/Feature/`: Feature/integration tests

Configuration in `phpunit.xml`

## Recent Changes (2025-10-16)

### QR Code Scanner Implementation

Implemented a complete QR code scanning system for customers to earn loyalty points:

#### Database Changes
- **Migration**: `database/migrations/2025_10_16_061243_create_scanned_qrcodes_table.php`
  - Created `scanned_qrcodes` table with columns: `id`, `user_id`, `unique_id`, `points`, `timestamps`
  - Added foreign key constraint on `user_id` referencing `users.id`
  - Added unique constraint on `['user_id', 'unique_id']` to prevent duplicate scans

- **Model**: `app/Models/ScannedQrcode.php`
  - Eloquent model with fillable fields: `user_id`, `unique_id`, `points`
  - Relationship: `belongsTo(User::class)`

#### Backend Changes
- **Controller**: `app/Http/Controllers/Customer/BarcodeController.php`
  - Added `scanQRCode()` method:
    - Validates QR code format: "UNIQUEID-POINTS" (split by "-")
    - Checks for duplicate scans per user
    - Returns parsed unique_id and points

  - Added `processQRCode()` method:
    - Creates record in `scanned_qrcodes` table
    - Updates user's `points_balance`
    - Creates `PointsTransaction` record
    - Uses database transactions for data integrity

  - Updated `getScanStats()` method:
    - Changed to query `ScannedQrcode` model instead of `CustomerPoint`
    - Returns: `total_scans`, `points_from_scans`, `today_scans`, `today_points`

- **API Routes**: `routes/api.php`
  - `POST /api/customer/qrcode/scan` - Scan and validate QR code
  - `POST /api/customer/qrcode/process` - Process QR code and add points

#### Frontend Changes
- **Component**: `resources/js/components/customer/BarcodeScanner.jsx`
  - Complete rewrite from barcode scanner to QR code scanner
  - Uses `@zxing/browser` library's `BrowserQRCodeReader`
  - Features:
    - Square camera frame (1:1 aspect ratio)
    - Real-time QR code scanning with camera
    - Duplicate scan prevention using refs
    - Modal dialog (shadcn/ui Dialog) to display scanned details
    - AlertDialog for error messages (e.g., duplicate scans)
    - Stats cards showing today's/total scans and points
    - Proper camera cleanup on component unmount

- **Routes**:
  - Changed from `/customer/barcode-scanner` to `/customer/qrcode-scanner`
  - Updated in `resources/js/App.jsx`
  - Updated navigation in `resources/js/components/customer/Dashboard.jsx`
  - Button text changed from "Scan Product Barcode" to "Scan QR Code"

#### Key Features
1. **QR Code Format**: Expects format "UNIQUEID-POINTS" separated by hyphen
2. **Duplicate Prevention**:
   - Database-level unique constraint
   - Backend validation in both scan and process methods
   - Frontend duplicate prevention using refs
3. **User Feedback**:
   - Success messages via toastr
   - Error messages via AlertDialog
   - Modal dialog for scanned QR code details
4. **Camera Management**:
   - Proper start/stop controls
   - Automatic cleanup to prevent background errors
   - Permission handling
5. **Points Tracking**:
   - Automatic update of user's points_balance
   - Transaction history creation
   - Real-time stats display

#### Libraries Used
- **@zxing/browser**: QR code scanning library
- **toastr**: Toast notifications
- **shadcn/ui**: Dialog and AlertDialog components
- **Radix UI**: Base components for modals

#### Technical Notes
- Camera frame uses square (1:1) aspect ratio for better QR code scanning
- ZXing library chosen over Quagga (which only supports 1D barcodes)
- Refs used to prevent duplicate scans without causing re-renders
- Database transactions ensure data consistency
- Proper video track cleanup prevents memory leaks