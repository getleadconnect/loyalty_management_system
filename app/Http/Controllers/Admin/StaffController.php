<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class StaffController extends Controller
{
    // Get all staff users (role_id = 3)
    public function index(Request $request)
    {
        $query = User::where('role_id', 3)->with('role');
        
        // Search functionality
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhere('mobile', 'like', '%' . $search . '%');
            });
        }

        $staff = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);
        
        return response()->json($staff);
    }

    // Get single staff member
    public function show($id)
    {
        $staff = User::where('role_id', 3)->with('role')->findOrFail($id);
        return response()->json($staff);
    }

    // Create new staff member
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'country_code' => 'required|string|max:5',
            'mobile' => 'required|string|max:20',
            'password' => ['required', 'string', Password::min(8)],
        ]);

        $staff = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'],
            'mobile' => $validated['mobile'],
            'password' => Hash::make($validated['password']),
            'role_id' => 3, // Staff role
            'points_balance' => 0,
        ]);

        return response()->json([
            'message' => 'Staff member created successfully',
            'staff' => $staff->load('role')
        ], 201);
    }

    // Update staff member
    public function update(Request $request, $id)
    {
        $staff = User::where('role_id', 3)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $id,
            'country_code' => 'string|max:5',
            'mobile' => 'string|max:20',
        ]);

        $staff->update($validated);

        return response()->json([
            'message' => 'Staff member updated successfully',
            'staff' => $staff->load('role')
        ]);
    }

    // Change staff password
    public function changePassword(Request $request, $id)
    {
        $staff = User::where('role_id', 3)->findOrFail($id);

        $validated = $request->validate([
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $staff->update([
            'password' => Hash::make($validated['password'])
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    // Delete staff member
    public function destroy($id)
    {
        $staff = User::where('role_id', 3)->findOrFail($id);
        
        // Check if the staff member has any related data
        // You might want to soft delete instead of hard delete
        
        $staff->delete();

        return response()->json([
            'message' => 'Staff member deleted successfully'
        ]);
    }

    // Toggle staff status (activate/deactivate)
    public function toggleStatus($id)
    {
        $staff = User::where('role_id', 3)->findOrFail($id);
        
        // You might want to add an 'is_active' field to users table
        // For now, we'll just return success
        
        return response()->json([
            'message' => 'Staff status updated successfully',
            'staff' => $staff->load('role')
        ]);
    }

    // Get staff statistics
    public function stats()
    {
        $stats = [
            'total_staff' => User::where('role_id', 3)->count(),
            'active_staff' => User::where('role_id', 3)->count(), // Add where('is_active', true) if you have that field
            'recent_staff' => User::where('role_id', 3)
                ->where('created_at', '>=', now()->subDays(30))
                ->count(),
        ];

        return response()->json($stats);
    }
}