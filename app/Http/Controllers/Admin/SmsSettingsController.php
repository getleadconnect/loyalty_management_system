<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SmsSettings;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SmsSettingsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = SmsSettings::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('provider', 'like', "%{$search}%")
                  ->orWhere('sender_id', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Get total count before pagination
        $total = $query->count();

        // Pagination
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        
        $smsSettings = $query->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json([
            'sms_settings' => $smsSettings,
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
            'name' => 'required|string|max:255|unique:sms_settings',
            'provider' => 'required|string|in:twilio,nexmo,textlocal,msg91',
            'api_key' => 'required|string|max:255',
            'api_secret' => 'required|string|max:255',
            'sender_id' => 'nullable|string|max:11',
            'api_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'description' => 'nullable|string|max:500'
        ]);

        // If this SMS setting is being set as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            SmsSettings::where('is_active', true)->update(['is_active' => false]);
        }

        $smsSettings = SmsSettings::create($validated);

        return response()->json([
            'message' => 'SMS settings created successfully',
            'sms_settings' => $smsSettings
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SmsSettings $smsSetting)
    {
        return response()->json(['sms_settings' => $smsSetting]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SmsSettings $smsSetting)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('sms_settings')->ignore($smsSetting->id)],
            'provider' => 'required|string|in:twilio,nexmo,textlocal,msg91',
            'api_key' => 'required|string|max:255',
            'api_secret' => 'required|string|max:255',
            'sender_id' => 'nullable|string|max:11',
            'api_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'description' => 'nullable|string|max:500'
        ]);

        // If this SMS setting is being set as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            SmsSettings::where('id', '!=', $smsSetting->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $smsSetting->update($validated);

        return response()->json([
            'message' => 'SMS settings updated successfully',
            'sms_settings' => $smsSetting
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SmsSettings $smsSetting)
    {
        // Prevent deletion of active SMS setting
        if ($smsSetting->is_active) {
            return response()->json([
                'message' => 'Cannot delete active SMS settings. Please deactivate first.'
            ], 400);
        }

        $smsSetting->delete();

        return response()->json([
            'message' => 'SMS settings deleted successfully'
        ]);
    }

    /**
     * Set SMS settings as default
     */
    public function setDefault(SmsSettings $smsSetting)
    {
        // Set all other records to not default first
        SmsSettings::query()->update(['is_default' => false]);
        
        // Set this record as default
        $smsSetting->update(['is_default' => true, 'is_active' => true]);

        return response()->json([
            'message' => 'SMS settings set as default successfully',
            'sms_settings' => $smsSetting
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggleActive(SmsSettings $smsSetting)
    {
        // If activating this setting, deactivate all others first
        if (!$smsSetting->is_active) {
            SmsSettings::where('id', '!=', $smsSetting->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $smsSetting->update(['is_active' => !$smsSetting->is_active]);

        return response()->json([
            'message' => 'SMS settings status updated successfully',
            'sms_settings' => $smsSetting
        ]);
    }
}
