<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\PointsTransaction;
use App\Models\Purchase;
use App\Models\RewardRedemption;
use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $recentTransactions = PointsTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        $recentPurchases = Purchase::where('user_id', $user->id)
            ->orderBy('purchased_at', 'desc')
            ->take(5)
            ->get();
            
        $recentRedemptions = RewardRedemption::where('user_id', $user->id)
            ->with('reward')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        $stats = [
            'total_points_earned' => PointsTransaction::where('user_id', $user->id)
                ->where('type', 'earned')
                ->sum('points'),
            'total_points_redeemed' => PointsTransaction::where('user_id', $user->id)
                ->where('type', 'redeemed')
                ->sum('points'),
            'total_purchases' => Purchase::where('user_id', $user->id)->count(),
            'total_redemptions' => RewardRedemption::where('user_id', $user->id)->count(),
        ];
        
        // Count available rewards
        $available_rewards = Reward::where('is_active', true)
            ->where(function($query) {
                $query->whereNull('stock_quantity')
                      ->orWhere('stock_quantity', '>', 0);
            })
            ->count();
        
        return response()->json([
            'user' => $user,
            'stats' => $stats,
            'available_rewards' => $available_rewards,
            'recent_transactions' => $recentTransactions,
            'recent_purchases' => $recentPurchases,
            'recent_redemptions' => $recentRedemptions,
        ]);
    }
    
    public function monthlyActivity(Request $request)
    {
        $user = $request->user();
        $year = $request->input('year', date('Y'));
        $month = $request->input('month', date('m'));
        
        $transactions = PointsTransaction::where('user_id', $user->id)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('created_at', 'desc')
            ->get();
            
        $summary = [
            'points_earned' => $transactions->where('type', 'earned')->sum('points'),
            'points_redeemed' => $transactions->where('type', 'redeemed')->sum('points'),
            'transactions_count' => $transactions->count(),
        ];
        
        return response()->json([
            'transactions' => $transactions,
            'summary' => $summary,
        ]);
    }
}
