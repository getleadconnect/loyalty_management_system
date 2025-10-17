# Loyalty Management System

A complete loyalty management system built with Laravel (backend) and React with shadcn UI (frontend).

## Features

### Customer Features
- **Registration & Login**: Create loyalty accounts with email and phone number
- **Points Dashboard**: View current balance, transaction history, and statistics
- **Earn Points**: Automatically earn points on purchases (10% of purchase amount)
- **Rewards Catalog**: Browse and redeem available rewards
- **Redemption History**: Track all reward redemptions with status updates
- **Transaction History**: View detailed points earning and spending history

### System Features
- **Role-Based Access**: Separate access for admin (role_id=1) and customers (role_id=2)
- **Secure Authentication**: JWT-based authentication using Laravel Sanctum
- **Responsive UI**: Modern interface built with shadcn components
- **Stock Management**: Track reward availability and stock levels
- **Transaction Tracking**: Complete audit trail of all points transactions

## Installation

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 16+
- MySQL/MariaDB
- XAMPP (if using locally)

### Setup Instructions

1. **Install Dependencies**
```bash
composer install
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Database Configuration**
Update `.env` file with your database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=loyalty_db
DB_USERNAME=root
DB_PASSWORD=
```

4. **Run Migrations & Seeders**
```bash
php artisan migrate
php artisan db:seed --class=RewardsSeeder
php artisan db:seed --class=UserSeeder
```

5. **Build Frontend Assets**
```bash
npm run build
```

6. **Start Development Server**
```bash
php artisan serve
npm run dev  # For development with hot reload
```

## Test Credentials

### Customer Account
- Email: `customer@example.com`
- Password: `password123`
- Initial Points: 1500

### Admin Account
- Email: `admin@example.com`
- Password: `password123`

### Additional Customer
- Email: `jane@example.com`
- Password: `password123`
- Initial Points: 2500

## API Endpoints

### Authentication
- `POST /api/register` - Register new customer
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user info

### Customer Dashboard
- `GET /api/customer/dashboard` - Get dashboard data
- `GET /api/customer/dashboard/monthly-activity` - Get monthly activity

### Points Management
- `GET /api/customer/points/balance` - Get points balance
- `GET /api/customer/points/history` - Get transaction history
- `POST /api/customer/points/earn` - Record points earning

### Rewards
- `GET /api/customer/rewards` - Get available rewards
- `GET /api/customer/rewards/{id}` - Get reward details
- `POST /api/customer/rewards/{id}/redeem` - Redeem a reward
- `GET /api/customer/redemptions` - Get redemption history

## Project Structure

```
loyalty-management-system/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php
│   │   │   └── Customer/
│   │   │       ├── DashboardController.php
│   │   │       ├── PointsController.php
│   │   │       └── RewardsController.php
│   │   └── Middleware/
│   │       └── CheckRole.php
│   └── Models/
│       ├── User.php
│       ├── PointsTransaction.php
│       ├── Purchase.php
│       ├── Reward.php
│       └── RewardRedemption.php
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn components
│   │   │   ├── customer/     # Customer dashboard components
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js        # API service layer
│   │   └── App.jsx           # Main React app
│   └── css/
│       └── app.css           # Tailwind CSS
└── routes/
    ├── api.php               # API routes
    └── web.php               # Web routes
```

## Technologies Used

### Backend
- Laravel 10.x
- Laravel Sanctum (Authentication)
- MySQL Database
- PHP 8.1+

### Frontend
- React 19
- React Router DOM
- shadcn/ui Components
- Tailwind CSS
- Lucide React Icons
- Axios

## Production Deployment

1. **Optimize for Production**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```

2. **Set Environment**
Update `.env`:
```
APP_ENV=production
APP_DEBUG=false
```

3. **Set Permissions**
```bash
chmod -R 755 storage bootstrap/cache
```

## Future Enhancements

- SMS/Email/WhatsApp notifications integration
- Advanced analytics dashboard
- Tier-based loyalty programs
- Referral system
- Points expiration management
- Admin dashboard for managing rewards and customers
- Mobile app integration

## License

This project is proprietary software.