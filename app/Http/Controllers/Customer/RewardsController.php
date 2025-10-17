<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\RedeemCustomer;
use App\Models\PointsTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RewardsController extends Controller
{
    public function index(Request $request)
    {
        $rewards = Reward::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now());
            })
            ->where(function ($query) {
                $query->whereNull('stock_quantity')
                    ->orWhere('stock_quantity', '>', 0);
            })
            ->orderBy('points_required', 'asc')
            ->paginate(12);
            
        return response()->json($rewards);
    }
    
    public function show($id)
    {
        $reward = Reward::findOrFail($id);
        
        return response()->json($reward);
    }
    
    public function redeem(Request $request, $id)
    {
        $reward = Reward::findOrFail($id);
        $user = $request->user();
        
        // Check if user has minimum 1000 points earned (lifetime)
        //$totalEarnedPoints = PointsTransaction::where('user_id', $user->id)->where('type', 'earned')->sum('points');
        
        $totalEarnedPoints=$user->points_balance;
            
        if ($totalEarnedPoints < 1000) {
            return response()->json([
                'message' => 'You need to earn at least 1000 points before you can redeem rewards. Current earned: ' . $totalEarnedPoints
            ], 400);
        }
        
        // Check if reward is available
        if (!$reward->isAvailable()) {
            return response()->json([
                'message' => 'This reward is not currently available'
            ], 400);
        }
        
        // Check if user has enough points
        if ($user->points_balance < $reward->points_required) {
            return response()->json([
                'message' => 'Insufficient points balance'
            ], 400);
        }
        
        DB::transaction(function () use ($user, $reward) {
            // Generate unique redemption code
            $redemptionCode = 'RDM-' . strtoupper(Str::random(8));
            while (RewardRedemption::where('redemption_code', $redemptionCode)->exists()) {
                $redemptionCode = 'RDM-' . strtoupper(Str::random(8));
            }
            
            // Create reward_redemptions record
            $redemption = RewardRedemption::create([
                'user_id' => $user->id,
                'reward_id' => $reward->id,
                'points_spent' => $reward->points_required,
                'status' => 'pending',
                'redemption_code' => $redemptionCode,
                'notes' => null,
                'redeemed_at' => now(),
                'delivered_at' => null
            ]);
            
            // Also create redeem_customers record for backward compatibility
            RedeemCustomer::create([
                'user_id' => $user->id,
                'rewards_id' => $reward->id,
                'reward_redemption_id' => $redemption->id, // Link to reward_redemptions table
                'rewards_name' => $reward->name,
                'redeem_points' => $reward->points_required,
                'redeem_status' => 0, // Set to 0 (pending) initially
                'verified_at' => null,
                'delivery_status' => 0
            ]);
            
            // Update user points balance
            $user->points_balance -= $reward->points_required;
            $user->save();
            
            // Create points transaction with redemption_id reference
            PointsTransaction::create([
                'user_id' => $user->id,
                'type' => 'redeemed',
                'points' => -$reward->points_required,
                'balance_after' => $user->points_balance,
                'description' => 'Redeemed: ' . $reward->name,
                'redemption_id' => $redemption->id
            ]);
            
            // Decrease stock_quantity by 1 if applicable
            if ($reward->stock_quantity !== null && $reward->stock_quantity > 0) {
                $reward->stock_quantity--;
                $reward->save();
            }
        });
        
        return response()->json([
            'message' => 'Redeem successfully completed. Thank You',
            'points_spent' => $reward->points_required,
            'new_balance' => $user->fresh()->points_balance,
        ]);
    }
    
    public function redemptions(Request $request)
    {
        $user = $request->user();
        
        $redemptions = RewardRedemption::where('user_id', $user->id)
            ->with('reward')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return response()->json($redemptions);
    }
}
