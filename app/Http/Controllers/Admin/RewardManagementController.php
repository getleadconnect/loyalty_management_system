<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RewardManagementController extends Controller
{
    public function getRewards(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $query = Reward::withCount('redemptions');
        
        // Apply search filter
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }
        
        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);
        
        $rewards = $query->paginate($perPage);
            
        return response()->json($rewards);
    }
    
    public function getReward($id)
    {
        $reward = Reward::withCount('redemptions')->findOrFail($id);
        return response()->json($reward);
    }
    
    public function createReward(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'points_required' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image_url' => 'nullable|string',
            'stock_quantity' => 'nullable|integer|min:0',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'terms_conditions' => 'nullable|string',
            'is_active' => 'boolean'
        ]);
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('rewards'), $imageName);
            $validated['image_url'] = '/rewards/' . $imageName;
        }
        
        $reward = Reward::create($validated);
        
        // Send WhatsApp notification to all customers about new reward
        $this->notifyCustomersAboutNewReward($reward);
        
        return response()->json([
            'message' => 'Reward created successfully',
            'reward' => $reward
        ], 201);
    }
    
    public function updateReward(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'points_required' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image_url' => 'nullable|string',
            'stock_quantity' => 'nullable|integer|min:0',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'terms_conditions' => 'nullable|string',
            'is_active' => 'boolean'
        ]);
        
        $reward = Reward::findOrFail($id);
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($reward->image_url && Str::startsWith($reward->image_url, '/rewards/')) {
                $oldImagePath = public_path($reward->image_url);
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
            
            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('rewards'), $imageName);
            $validated['image_url'] = '/rewards/' . $imageName;
        }
        
        $reward->update($validated);
        
        return response()->json([
            'message' => 'Reward updated successfully',
            'reward' => $reward
        ]);
    }
    
    public function deleteReward($id)
    {
        $reward = Reward::findOrFail($id);
        
        if ($reward->redemptions()->exists()) {
            return response()->json([
                'message' => 'Cannot delete reward with existing redemptions'
            ], 400);
        }
        
        $reward->delete();
        
        return response()->json([
            'message' => 'Reward deleted successfully'
        ]);
    }
    
    public function toggleRewardStatus($id)
    {
        $reward = Reward::findOrFail($id);
        $reward->is_active = !$reward->is_active;
        $reward->save();
        
        return response()->json([
            'message' => 'Reward status updated',
            'is_active' => $reward->is_active
        ]);
    }
    
    public function getRewardStats()
    {
        $stats = [
            'total_rewards' => Reward::count(),
            'active_rewards' => Reward::where('is_active', true)->count(),
            'total_redemptions' => \App\Models\RewardRedemption::count(),
            'low_stock_count' => Reward::where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<', 10)->count(),
            'most_redeemed' => Reward::withCount('redemptions')
                ->orderBy('redemptions_count', 'desc')
                ->limit(5)
                ->get(),
        ];
        
        return response()->json($stats);
    }
    
    /**
     * Send WhatsApp notification to all customers about new reward
     */
    private function notifyCustomersAboutNewReward(Reward $reward)
    {
        try {
            $whatsappService = new WhatsAppService();
            
            // Get all active customers with valid phone numbers
            $customers = User::where('role_id', 2)
                ->whereNotNull('mobile')
                ->where('mobile', '!=', '')
                ->select('id', 'name', 'country_code', 'mobile')
                ->get();
            
            if ($customers->isEmpty()) {
                Log::info('No customers to notify about new reward');
                return;
            }
            
            // Prepare recipient list
            $recipients = [];
            foreach ($customers as $customer) {
                $phone = $customer->country_code . $customer->mobile;
                $recipients[] = [
                    'phone' => $phone,
                    'name' => $customer->name
                ];
            }
            
            // Create notification message
            $message = $whatsappService->getRewardNotificationTemplate(
                $reward->name,
                $reward->points_required,
                $reward->description
            );
            
            // Send bulk messages in background
            dispatch(function () use ($whatsappService, $recipients, $message, $reward) {
                $result = $whatsappService->sendBulkMessages(
                    $recipients, 
                    $message,
                    $reward->image_url
                );
                
                Log::info('WhatsApp notifications sent for new reward', [
                    'reward_id' => $reward->id,
                    'reward_name' => $reward->name,
                    'total_recipients' => $result['total'],
                    'successful' => $result['success_count'],
                    'failed' => $result['failed_count']
                ]);
            })->afterResponse();
            
        } catch (\Exception $e) {
            Log::error('Failed to send WhatsApp notifications for new reward: ' . $e->getMessage());
        }
    }
}
