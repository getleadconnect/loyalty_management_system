<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\PointsTransaction;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PointsController extends Controller
{
    public function balance(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'points_balance' => $user->points_balance,
            'lifetime_earned' => PointsTransaction::where('user_id', $user->id)
                ->where('type', 'earned')
                ->sum('points'),
            'lifetime_redeemed' => PointsTransaction::where('user_id', $user->id)
                ->where('type', 'redeemed')
                ->sum('points'),
        ]);
    }
    
    public function history(Request $request)
    {
        $user = $request->user();
        
        $transactions = PointsTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
            
        return response()->json($transactions);
    }
    
    public function earnPoints(Request $request)
    {
        $validated = $request->validate([
            'order_number' => 'required|string|unique:purchases',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);
        
        $user = $request->user();
        $pointsEarned = $validated['amount'] * 0.1; // 10% of purchase amount as points
        
        DB::transaction(function () use ($user, $validated, $pointsEarned) {
            // Create purchase record
            $purchase = Purchase::create([
                'user_id' => $user->id,
                'order_number' => $validated['order_number'],
                'amount' => $validated['amount'],
                'points_earned' => $pointsEarned,
                'description' => $validated['description'] ?? null,
                'purchased_at' => now(),
            ]);
            
            // Update user points balance
            $user->points_balance += $pointsEarned;
            $user->save();
            
            // Create points transaction
            PointsTransaction::create([
                'user_id' => $user->id,
                'type' => 'earned',
                'points' => $pointsEarned,
                'balance_after' => $user->points_balance,
                'description' => 'Points earned from purchase #' . $validated['order_number'],
                'purchase_id' => $purchase->id,
            ]);
        });
        
        return response()->json([
            'message' => 'Points earned successfully!',
            'points_earned' => $pointsEarned,
            'new_balance' => $user->fresh()->points_balance,
        ]);
    }
    
    public function totalEarned(Request $request)
    {
        $user = $request->user();
        
        $totalEarned = PointsTransaction::where('user_id', $user->id)
            ->where('type', 'earned')
            ->sum('points');
            
        return response()->json([
            'total_earned' => $totalEarned
        ]);
    }
}
