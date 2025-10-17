<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailSettings;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmailSettingsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EmailSettings::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('mail_driver', 'like', "%{$search}%")
                  ->orWhere('mail_host', 'like', "%{$search}%")
                  ->orWhere('mail_from_address', 'like', "%{$search}%")
                  ->orWhere('mail_from_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Get total count before pagination
        $total = $query->count();

        // Pagination
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        
        $emailSettings = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json([
            'email_settings' => $emailSettings,
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
            'name' => 'required|string|max:255|unique:email_settings',
            'mail_driver' => 'required|string|in:smtp,sendmail,mailgun,ses',
            'mail_host' => 'required|string|max:255',
            'mail_port' => 'required|integer|min:1|max:65535',
            'mail_username' => 'required|string|max:255',
            'mail_password' => 'required|string|max:255',
            'mail_encryption' => 'nullable|string|in:tls,ssl,null',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500'
        ]);

        // If this email setting is being set as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            EmailSettings::where('is_active', true)->update(['is_active' => false]);
        }

        $emailSettings = EmailSettings::create($validated);

        return response()->json([
            'message' => 'Email settings created successfully',
            'email_settings' => $emailSettings
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(EmailSettings $emailSetting)
    {
        return response()->json(['email_settings' => $emailSetting]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EmailSettings $emailSetting)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('email_settings')->ignore($emailSetting->id)],
            'mail_driver' => 'required|string|in:smtp,sendmail,mailgun,ses',
            'mail_host' => 'required|string|max:255',
            'mail_port' => 'required|integer|min:1|max:65535',
            'mail_username' => 'required|string|max:255',
            'mail_password' => 'required|string|max:255',
            'mail_encryption' => 'nullable|string|in:tls,ssl,null',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500'
        ]);

        // If this email setting is being set as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            EmailSettings::where('id', '!=', $emailSetting->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $emailSetting->update($validated);

        return response()->json([
            'message' => 'Email settings updated successfully',
            'email_settings' => $emailSetting
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmailSettings $emailSetting)
    {
        // Prevent deletion of active email settings
        if ($emailSetting->is_active) {
            return response()->json([
                'message' => 'Cannot delete active email settings. Please deactivate first.'
            ], 400);
        }

        $emailSetting->delete();

        return response()->json([
            'message' => 'Email settings deleted successfully'
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggleActive(EmailSettings $emailSetting)
    {
        // If activating this setting, deactivate all others first
        if (!$emailSetting->is_active) {
            EmailSettings::where('id', '!=', $emailSetting->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $emailSetting->update(['is_active' => !$emailSetting->is_active]);

        return response()->json([
            'message' => 'Email settings status updated successfully',
            'email_settings' => $emailSetting
        ]);
    }
}