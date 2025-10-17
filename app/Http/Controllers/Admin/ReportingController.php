<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PointsTransaction;
use App\Models\Purchase;
use App\Models\RewardRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportingController extends Controller
{
    public function getDashboardStats()
    {
        $stats = [
            'customers' => [
                'total' => User::where('role_id', 2)->count(),
                'active_30_days' => User::where('role_id', 2)
                    ->whereHas('pointsTransactions', function($q) {
                        $q->where('created_at', '>=', now()->subDays(30));
                    })->count(),
                'new_this_month' => User::where('role_id', 2)
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->count(),
            ],
            'points' => [
                'total_in_circulation' => User::where('role_id', 2)->sum('points_balance'),
                'earned_this_month' => PointsTransaction::where('type', 'earned')
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->sum('points'),
                'redeemed_this_month' => PointsTransaction::where('type', 'redeemed')
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->sum(DB::raw('ABS(points)')),
            ],
            'purchases' => [
                'total_this_month' => Purchase::where('created_at', '>=', now()->startOfMonth())
                    ->count(),
                'revenue_this_month' => Purchase::where('created_at', '>=', now()->startOfMonth())
                    ->sum('amount'),
            ],
            'redemptions' => [
                'total_this_month' => RewardRedemption::where('created_at', '>=', now()->startOfMonth())
                    ->count(),
                'pending' => RewardRedemption::where('status', 'pending')->count(),
            ]
        ];
        
        return response()->json($stats);
    }
    
    public function getEngagementMetrics(Request $request)
    {
        $period = $request->input('period', '30'); // days
        $startDate = now()->subDays($period);
        
        $metrics = [
            'daily_active_users' => User::where('role_id', 2)
                ->whereHas('pointsTransactions', function($q) use ($startDate) {
                    $q->where('created_at', '>=', $startDate);
                })
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(DISTINCT user_id) as users'))
                ->groupBy('date')
                ->get(),
            
            'points_activity' => PointsTransaction::where('created_at', '>=', $startDate)
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(CASE WHEN type = "earned" THEN points ELSE 0 END) as earned'),
                    DB::raw('SUM(CASE WHEN type = "redeemed" THEN ABS(points) ELSE 0 END) as redeemed')
                )
                ->groupBy('date')
                ->get(),
            
            'top_customers' => User::where('role_id', 2)
                ->withCount(['purchases', 'redemptions'])
                ->orderBy('points_balance', 'desc')
                ->limit(10)
                ->get(),
        ];
        
        return response()->json($metrics);
    }
    
    public function getCommunicationReport(Request $request)
    {
        // Mock data for communication effectiveness
        $report = [
            'delivery_rates' => [
                'sms' => [
                    'sent' => 500,
                    'delivered' => 485,
                    'rate' => 97,
                ],
                'whatsapp' => [
                    'sent' => 300,
                    'delivered' => 295,
                    'rate' => 98.3,
                ],
                'email' => [
                    'sent' => 1000,
                    'delivered' => 920,
                    'opened' => 350,
                    'open_rate' => 38,
                ],
            ],
            'engagement_by_channel' => [
                'sms' => ['clicks' => 120, 'conversions' => 45],
                'whatsapp' => ['clicks' => 180, 'conversions' => 72],
                'email' => ['clicks' => 95, 'conversions' => 28],
            ],
            'best_performing_campaigns' => [
                ['name' => 'Weekend Double Points', 'channel' => 'whatsapp', 'conversion_rate' => 24],
                ['name' => 'New Rewards Alert', 'channel' => 'sms', 'conversion_rate' => 18],
                ['name' => 'Monthly Newsletter', 'channel' => 'email', 'conversion_rate' => 12],
            ]
        ];
        
        return response()->json($report);
    }
    
    public function getRewardsReport()
    {
        $report = [
            'most_popular' => RewardRedemption::select('reward_id', DB::raw('COUNT(*) as redemption_count'))
                ->with('reward:id,name,points_required')
                ->groupBy('reward_id')
                ->orderBy('redemption_count', 'desc')
                ->limit(5)
                ->get(),
            
            'redemption_trends' => RewardRedemption::where('created_at', '>=', now()->subMonths(6))
                ->select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(points_spent) as total_points')
                )
                ->groupBy('month')
                ->orderBy('month')
                ->get(),
            
            'category_performance' => DB::table('rewards')
                ->leftJoin('reward_redemptions', 'rewards.id', '=', 'reward_redemptions.reward_id')
                ->select(
                    'rewards.category',
                    DB::raw('COUNT(DISTINCT rewards.id) as reward_count'),
                    DB::raw('COUNT(reward_redemptions.id) as redemption_count')
                )
                ->groupBy('rewards.category')
                ->get(),
        ];
        
        return response()->json($report);
    }
    
    public function exportReport(Request $request)
    {
        $type = $request->input('type', 'customers');
        $format = $request->input('format', 'csv');
        
        // TODO: Implement actual export functionality
        
        return response()->json([
            'message' => 'Report export initiated',
            'type' => $type,
            'format' => $format,
            'download_url' => '/api/admin/reports/download/temp-file-id'
        ]);
    }
}
