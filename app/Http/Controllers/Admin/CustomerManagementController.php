<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PointsTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerManagementController extends Controller
{
    public function getCustomers(Request $request)
    {
        $customers = User::where('role_id', 2)
            ->withCount(['purchases', 'redemptions'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
            
        return response()->json($customers);
    }
    
    public function getCustomer($id)
    {
        $customer = User::where('role_id', 2)
            ->where('id', $id)
            ->withCount(['purchases', 'redemptions'])
            ->with(['pointsTransactions' => function($query) {
                $query->latest()->limit(10);
            }])
            ->firstOrFail();
            
        return response()->json($customer);
    }
    
    public function adjustPoints(Request $request, $id)
    {
        $validated = $request->validate([
            'points' => 'required|numeric',
            'reason' => 'required|string|max:255',
            'type' => 'required|in:add,subtract'
        ]);
        
        $customer = User::where('role_id', 2)->findOrFail($id);
        
        DB::transaction(function () use ($customer, $validated) {
            $pointsChange = $validated['type'] === 'add' 
                ? abs($validated['points']) 
                : -abs($validated['points']);
            
            $customer->points_balance += $pointsChange;
            $customer->save();
            
            PointsTransaction::create([
                'user_id' => $customer->id,
                'type' => 'adjustment',
                'points' => $pointsChange,
                'balance_after' => $customer->points_balance,
                'description' => 'Admin adjustment: ' . $validated['reason']
            ]);
        });
        
        return response()->json([
            'message' => 'Points adjusted successfully',
            'new_balance' => $customer->fresh()->points_balance
        ]);
    }
    
    public function searchCustomers(Request $request)
    {
        $query = $request->input('query');
        
        $customers = User::where('role_id', 2)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('phone', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get();
            
        return response()->json($customers);
    }
    
    public function getCustomerStats()
    {
        $stats = [
            'total_customers' => User::where('role_id', 2)->count(),
            'active_customers' => User::where('role_id', 2)
                ->whereHas('pointsTransactions', function($query) {
                    $query->where('created_at', '>=', now()->subDays(30));
                })->count(),
            'total_points_in_circulation' => User::where('role_id', 2)->sum('points_balance'),
            'new_customers_this_month' => User::where('role_id', 2)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),
        ];
        
        return response()->json($stats);
    }
}
