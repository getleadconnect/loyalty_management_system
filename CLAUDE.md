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

### Technology Stack
- **Backend Framework**: Laravel 10.x with PHP 8.1+
- **Frontend Framework**: React 19.1.1 with Vite 5.0
- **Authentication**: Laravel Sanctum (API token-based)
- **Database**: MySQL 3.3+ via XAMPP
- **UI Library**: shadcn/ui components with Tailwind CSS 3.4
- **QR/Barcode Scanning**: html5-qrcode, @zxing/browser
- **Charts**: Recharts 3.1.2
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Notifications**: Toastr
- **File Management**: Maatwebsite/Excel for import/export

### Backend Structure

#### Models (`app/Models/`) - 20 Eloquent Models
**Core Models:**
- **User**: Customer/admin users with points_balance, profile images, role-based access
  - Methods: `isAdmin()`, `isCustomer()`, `isStaff()`, `getImageUrlAttribute()`
  - Relationships: pointsTransactions, purchases, redemptions, role
- **PointsTransaction**: Complete transaction history (earned/redeemed)
- **Reward**: Reward catalog with stock, validity periods, categories
  - Method: `isAvailable()` - checks active status, stock, and validity
- **RewardRedemption**: Individual redemptions with unique codes and status tracking
- **ScannedQrcode**: QR code scan tracking with duplicate prevention (unique constraint on user_id + unique_id)
- **Product**: Products that earn loyalty points on purchase
- **Purchase**: Purchase transaction records
- **RedeemCustomer**: Legacy redemption tracking (backward compatibility)

**Communication Models:**
- **CommunicationTemplate**: Reusable message templates for SMS/Email/WhatsApp
  - Methods: `replaceVariables($data)`, `incrementUsage()`
  - Scopes: `active()`, `byChannel()`, `byEventType()`
- **CommunicationLog**: Message sending history with success/failure tracking
- **CustomerSegment**: Customer targeting groups with dynamic criteria
  - Method: `getCustomers()` - retrieves matching customers based on criteria
- **NotificationLog**: SMS/Email/WhatsApp delivery logs

**Settings Models:**
- **Role**: User roles (1=admin, 2=customer, 3=staff)
- **AppSetting**, **EmailSettings**, **SmsSettings**, **WhatsappSettings**: Configuration storage
- **AdsImage**: Carousel advertisements for customer dashboard
- **SocialMediaLink**: Social media profile links

#### Controllers (`app/Http/Controllers/`) - 24 Controllers

**Authentication (`Auth/`):**
- **AuthController**: Registration (with Aadhar validation, image upload), login (status check), logout, user info

**Customer Controllers (`Customer/`):**
- **DashboardController**: Customer stats, points balance, monthly activity
- **BarcodeController**:
  - QR code scanning (`scanQRCode()`, `processQRCode()`)
  - Barcode scanning for products
  - Scan statistics (`getScanStats()`)
- **RewardsController**: Browse rewards, redemption (requires 1000+ lifetime points), redemption history
- **PointsController**: Points balance and transaction history
- **ProfileController**: Customer profile management

**Admin Controllers (`Admin/`):**
- **CustomerController**: Customer CRUD, search, export, point adjustments, messaging
- **ProductController**: Product CRUD, Excel import/export, bulk delete, statistics
- **RewardManagementController**: Reward CRUD with image upload, toggle status, WhatsApp notifications on creation
- **RedeemCustomerController**: View and manage redemptions, bulk status updates
- **CommunicationController**: Individual/bulk messaging, template CRUD, segment CRUD, history and analytics
- **ReportController**: Dashboard reports, delivery reports, engagement metrics, channel performance
- **SettingsController**: SMS/Email/WhatsApp configuration, user management
- **AdsImageController**: Carousel advertisement management
- **SocialMediaLinkController**: Social media link management

#### API Routes (`routes/api.php`)
**Public Routes:**
- `POST /api/register` - Customer registration with image upload
- `POST /api/login` - Login with credentials
- `POST /api/logout` - Logout (requires auth)
- `GET /api/user` - Get authenticated user info

**Customer Routes** (require role:customer middleware):
- Dashboard: `/customer/dashboard`, `/customer/dashboard/monthly-activity`
- Points: `/customer/points/balance`, `/customer/points/history`, `/customer/points/total-earned`
- Rewards: `/customer/rewards`, `/customer/rewards/{id}`, `/customer/rewards/{id}/redeem`, `/customer/redemptions`
- QR Scanning: `/customer/qrcode/scan`, `/customer/qrcode/process`
- Barcode: `/customer/barcode/scan`, `/customer/barcode/process`

**Admin Routes** (require role:admin middleware):
- Customer Management: CRUD, stats, point adjustments, messaging
- Product Management: CRUD, import/export, bulk operations
- Reward Management: CRUD, toggle status, statistics
- Communication: Individual/bulk messaging, template/segment CRUD, history, stats
- Redemption Management: List, status updates, bulk operations
- Reports: Dashboard, delivery, engagement, channel performance
- Settings: SMS/Email/WhatsApp configuration, user/role management
- Ads & Social Media: Carousel ads, social media links

#### Services (`app/Services/`)
- **EmailService**: Individual and bulk email sending with HTML templates
  - Templates: Welcome, Points Earned, Redemption Success, Newsletter
  - Development mode: Simulates emails, logs to database
- **SmsService**: SMS sending with success/failure tracking
- **WhatsAppService**: WhatsApp messaging with bulk support

#### Database (`database/`)
- **28 Migrations**: Define complete database schema
- **Seeders**: Provide initial data for roles, settings, sample data

### Frontend Structure

#### React Application (`resources/js/`)
**Entry Point:** `app.jsx` - React Router v7 setup with protected routes

**Routing Structure:**
- **Public**: `/login`, `/register`
- **Admin** (Protected): `/admin/dashboard`, `/admin/customers`, `/admin/products`, `/admin/rewards`, `/admin/communication`, `/admin/reports`, `/admin/settings`, `/admin/users`, `/admin/profile`
- **Customer** (Protected): `/customer/dashboard`, `/customer/points`, `/customer/rewards`, `/customer/redemptions`, `/customer/qrcode-scanner`, `/customer/profile`, `/customer/about`, `/customer/terms`, `/customer/privacy`

**Components (`resources/js/components/`):**

**Admin Components (`admin/`):**
- **Dashboard.jsx**: Stats cards, Recharts (bar/area charts), quick actions
- **Customers.jsx**: Customer list with search, CRUD operations
- **Products.jsx**: Product management, Excel import/export
- **RewardsManagement.jsx**: Reward CRUD with image upload
- **Communication.jsx**: Message sending (individual/bulk), template/segment management, history
- **Reports.jsx**: Analytics dashboards
- **RedeemedCustomers.jsx**: Redemption tracking and management
- **Settings.jsx**: System configuration
- **Users.jsx**: Admin user management
- **AdsImages.jsx**: Carousel image management

**Customer Components (`customer/`):**
- **Dashboard.jsx**: Points balance, stats, ads carousel, recent transactions, social links
- **BarcodeScanner.jsx**: QR code scanner using html5-qrcode
  - Real-time camera scanning with square 1:1 frame
  - Duplicate prevention using refs
  - shadcn/ui Dialog for scan results
  - AlertDialog for errors
  - Stats cards (today/total scans and points)
  - Proper camera lifecycle management
- **Rewards.jsx**: Browse rewards with filters and sorting
- **Redemptions.jsx**: User redemption history
- **PointsHistory.jsx**: Transaction history with filters
- **MyProfile.jsx**: Profile management with image upload
- **AboutUs.jsx**, **TermsConditions.jsx**, **PrivacyPolicy.jsx**: Info pages

**UI Components (`ui/`):** shadcn/ui components
- Button, Input, Label, Card, Dialog, AlertDialog, Alert, Pagination, Dropdown-menu

**API Service (`services/api.js`):**
- Axios client with request/response interceptors
- Token injection from localStorage
- 401 error handling with auto-redirect to login
- Organized endpoints by feature

### Key Features
1. **Customer Management**: Track customers with profile images, Aadhar validation, points balance
2. **QR Code Scanning**: Real-time camera scanning to earn points (format: UNIQUEID-POINTS)
3. **Reward System**: Catalog with stock management, validity periods, redemption codes
4. **Points System**: Complete transaction history, manual adjustments, earning rules
5. **Communication Suite**: Templates, customer segmentation, individual/bulk messaging via SMS/Email/WhatsApp
6. **Product Management**: Product catalog with barcode scanning, Excel import/export
7. **Reporting & Analytics**: Dashboard stats, charts, engagement metrics, channel performance
8. **Ads & Social Media**: Customer-facing carousel ads, social media link integration
9. **Role-Based Access Control**: Admin, Customer, Staff roles with middleware protection
10. **Import/Export**: Excel functionality for products and customer data

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

## Development Best Practices

### Code Organization
- **Controllers**: All business logic must be in controller methods, NOT in routes
- **Eloquent Models**: All database operations use Eloquent ORM with proper relationships
- **Database Transactions**: Critical operations (points, redemptions) wrapped in DB transactions
- **Validation**: Input validation on all API endpoints using Laravel Form Requests
- **Image Uploads**: Stored in `public/` directories with size/type validation
- **Error Handling**: Try-catch blocks with proper error responses

### Frontend Standards
- **Components**: Use shadcn/ui components for consistent UI
- **API Calls**: Use axios service layer (`services/api.js`) with interceptors
- **Authentication**: Token stored in localStorage, injected via axios interceptors
- **State Management**: React hooks (useState, useEffect, useRef) for local state
- **Camera Access**: Proper lifecycle management (start/stop/cleanup) to prevent memory leaks
- **User Feedback**: Toastr for success messages, AlertDialog for errors, Dialog for modals

### Security
- **Authentication**: Laravel Sanctum tokens with role-based middleware
- **Authorization**: Middleware checks (role:admin, role:customer) on all protected routes
- **Password Hashing**: Laravel's Hash facade for password storage
- **CSRF Protection**: Laravel's built-in CSRF protection
- **File Upload Security**: Type and size validation on all uploads
- **Database Integrity**: Foreign keys, unique constraints, cascading deletes

### Database Schema Highlights
**28 Tables Including:**
- `users` - Customer/admin accounts with points_balance (decimal:2), profile images
- `scanned_qrcodes` - QR scan tracking with composite unique index (user_id, unique_id)
- `points_transactions` - Complete audit trail of all point changes
- `reward_redemptions` - Redemption records with unique codes (RDM-XXXXXXXX)
- `rewards` - Reward catalog with stock_quantity, validity dates
- `communication_templates` - Reusable message templates with variable replacement
- `communication_logs` - Message delivery tracking with success/failure counts
- `customer_segments` - Dynamic customer grouping with JSON criteria

## Key Workflows

### QR Code Scanning Flow (Customer Earns Points)
1. **Frontend**: Customer navigates to `/customer/qrcode-scanner`
2. **Camera Access**: html5-qrcode library initializes with environment camera
3. **Scan**: User scans QR code with format `UNIQUEID-POINTS` (e.g., "ABC123-50")
4. **Validation**: POST `/api/customer/qrcode/scan` validates format and checks for duplicates
5. **Processing**: POST `/api/customer/qrcode/process` creates:
   - `ScannedQrcode` record (user_id, unique_id, points)
   - Updates `users.points_balance` (+points)
   - `PointsTransaction` record (type='earned', description='QR code scan')
6. **Feedback**: Success toast, modal with scan details, updated stats display
7. **Duplicate Prevention**: Composite unique constraint prevents same user scanning same QR twice

### Reward Redemption Flow (Customer Redeems Points)
1. **Browse**: Customer views available rewards at `/customer/rewards`
2. **Filter**: Frontend filters rewards using `Reward::isAvailable()` (active, in_stock, valid dates)
3. **Redeem**: POST `/api/customer/rewards/{id}/redeem` checks:
   - User has 1000+ lifetime points earned
   - User has sufficient points_balance
   - Reward is still available
4. **Transaction**: Creates in single DB transaction:
   - `RewardRedemption` (redemption_code='RDM-12345678', status='pending')
   - `RedeemCustomer` (backward compatibility)
   - `PointsTransaction` (type='redeemed', points=negative)
   - Updates `users.points_balance` (-points)
   - Decrements `rewards.stock_quantity` (-1)
5. **Confirmation**: Returns redemption code for customer to show at pickup/delivery

### Admin Bulk Communication Flow
1. **Segment Selection**: Admin selects pre-defined segment (e.g., "High Value Customers")
2. **Customer Matching**: `CustomerSegment::getCustomers()` evaluates criteria (points_balance > 5000)
3. **Template Selection**: Admin chooses template or writes custom message
4. **Variable Replacement**: `CommunicationTemplate::replaceVariables()` replaces {name}, {points}, etc.
5. **Channel Selection**: Choose SMS, Email, or WhatsApp
6. **Sending**: Service layer sends to all customers in segment
7. **Logging**: `CommunicationLog` tracks:
   - total_recipients count
   - success_count (delivered)
   - failed_count (undelivered)
   - status (processing/sent/failed/partial)
8. **Analytics**: Admin views delivery stats on Reports dashboard

## Recent Changes (2025-10-16)

### QR Code Scanner Implementation

Complete QR code scanning system for customers to earn loyalty points:

#### Database Changes
- **Migration**: `2025_10_16_061243_create_scanned_qrcodes_table.php`
  - Table: `scanned_qrcodes` (id, user_id, unique_id, points, timestamps)
  - Foreign key: `user_id` references `users.id` with CASCADE delete
  - **Unique constraint**: Composite index on `['user_id', 'unique_id']` prevents duplicate scans

- **Model**: `app/Models/ScannedQrcode.php`
  - Fillable: user_id, unique_id, points
  - Relationship: `belongsTo(User::class)`

#### Backend Changes
- **Controller**: `app/Http/Controllers/Customer/BarcodeController.php`
  - **scanQRCode()**: Validates format "UNIQUEID-POINTS", checks duplicates, returns parsed data
  - **processQRCode()**: Creates ScannedQrcode, updates points_balance, logs PointsTransaction (uses DB::transaction)
  - **getScanStats()**: Returns today/total scans and points from ScannedQrcode model

- **Routes**: `routes/api.php`
  - `POST /api/customer/qrcode/scan` - Validate QR code
  - `POST /api/customer/qrcode/process` - Process and award points

#### Frontend Changes
- **Component**: `resources/js/components/customer/BarcodeScanner.jsx`
  - Library: html5-qrcode (changed from @zxing/browser initially planned)
  - Square camera frame (1:1 aspect ratio) for optimal QR scanning
  - Duplicate prevention using React refs (prevents re-render issues)
  - shadcn/ui Dialog for scan result display
  - shadcn/ui AlertDialog for error messages
  - Stats cards: Today's/total scans and points
  - Camera lifecycle: Proper start/stop/cleanup to prevent background errors
  - Vibration feedback on successful scan

- **Route Change**: `/customer/barcode-scanner` → `/customer/qrcode-scanner`
  - Updated in `resources/js/App.jsx`
  - Updated dashboard navigation in `resources/js/components/customer/Dashboard.jsx`

#### Technical Implementation
- **QR Format**: `UNIQUEID-POINTS` (e.g., "LOYALTY2024-100" = 100 points)
- **Duplicate Prevention**:
  - Database: Unique constraint on (user_id, unique_id)
  - Backend: Double validation in scan() and process() methods
  - Frontend: React useRef to track recent scans without re-renders
- **User Feedback**:
  - Toastr: Success notifications
  - Dialog: Scanned QR details (unique_id, points)
  - AlertDialog: Error messages (duplicate scan, invalid format)
- **Camera Management**:
  - useEffect cleanup: Stops scanner on unmount
  - Video track release: Prevents "camera still in use" errors
  - Permission handling: Graceful degradation if camera denied
- **Data Integrity**: All operations in DB transaction ensures consistency

#### Libraries
- **html5-qrcode**: Browser-based QR scanning
- **toastr**: Toast notifications
- **shadcn/ui**: Dialog, AlertDialog, Button, Card components
- **@radix-ui**: Base primitives for accessible modals