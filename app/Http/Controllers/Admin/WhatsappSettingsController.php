<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSettings;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WhatsappSettingsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = WhatsappSettings::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('provider', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('business_id', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Get total count before pagination
        $total = $query->count();

        // Pagination
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        
        $whatsappSettings = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json([
            'whatsapp_settings' => $whatsappSettings,
            'total' => $total,
            'per_page' => (int) $perPage,
            'current_page' => (int) $page,
            'total_pages' => ceil($total / $perPage),
            'from' => (($page - 1) * $perPage) + 1,
            'to' => min($page * $perPage, $total)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:whatsapp_settings',
            'provider' => 'required|string|in:twilio,whatsapp_business,ultramsg,chat_api',
            'api_key' => 'required|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'business_id' => 'nullable|string|max:255',
            'api_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500'
        ]);

        // If this WhatsApp setting is being set as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            WhatsappSettings::where('is_active', true)->update(['is_active' => false]);
        }

        $whatsappSettings = WhatsappSettings::create($validated);

        return response()->json([
            'message' => 'WhatsApp settings created successfully',
            'whatsapp_settings' => $whatsappSettings
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(WhatsappSettings $whatsappSetting)
    {
        return response()->json(['whatsapp_settings' => $whatsappSetting]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WhatsappSettings $whatsappSetting)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('whatsapp_settings')->ignore($whatsappSetting->id)],
            'provider' => 'required|string|in:twilio,whatsapp_business,ultramsg,chat_api',
            'api_key' => 'required|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'business_id' => 'nullable|string|max:255',
            'api_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500'
        ]);

        // If this WhatsApp setting is being set as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            WhatsappSettings::where('id', '!=', $whatsappSetting->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $whatsappSetting->update($validated);

        return response()->json([
            'message' => 'WhatsApp settings updated successfully',
            'whatsapp_settings' => $whatsappSetting
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WhatsappSettings $whatsappSetting)
    {
        // Prevent deletion of active WhatsApp settings
        if ($whatsappSetting->is_active) {
            return response()->json([
                'message' => 'Cannot delete active WhatsApp settings. Please deactivate first.'
            ], 400);
        }

        $whatsappSetting->delete();

        return response()->json([
            'message' => 'WhatsApp settings deleted successfully'
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggleActive(WhatsappSettings $whatsappSetting)
    {
        // If activating this setting, deactivate all others first
        if (!$whatsappSetting->is_active) {
            WhatsappSettings::where('id', '!=', $whatsappSetting->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $whatsappSetting->update(['is_active' => !$whatsappSetting->is_active]);

        return response()->json([
            'message' => 'WhatsApp settings status updated successfully',
            'whatsapp_settings' => $whatsappSetting
        ]);
    }
}