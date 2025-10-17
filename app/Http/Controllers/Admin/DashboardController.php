<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Reward;
use App\Models\RedeemCustomer;
use App\Models\RewardRedemption;
use App\Models\PointsTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats()
    {
        try {
            // Get total customers (role_id = 2 for customers)
            $totalCustomers = User::where('role_id', 2)->count();
            
            // Get new customers this month
            $newCustomersThisMonth = User::where('role_id', 2)
                ->whereMonth('created_at', date('m'))
                ->whereYear('created_at', date('Y'))
                ->count();
            
            // Get active rewards (is_active = 1)
            $activeRewards = Reward::where('is_active', 1)->count();
        
        // Get total redemptions
        $totalRedemptions = RedeemCustomer::count();
        
        // Get total points issued
        $totalPointsIssued = PointsTransaction::where('type', 'earned')
            ->where('points', '>', 0)
            ->sum('points');
        
        // Get total points redeemed from reward_redemptions table
        $totalPointsRedeemed = RewardRedemption::sum('points_spent');
        
        // Calculate engagement rate (customers who have redeemed / total customers)
        $customersWhoRedeemed = RedeemCustomer::distinct('user_id')->count('user_id');
        $engagementRate = $totalCustomers > 0 
            ? round(($customersWhoRedeemed / $totalCustomers) * 100, 1) 
            : 0;
        
        // Get monthly data for charts (last 6 months)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->format('M');
            
            // Get monthly redeemed points from reward_redemptions table
            $monthlyRedeemedPoints = RewardRedemption::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('points_spent');
            
            $monthlyData[] = [
                'month' => $month,
                'redeemedPoints' => $monthlyRedeemedPoints
            ];
        }
        
            return response()->json([
                'customers' => [
                    'total' => $totalCustomers,
                    'new_this_month' => $newCustomersThisMonth
                ],
                'rewards' => [
                    'active' => $activeRewards
                ],
                'redemptions' => [
                    'total' => $totalRedemptions
                ],
                'points' => [
                    'total_issued' => $totalPointsIssued,
                    'total_redeemed' => $totalPointsRedeemed
                ],
                'engagement' => [
                    'rate' => $engagementRate
                ],
                'chart_data' => $monthlyData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch dashboard stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}