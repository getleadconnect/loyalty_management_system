<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    // Get all settings grouped by category
    public function index()
    {
        $settings = [
            'sms' => AppSetting::getByGroup('sms'),
            'email' => AppSetting::getByGroup('email'),
            'whatsapp' => AppSetting::getByGroup('whatsapp'),
            'general' => AppSetting::getByGroup('general'),
        ];

        return response()->json($settings);
    }

    // Get settings by group
    public function getByGroup($group)
    {
        $settings = AppSetting::byGroup($group)->active()->get();
        
        $formatted = [];
        foreach ($settings as $setting) {
            $formatted[$setting->key] = [
                'value' => AppSetting::get($setting->key),
                'type' => $setting->type,
                'description' => $setting->description
            ];
        }

        return response()->json($formatted);
    }

    // Update SMS Settings
    public function updateSmsSettings(Request $request)
    {
        $validated = $request->validate([
            'sms_provider' => 'nullable|string',
            'sms_api_key' => 'nullable|string',
            'sms_api_secret' => 'nullable|string',
            'sms_sender_id' => 'nullable|string',
            'sms_api_url' => 'nullable|url',
            'sms_enabled' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            AppSetting::set($key, $value, 'sms', $this->getFieldType($key));
        }

        return response()->json([
            'message' => 'SMS settings updated successfully',
            'settings' => AppSetting::getByGroup('sms')
        ]);
    }

    // Update Email Settings
    public function updateEmailSettings(Request $request)
    {
        $validated = $request->validate([
            'mail_driver' => 'nullable|string',
            'mail_host' => 'nullable|string',
            'mail_port' => 'nullable|integer',
            'mail_username' => 'nullable|string',
            'mail_password' => 'nullable|string',
            'mail_encryption' => 'nullable|string',
            'mail_from_address' => 'nullable|email',
            'mail_from_name' => 'nullable|string',
            'email_enabled' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            AppSetting::set($key, $value, 'email', $this->getFieldType($key));
        }

        return response()->json([
            'message' => 'Email settings updated successfully',
            'settings' => AppSetting::getByGroup('email')
        ]);
    }

    // Update WhatsApp Settings
    public function updateWhatsAppSettings(Request $request)
    {
        $validated = $request->validate([
            'whatsapp_provider' => 'nullable|string',
            'whatsapp_api_key' => 'nullable|string',
            'whatsapp_api_url' => 'nullable|url',
            'whatsapp_sender_id' => 'nullable|string',
            'whatsapp_business_id' => 'nullable|string',
            'whatsapp_enabled' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            AppSetting::set($key, $value, 'whatsapp', $this->getFieldType($key));
        }

        return response()->json([
            'message' => 'WhatsApp settings updated successfully',
            'settings' => AppSetting::getByGroup('whatsapp')
        ]);
    }

    // Roles Management
    public function getRoles()
    {
        $roles = Role::active()->get();
        return response()->json($roles);
    }

    public function getRole($id)
    {
        $role = Role::findOrFail($id);
        return response()->json($role);
    }

    public function createRole(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:roles,slug',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        $role = Role::create($validated);

        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role
        ], 201);
    }

    public function updateRole(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        // Prevent editing system roles
        if (in_array($role->id, [1, 2, 3])) {
            return response()->json([
                'message' => 'System roles cannot be modified'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'slug' => 'string|unique:roles,slug,' . $id,
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        $role->update($validated);

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => $role
        ]);
    }

    public function deleteRole($id)
    {
        $role = Role::findOrFail($id);

        // Prevent deleting system roles
        if (in_array($role->id, [1, 2, 3])) {
            return response()->json([
                'message' => 'System roles cannot be deleted'
            ], 403);
        }

        // Check if role has users
        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete role with existing users'
            ], 400);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully'
        ]);
    }

    private function getFieldType($key)
    {
        if (strpos($key, '_enabled') !== false) {
            return 'boolean';
        }
        if (strpos($key, '_port') !== false) {
            return 'integer';
        }
        return 'text';
    }
}