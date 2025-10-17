<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\RedeemCustomer;
use App\Models\User;
use App\Models\Reward;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Get notification delivery reports
     */
    public function deliveryReports(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        // Overall delivery statistics
        $overallStats = [
            'sms' => $this->getChannelStats('sms', $dateRange),
            'whatsapp' => $this->getChannelStats('whatsapp', $dateRange),
            'email' => $this->getChannelStats('email', $dateRange)
        ];

        // Daily delivery trends
        $dailyTrends = NotificationLog::select(
                DB::raw('DATE(COALESCE(sent_at, created_at)) as date'),
                'channel',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "delivered" THEN 1 ELSE 0 END) as delivered'),
                DB::raw('SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
            )
            ->whereNotNull('sent_at')
            ->whereBetween('sent_at', $dateRange)
            ->groupBy('date', 'channel')
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy('date')
            ->map(function ($items) {
                if ($items->isEmpty()) return null;
                $result = ['date' => $items->first()->date];
                foreach ($items as $item) {
                    $result[$item->channel] = [
                        'total' => $item->total,
                        'delivered' => $item->delivered,
                        'failed' => $item->failed,
                        'delivery_rate' => $item->total > 0 ? round(($item->delivered / $item->total) * 100, 2) : 0
                    ];
                }
                return $result;
            })
            ->filter()
            ->values();

        // Recent notifications - simplified query
        $recentNotifications = NotificationLog::orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($notification) {
                // Manually get customer data to avoid relationship issues
                $customer = DB::table('customers')
                    ->where('pk_customer_id', $notification->customer_id)
                    ->first();
                
                $notification->customer = $customer ? [
                    'name' => $customer->customer_name ?? 'Unknown',
                    'email' => $customer->email ?? '',
                    'phone' => $customer->mobile ?? ''
                ] : null;
                
                return $notification;
            });

        return response()->json([
            'overall_stats' => $overallStats,
            'daily_trends' => $dailyTrends,
            'recent_notifications' => $recentNotifications,
            'date_range' => [
                'start' => $dateRange[0]->format('Y-m-d'),
                'end' => $dateRange[1]->format('Y-m-d')
            ]
        ]);
    }

    /**
     * Get customer engagement metrics
     */
    public function engagementMetrics(Request $request)
    {
        $dateRange = $this->getDateRange($request);

        // Program participation stats - using direct DB queries
        $totalCustomers = DB::table('customers')->count();
        
        // Get active customers who have transactions in the date range
        $activeCustomers = DB::table('customers')
            ->whereExists(function ($query) use ($dateRange) {
                $query->select(DB::raw(1))
                    ->from('transactions')
                    ->whereColumn('transactions.customer_id', 'customers.pk_customer_id')
                    ->whereBetween('transactions.created_at', $dateRange);
            })->count();

        $participationRate = $totalCustomers > 0 ? round(($activeCustomers / $totalCustomers) * 100, 2) : 0;

        // Engagement by channel
        $engagementByChannel = [
            'sms' => $this->getChannelEngagement('sms', $dateRange),
            'whatsapp' => $this->getChannelEngagement('whatsapp', $dateRange),
            'email' => $this->getChannelEngagement('email', $dateRange)
        ];

        // Customer activity stats - using direct DB queries
        $customerActivity = [
            'new_customers' => DB::table('customers')
                ->whereBetween('created_at', $dateRange)
                ->count(),
            'returning_customers' => DB::table('transactions')
                ->select('customer_id')
                ->whereBetween('created_at', $dateRange)
                ->groupBy('customer_id')
                ->havingRaw('COUNT(*) > 1')
                ->count(),
            'total_transactions' => DB::table('transactions')
                ->whereBetween('created_at', $dateRange)
                ->count(),
            'total_points_earned' => DB::table('transactions')
                ->whereBetween('created_at', $dateRange)
                ->where('type', 'earned')
                ->sum('points') ?? 0,
            'total_points_redeemed' => DB::table('transactions')
                ->whereBetween('created_at', $dateRange)
                ->where('type', 'redeemed')
                ->sum('points') ?? 0
        ];

        // Engagement trends
        $engagementTrends = NotificationLog::select(
                DB::raw('DATE(sent_at) as date'),
                DB::raw('COUNT(DISTINCT customer_id) as unique_customers'),
                DB::raw('COUNT(*) as total_notifications'),
                DB::raw('SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened'),
                DB::raw('SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked')
            )
            ->whereBetween('sent_at', $dateRange)
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'unique_customers' => $item->unique_customers,
                    'total_notifications' => $item->total_notifications,
                    'opened' => $item->opened,
                    'clicked' => $item->clicked,
                    'open_rate' => $item->total_notifications > 0 ? 
                        round(($item->opened / $item->total_notifications) * 100, 2) : 0,
                    'click_rate' => $item->total_notifications > 0 ? 
                        round(($item->clicked / $item->total_notifications) * 100, 2) : 0
                ];
            });

        return response()->json([
            'participation' => [
                'total_customers' => $totalCustomers,
                'active_customers' => $activeCustomers,
                'participation_rate' => $participationRate
            ],
            'engagement_by_channel' => $engagementByChannel,
            'customer_activity' => $customerActivity,
            'engagement_trends' => $engagementTrends,
            'date_range' => [
                'start' => $dateRange[0]->format('Y-m-d'),
                'end' => $dateRange[1]->format('Y-m-d')
            ]
        ]);
    }

    /**
     * Get channel performance tracking
     */
    public function channelPerformance(Request $request)
    {
        $dateRange = $this->getDateRange($request);

        // Channel effectiveness
        $channelEffectiveness = [];
        foreach (['sms', 'whatsapp', 'email'] as $channel) {
            $stats = $this->getChannelStats($channel, $dateRange);
            $engagement = $this->getChannelEngagement($channel, $dateRange);
            
            // Calculate website visits - simplified query
            $websiteVisits = DB::table('notification_logs as nl')
                ->join('transactions as t', 'nl.customer_id', '=', 't.customer_id')
                ->where('nl.channel', $channel)
                ->whereBetween('nl.sent_at', $dateRange)
                ->whereBetween('t.created_at', $dateRange)
                ->where('t.created_at', '>', DB::raw('nl.sent_at'))
                ->distinct('nl.customer_id')
                ->count('nl.customer_id');

            $channelEffectiveness[$channel] = [
                'total_sent' => $stats['total_sent'],
                'delivered' => $stats['delivered'],
                'delivery_rate' => $stats['delivery_rate'],
                'open_rate' => $engagement['open_rate'],
                'click_rate' => $engagement['click_rate'],
                'website_visits' => $websiteVisits,
                'conversion_rate' => $stats['total_sent'] > 0 ? 
                    round(($websiteVisits / $stats['total_sent']) * 100, 2) : 0,
                'cost_per_message' => $this->getChannelCost($channel),
                'roi_score' => $this->calculateROI($channel, $websiteVisits, $stats['total_sent'])
            ];
        }

        // Best performing campaigns
        $topCampaigns = NotificationLog::select(
                'campaign_name',
                'channel',
                DB::raw('COUNT(*) as total_sent'),
                DB::raw('SUM(CASE WHEN status = "delivered" THEN 1 ELSE 0 END) as delivered'),
                DB::raw('SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened'),
                DB::raw('SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked')
            )
            ->whereNotNull('campaign_name')
            ->whereBetween('sent_at', $dateRange)
            ->groupBy('campaign_name', 'channel')
            ->orderByDesc('clicked')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'campaign' => $item->campaign_name,
                    'channel' => $item->channel,
                    'total_sent' => $item->total_sent,
                    'delivered' => $item->delivered,
                    'opened' => $item->opened,
                    'clicked' => $item->clicked,
                    'click_rate' => $item->total_sent > 0 ? 
                        round(($item->clicked / $item->total_sent) * 100, 2) : 0
                ];
            });

        // Channel comparison
        $channelComparison = [
            'labels' => ['SMS', 'WhatsApp', 'Email'],
            'delivery_rates' => [
                $channelEffectiveness['sms']['delivery_rate'],
                $channelEffectiveness['whatsapp']['delivery_rate'],
                $channelEffectiveness['email']['delivery_rate']
            ],
            'click_rates' => [
                $channelEffectiveness['sms']['click_rate'],
                $channelEffectiveness['whatsapp']['click_rate'],
                $channelEffectiveness['email']['click_rate']
            ],
            'conversion_rates' => [
                $channelEffectiveness['sms']['conversion_rate'],
                $channelEffectiveness['whatsapp']['conversion_rate'],
                $channelEffectiveness['email']['conversion_rate']
            ]
        ];

        return response()->json([
            'channel_effectiveness' => $channelEffectiveness,
            'top_campaigns' => $topCampaigns,
            'channel_comparison' => $channelComparison,
            'date_range' => [
                'start' => $dateRange[0]->format('Y-m-d'),
                'end' => $dateRange[1]->format('Y-m-d')
            ]
        ]);
    }

    /**
     * Get summary dashboard data
     */
    public function dashboard(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        // Quick stats - handle cases where sent_at might be null
        $notificationQuery = NotificationLog::where(function($query) use ($dateRange) {
            $query->whereBetween('sent_at', $dateRange)
                  ->orWhereNull('sent_at');
        });
        
        $quickStats = [
            'total_notifications_sent' => $notificationQuery->count(),
            'total_customers_reached' => $notificationQuery->distinct()->count('customer_id'),
            'average_delivery_rate' => $this->getAverageDeliveryRate($dateRange),
            'average_engagement_rate' => $this->getAverageEngagementRate($dateRange)
        ];

        // Channel distribution
        $channelDistribution = NotificationLog::select('channel', DB::raw('COUNT(*) as count'))
            ->where(function($query) use ($dateRange) {
                $query->whereBetween('sent_at', $dateRange)
                      ->orWhereNull('sent_at');
            })
            ->groupBy('channel')
            ->get()
            ->pluck('count', 'channel');

        // Status distribution
        $statusDistribution = NotificationLog::select('status', DB::raw('COUNT(*) as count'))
            ->where(function($query) use ($dateRange) {
                $query->whereBetween('sent_at', $dateRange)
                      ->orWhereNull('sent_at');
            })
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'quick_stats' => $quickStats,
            'channel_distribution' => $channelDistribution,
            'status_distribution' => $statusDistribution,
            'date_range' => [
                'start' => $dateRange[0]->format('Y-m-d'),
                'end' => $dateRange[1]->format('Y-m-d')
            ]
        ]);
    }

    /**
     * Helper method to get date range
     */
    private function getDateRange(Request $request)
    {
        $startDate = $request->get('start_date') 
            ? Carbon::parse($request->get('start_date'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();
            
        $endDate = $request->get('end_date')
            ? Carbon::parse($request->get('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        return [$startDate, $endDate];
    }

    /**
     * Get channel statistics
     */
    private function getChannelStats($channel, $dateRange)
    {
        $query = NotificationLog::where('channel', $channel)
            ->where(function($q) use ($dateRange) {
                $q->whereBetween('sent_at', $dateRange)
                  ->orWhereNull('sent_at');
            });

        $total = $query->count();
        $delivered = (clone $query)->where('status', 'delivered')->count();
        $failed = (clone $query)->where('status', 'failed')->count();
        $pending = (clone $query)->where('status', 'pending')->count();

        return [
            'total_sent' => $total,
            'delivered' => $delivered,
            'failed' => $failed,
            'pending' => $pending,
            'delivery_rate' => $total > 0 ? round(($delivered / $total) * 100, 2) : 0,
            'failure_rate' => $total > 0 ? round(($failed / $total) * 100, 2) : 0
        ];
    }

    /**
     * Get channel engagement metrics
     */
    private function getChannelEngagement($channel, $dateRange)
    {
        $query = NotificationLog::where('channel', $channel)
            ->where(function($q) use ($dateRange) {
                $q->whereBetween('sent_at', $dateRange)
                  ->orWhereNull('sent_at');
            });

        $total = $query->count();
        $opened = (clone $query)->whereNotNull('opened_at')->count();
        $clicked = (clone $query)->whereNotNull('clicked_at')->count();

        return [
            'total' => $total,
            'opened' => $opened,
            'clicked' => $clicked,
            'open_rate' => $total > 0 ? round(($opened / $total) * 100, 2) : 0,
            'click_rate' => $total > 0 ? round(($clicked / $total) * 100, 2) : 0
        ];
    }

    /**
     * Get estimated channel cost
     */
    private function getChannelCost($channel)
    {
        // These are example costs - should be configured based on actual provider rates
        $costs = [
            'sms' => 0.05,
            'whatsapp' => 0.02,
            'email' => 0.001
        ];

        return $costs[$channel] ?? 0;
    }

    /**
     * Calculate ROI score
     */
    private function calculateROI($channel, $conversions, $totalSent)
    {
        if ($totalSent == 0) return 0;
        
        $cost = $this->getChannelCost($channel) * $totalSent;
        $revenue = $conversions * 10; // Assume $10 average value per conversion
        
        return $cost > 0 ? round((($revenue - $cost) / $cost) * 100, 2) : 0;
    }

    /**
     * Get average delivery rate
     */
    private function getAverageDeliveryRate($dateRange)
    {
        $total = NotificationLog::where(function($q) use ($dateRange) {
            $q->whereBetween('sent_at', $dateRange)
              ->orWhereNull('sent_at');
        })->count();
        $delivered = NotificationLog::where(function($q) use ($dateRange) {
            $q->whereBetween('sent_at', $dateRange)
              ->orWhereNull('sent_at');
        })->where('status', 'delivered')->count();

        return $total > 0 ? round(($delivered / $total) * 100, 2) : 0;
    }

    /**
     * Get average engagement rate
     */
    private function getAverageEngagementRate($dateRange)
    {
        $total = NotificationLog::where(function($q) use ($dateRange) {
            $q->whereBetween('sent_at', $dateRange)
              ->orWhereNull('sent_at');
        })->count();
        $engaged = NotificationLog::where(function($q) use ($dateRange) {
            $q->whereBetween('sent_at', $dateRange)
              ->orWhereNull('sent_at');
        })->where(function ($query) {
            $query->whereNotNull('opened_at')
                  ->orWhereNotNull('clicked_at');
        })->count();

        return $total > 0 ? round(($engaged / $total) * 100, 2) : 0;
    }

    /**
     * Get redeemed customers report from redeem_customers table
     */
    public function redeemedCustomersReport(Request $request)
    {
        // Get filters from request
        $filters = [
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
            'verification_status' => $request->input('verification_status'),
            'delivery_status' => $request->input('delivery_status'),
            'customer_id' => $request->input('customer_id'),
            'reward_id' => $request->input('reward_id'),
            'points_min' => $request->input('points_min'),
            'points_max' => $request->input('points_max'),
        ];

        // Build query with filters
        $query = RedeemCustomer::with(['user', 'reward']);

        // Date range filter
        if ($filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if ($filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Verification status filter (based on verified_at column)
        if ($filters['verification_status'] !== null && $filters['verification_status'] !== '') {
            if ($filters['verification_status'] == '1') {
                $query->whereNotNull('verified_at');
            } else {
                $query->whereNull('verified_at');
            }
        }

        // Delivery status filter
        if ($filters['delivery_status'] !== null && $filters['delivery_status'] !== '') {
            $query->where('delivery_status', $filters['delivery_status']);
        }

        // Customer filter
        if ($filters['customer_id']) {
            $query->where('user_id', $filters['customer_id']);
        }

        // Reward filter
        if ($filters['reward_id']) {
            $query->where('rewards_id', $filters['reward_id']);
        }

        // Points range filter
        if ($filters['points_min']) {
            $query->where('redeem_points', '>=', $filters['points_min']);
        }
        if ($filters['points_max']) {
            $query->where('redeem_points', '<=', $filters['points_max']);
        }

        // Get the data
        $redemptions = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_redemptions' => $redemptions->count(),
            'total_points_redeemed' => $redemptions->sum('redeem_points'),
            'unique_customers' => $redemptions->pluck('user_id')->unique()->count(),
            'verified_count' => $redemptions->whereNotNull('verified_at')->count(),
            'unverified_count' => $redemptions->whereNull('verified_at')->count(),
            'delivered_count' => $redemptions->where('delivery_status', 1)->count(),
            'pending_delivery_count' => $redemptions->where('delivery_status', 0)->count(),
        ];

        // Group by date for chart data
        $dailyRedemptions = $redemptions->groupBy(function($item) {
            return Carbon::parse($item->created_at)->format('Y-m-d');
        })->map(function($dayRedemptions) {
            return [
                'date' => Carbon::parse($dayRedemptions->first()->created_at)->format('M d, Y'),
                'count' => $dayRedemptions->count(),
                'points' => $dayRedemptions->sum('redeem_points'),
            ];
        })->values();

        // Most redeemed rewards
        $topRewards = $redemptions->groupBy('rewards_id')->map(function($rewardRedemptions) {
            $reward = $rewardRedemptions->first()->reward;
            return [
                'reward_id' => $rewardRedemptions->first()->rewards_id,
                'reward_name' => $rewardRedemptions->first()->rewards_name,
                'redemption_count' => $rewardRedemptions->count(),
                'total_points' => $rewardRedemptions->sum('redeem_points'),
            ];
        })->sortByDesc('redemption_count')->take(10)->values();

        // Top customers by redemptions
        $topCustomers = $redemptions->groupBy('user_id')->map(function($customerRedemptions) {
            $user = $customerRedemptions->first()->user;
            return [
                'user_id' => $customerRedemptions->first()->user_id,
                'customer_name' => $user ? $user->name : 'N/A',
                'customer_email' => $user ? $user->email : 'N/A',
                'redemption_count' => $customerRedemptions->count(),
                'total_points' => $customerRedemptions->sum('redeem_points'),
            ];
        })->sortByDesc('total_points')->take(10)->values();

        // Prepare detailed report data
        $detailedData = $redemptions->map(function($redemption) {
            return [
                'id' => $redemption->id,
                'customer_name' => $redemption->user ? $redemption->user->name : 'N/A',
                'customer_email' => $redemption->user ? $redemption->user->email : 'N/A',
                'customer_mobile' => $redemption->user ? $redemption->user->mobile : 'N/A',
                'reward_name' => $redemption->rewards_name,
                'points_redeemed' => $redemption->redeem_points,
                'verification_status' => $redemption->verified_at ? 'Verified' : 'Not Verified',
                'verified_at' => $redemption->verified_at ? Carbon::parse($redemption->verified_at)->format('M d, Y H:i') : null,
                'delivery_status' => $this->getDeliveryStatusText($redemption->delivery_status),
                'redeemed_date' => Carbon::parse($redemption->created_at)->format('M d, Y H:i'),
            ];
        });

        return response()->json([
            'summary' => $summary,
            'filters' => $filters,
            'daily_redemptions' => $dailyRedemptions,
            'top_rewards' => $topRewards,
            'top_customers' => $topCustomers,
            'detailed_data' => $detailedData,
            'export_ready' => true,
        ]);
    }

    /**
     * Get delivery status text
     */
    private function getDeliveryStatusText($status)
    {
        switch ($status) {
            case 0:
                return 'Not Delivered';
            case 1:
                return 'Delivered';
            case 2:
                return 'In Transit';
            default:
                return 'Unknown';
        }
    }
}