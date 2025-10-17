<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\DashboardController;
use App\Http\Controllers\Customer\PointsController;
use App\Http\Controllers\Customer\RewardsController;
use App\Http\Controllers\Customer\BarcodeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes
Route::get('/social-media-links/active', [App\Http\Controllers\PublicController::class, 'getActiveSocialMediaLinks']);
Route::get('/ads-images/active', [App\Http\Controllers\PublicController::class, 'getActiveAdsImages']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // User profile routes
    Route::post('/user/change-password', [App\Http\Controllers\UserController::class, 'changePassword']);
    Route::put('/user/profile', [App\Http\Controllers\UserController::class, 'updateProfile']);
    
    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Dashboard
        Route::get('/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'stats']);
        
        // Customer Management
        Route::get('/customers', [App\Http\Controllers\Admin\CustomerController::class, 'index']);
        Route::post('/customers', [App\Http\Controllers\Admin\CustomerController::class, 'store']);
        Route::get('/customers/export', [App\Http\Controllers\Admin\CustomerController::class, 'export']);
        Route::get('/customers/stats', [App\Http\Controllers\Admin\CustomerController::class, 'stats']);
        Route::get('/customers/search', [App\Http\Controllers\Admin\CustomerController::class, 'search']);
        Route::get('/customers/{id}', [App\Http\Controllers\Admin\CustomerController::class, 'show']);
        Route::put('/customers/{id}', [App\Http\Controllers\Admin\CustomerController::class, 'update']);
        Route::delete('/customers/{id}', [App\Http\Controllers\Admin\CustomerController::class, 'destroy']);
        Route::post('/customers/{id}/adjust-points', [App\Http\Controllers\Admin\CustomerController::class, 'adjustPoints']);
        Route::post('/customers/{id}/send-message', [App\Http\Controllers\Admin\CustomerController::class, 'sendMessage']);
        
        // Product Management
        Route::get('/products', [App\Http\Controllers\Admin\ProductController::class, 'index']);
        Route::post('/products', [App\Http\Controllers\Admin\ProductController::class, 'store']);
        Route::get('/products/stats', [App\Http\Controllers\Admin\ProductController::class, 'stats']);
        Route::get('/products/search', [App\Http\Controllers\Admin\ProductController::class, 'search']);
        Route::get('/products/export', [App\Http\Controllers\Admin\ProductController::class, 'export']);
        Route::post('/products/import', [App\Http\Controllers\Admin\ProductController::class, 'import']);
        Route::post('/products/bulk-delete', [App\Http\Controllers\Admin\ProductController::class, 'bulkDelete']);
        Route::get('/products/{id}', [App\Http\Controllers\Admin\ProductController::class, 'show']);
        Route::put('/products/{id}', [App\Http\Controllers\Admin\ProductController::class, 'update']);
        Route::delete('/products/{id}', [App\Http\Controllers\Admin\ProductController::class, 'destroy']);
        Route::post('/products/{id}/toggle-status', [App\Http\Controllers\Admin\ProductController::class, 'toggleStatus']);
        
        // Redeemed Customers Management
        Route::get('/redeemed-customers', [App\Http\Controllers\Admin\RedeemCustomerController::class, 'index']);
        Route::get('/redeemed-customers/export', [App\Http\Controllers\Admin\RedeemCustomerController::class, 'export']);
        Route::get('/redeemed-customers/stats', [App\Http\Controllers\Admin\RedeemCustomerController::class, 'stats']);
        Route::get('/redeemed-customers/{id}', [App\Http\Controllers\Admin\RedeemCustomerController::class, 'show']);
        Route::put('/redeemed-customers/{id}/status', [App\Http\Controllers\Admin\RedeemCustomerController::class, 'updateStatus']);
        Route::delete('/redeemed-customers/{id}', [App\Http\Controllers\Admin\RedeemCustomerController::class, 'destroy']);
        Route::post('/redeemed-customers/bulk-update', [App\Http\Controllers\Admin\RedeemCustomerController::class, 'bulkUpdateStatus']);
        
        // Reward Management
        Route::get('/rewards', [App\Http\Controllers\Admin\RewardManagementController::class, 'getRewards']);
        Route::get('/rewards/stats', [App\Http\Controllers\Admin\RewardManagementController::class, 'getRewardStats']);
        Route::get('/rewards/{id}', [App\Http\Controllers\Admin\RewardManagementController::class, 'getReward']);
        Route::post('/rewards', [App\Http\Controllers\Admin\RewardManagementController::class, 'createReward']);
        Route::put('/rewards/{id}', [App\Http\Controllers\Admin\RewardManagementController::class, 'updateReward']);
        Route::delete('/rewards/{id}', [App\Http\Controllers\Admin\RewardManagementController::class, 'deleteReward']);
        Route::post('/rewards/{id}/toggle-status', [App\Http\Controllers\Admin\RewardManagementController::class, 'toggleRewardStatus']);
        
        // Communication - Messaging
        Route::post('/communication/individual', [App\Http\Controllers\Admin\CommunicationController::class, 'sendIndividualMessage']);
        Route::post('/communication/bulk', [App\Http\Controllers\Admin\CommunicationController::class, 'sendBulkMessage']);
        
        // Communication - Templates CRUD
        Route::get('/communication/templates', [App\Http\Controllers\Admin\CommunicationController::class, 'getTemplates']);
        Route::get('/communication/templates/{id}', [App\Http\Controllers\Admin\CommunicationController::class, 'getTemplate']);
        Route::post('/communication/templates', [App\Http\Controllers\Admin\CommunicationController::class, 'createTemplate']);
        Route::put('/communication/templates/{id}', [App\Http\Controllers\Admin\CommunicationController::class, 'updateTemplate']);
        Route::delete('/communication/templates/{id}', [App\Http\Controllers\Admin\CommunicationController::class, 'deleteTemplate']);
        
        // Communication - Segments CRUD
        Route::get('/communication/segments', [App\Http\Controllers\Admin\CommunicationController::class, 'getSegments']);
        Route::get('/communication/segments/{id}', [App\Http\Controllers\Admin\CommunicationController::class, 'getSegment']);
        Route::post('/communication/segments', [App\Http\Controllers\Admin\CommunicationController::class, 'createSegment']);
        Route::put('/communication/segments/{id}', [App\Http\Controllers\Admin\CommunicationController::class, 'updateSegment']);
        Route::delete('/communication/segments/{id}', [App\Http\Controllers\Admin\CommunicationController::class, 'deleteSegment']);
        Route::get('/communication/segments/{id}/customers', [App\Http\Controllers\Admin\CommunicationController::class, 'getSegmentCustomers']);
        
        // Communication - History & Stats
        Route::get('/communication/history', [App\Http\Controllers\Admin\CommunicationController::class, 'getCommunicationHistory']);
        Route::get('/communication/history/{id}', [App\Http\Controllers\Admin\CommunicationController::class, 'getCommunicationDetails']);
        Route::get('/communication/stats', [App\Http\Controllers\Admin\CommunicationController::class, 'getCommunicationStats']);
        
        // Settings Management
        Route::get('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'index']);
        Route::get('/settings/group/{group}', [App\Http\Controllers\Admin\SettingsController::class, 'getByGroup']);
        Route::put('/settings/sms', [App\Http\Controllers\Admin\SettingsController::class, 'updateSmsSettings']);
        Route::put('/settings/email', [App\Http\Controllers\Admin\SettingsController::class, 'updateEmailSettings']);
        Route::put('/settings/whatsapp', [App\Http\Controllers\Admin\SettingsController::class, 'updateWhatsAppSettings']);
        
        // SMS Settings CRUD
        Route::get('/sms-settings', [App\Http\Controllers\Admin\SmsSettingsController::class, 'index']);
        Route::post('/sms-settings', [App\Http\Controllers\Admin\SmsSettingsController::class, 'store']);
        Route::get('/sms-settings/{smsSetting}', [App\Http\Controllers\Admin\SmsSettingsController::class, 'show']);
        Route::put('/sms-settings/{smsSetting}', [App\Http\Controllers\Admin\SmsSettingsController::class, 'update']);
        Route::delete('/sms-settings/{smsSetting}', [App\Http\Controllers\Admin\SmsSettingsController::class, 'destroy']);
        Route::post('/sms-settings/{smsSetting}/set-default', [App\Http\Controllers\Admin\SmsSettingsController::class, 'setDefault']);
        Route::post('/sms-settings/{smsSetting}/toggle-active', [App\Http\Controllers\Admin\SmsSettingsController::class, 'toggleActive']);
        
        // Email Settings CRUD
        Route::get('/email-settings', [App\Http\Controllers\Admin\EmailSettingsController::class, 'index']);
        Route::post('/email-settings', [App\Http\Controllers\Admin\EmailSettingsController::class, 'store']);
        Route::get('/email-settings/{emailSetting}', [App\Http\Controllers\Admin\EmailSettingsController::class, 'show']);
        Route::put('/email-settings/{emailSetting}', [App\Http\Controllers\Admin\EmailSettingsController::class, 'update']);
        Route::delete('/email-settings/{emailSetting}', [App\Http\Controllers\Admin\EmailSettingsController::class, 'destroy']);
        Route::post('/email-settings/{emailSetting}/toggle-active', [App\Http\Controllers\Admin\EmailSettingsController::class, 'toggleActive']);
        
        // WhatsApp Settings CRUD
        Route::get('/whatsapp-settings', [App\Http\Controllers\Admin\WhatsappSettingsController::class, 'index']);
        Route::post('/whatsapp-settings', [App\Http\Controllers\Admin\WhatsappSettingsController::class, 'store']);
        Route::get('/whatsapp-settings/{whatsappSetting}', [App\Http\Controllers\Admin\WhatsappSettingsController::class, 'show']);
        Route::put('/whatsapp-settings/{whatsappSetting}', [App\Http\Controllers\Admin\WhatsappSettingsController::class, 'update']);
        Route::delete('/whatsapp-settings/{whatsappSetting}', [App\Http\Controllers\Admin\WhatsappSettingsController::class, 'destroy']);
        Route::post('/whatsapp-settings/{whatsappSetting}/toggle-active', [App\Http\Controllers\Admin\WhatsappSettingsController::class, 'toggleActive']);
        
        // Reports
        Route::get('/reports/dashboard', [App\Http\Controllers\Admin\ReportController::class, 'dashboard']);
        Route::get('/reports/delivery', [App\Http\Controllers\Admin\ReportController::class, 'deliveryReports']);
        Route::get('/reports/engagement', [App\Http\Controllers\Admin\ReportController::class, 'engagementMetrics']);
        Route::get('/reports/channel-performance', [App\Http\Controllers\Admin\ReportController::class, 'channelPerformance']);
        Route::get('/reports/redeemed-customers', [App\Http\Controllers\Admin\ReportController::class, 'redeemedCustomersReport']);
        
        // User Management
        Route::get('/users', [App\Http\Controllers\Admin\UserManagementController::class, 'index']);
        Route::get('/users/roles', [App\Http\Controllers\Admin\UserManagementController::class, 'getRoles']);
        Route::post('/users', [App\Http\Controllers\Admin\UserManagementController::class, 'store']);
        Route::get('/users/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'show']);
        Route::post('/users/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'update']);
        Route::delete('/users/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'destroy']);
        Route::post('/users/{id}/toggle-status', [App\Http\Controllers\Admin\UserManagementController::class, 'toggleStatus']);
        Route::put('/users/{id}/change-password', [App\Http\Controllers\Admin\UserManagementController::class, 'changePassword']);
        
        // Roles Management
        Route::get('/roles', [App\Http\Controllers\Admin\SettingsController::class, 'getRoles']);
        Route::get('/roles/{id}', [App\Http\Controllers\Admin\SettingsController::class, 'getRole']);
        Route::post('/roles', [App\Http\Controllers\Admin\SettingsController::class, 'createRole']);
        Route::put('/roles/{id}', [App\Http\Controllers\Admin\SettingsController::class, 'updateRole']);
        Route::delete('/roles/{id}', [App\Http\Controllers\Admin\SettingsController::class, 'deleteRole']);
        
        // Staff Management
        Route::get('/staff', [App\Http\Controllers\Admin\StaffController::class, 'index']);
        Route::get('/staff/stats', [App\Http\Controllers\Admin\StaffController::class, 'stats']);
        Route::get('/staff/{id}', [App\Http\Controllers\Admin\StaffController::class, 'show']);
        Route::post('/staff', [App\Http\Controllers\Admin\StaffController::class, 'store']);
        Route::put('/staff/{id}', [App\Http\Controllers\Admin\StaffController::class, 'update']);
        Route::put('/staff/{id}/change-password', [App\Http\Controllers\Admin\StaffController::class, 'changePassword']);
        Route::delete('/staff/{id}', [App\Http\Controllers\Admin\StaffController::class, 'destroy']);
        Route::post('/staff/{id}/toggle-status', [App\Http\Controllers\Admin\StaffController::class, 'toggleStatus']);
        
        // Ads Images Management
        Route::get('/ads-images', [App\Http\Controllers\Admin\AdsImagesController::class, 'index']);
        Route::post('/ads-images', [App\Http\Controllers\Admin\AdsImagesController::class, 'store']);
        Route::get('/ads-images/{id}', [App\Http\Controllers\Admin\AdsImagesController::class, 'show']);
        Route::post('/ads-images/{id}', [App\Http\Controllers\Admin\AdsImagesController::class, 'update']);
        Route::delete('/ads-images/{id}', [App\Http\Controllers\Admin\AdsImagesController::class, 'destroy']);
        Route::post('/ads-images/{id}/toggle-status', [App\Http\Controllers\Admin\AdsImagesController::class, 'toggleStatus']);
        
        // Social Media Links Management
        Route::get('/social-media-links', [App\Http\Controllers\Admin\SocialMediaLinksController::class, 'index']);
        Route::post('/social-media-links', [App\Http\Controllers\Admin\SocialMediaLinksController::class, 'store']);
        Route::get('/social-media-links/{id}', [App\Http\Controllers\Admin\SocialMediaLinksController::class, 'show']);
        Route::put('/social-media-links/{id}', [App\Http\Controllers\Admin\SocialMediaLinksController::class, 'update']);
        Route::delete('/social-media-links/{id}', [App\Http\Controllers\Admin\SocialMediaLinksController::class, 'destroy']);
        Route::post('/social-media-links/{id}/toggle-status', [App\Http\Controllers\Admin\SocialMediaLinksController::class, 'toggleStatus']);
    });
    
    // Customer Dashboard routes
    Route::prefix('customer')->middleware('role:customer')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/dashboard/monthly-activity', [DashboardController::class, 'monthlyActivity']);
        
        // Points
        Route::get('/points/balance', [PointsController::class, 'balance']);
        Route::get('/points/history', [PointsController::class, 'history']);
        Route::post('/points/earn', [PointsController::class, 'earnPoints']);
        Route::get('/points/total-earned', [PointsController::class, 'totalEarned']);
        
        // Rewards
        Route::get('/rewards', [RewardsController::class, 'index']);
        Route::get('/rewards/{id}', [RewardsController::class, 'show']);
        Route::post('/rewards/{id}/redeem', [RewardsController::class, 'redeem']);
        Route::get('/redemptions', [RewardsController::class, 'redemptions']);
        
        // Barcode Scanner
        Route::post('/barcode/scan', [BarcodeController::class, 'scanBarcode']);
        Route::post('/barcode/process', [BarcodeController::class, 'processScannedProduct']);
        Route::get('/barcode/recent-scans', [BarcodeController::class, 'getRecentScans']);
        Route::get('/barcode/stats', [BarcodeController::class, 'getScanStats']);

        // QR Code Scanner
        Route::post('/qrcode/scan', [BarcodeController::class, 'scanQRCode']);
        Route::post('/qrcode/process', [BarcodeController::class, 'processQRCode']);
    });
});
