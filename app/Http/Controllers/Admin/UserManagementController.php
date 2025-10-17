<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('role');
        
        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('aadhar_number', 'like', "%{$search}%");
            });
        }
        
        // Filter by role
        if ($request->has('role_id') && $request->role_id != '') {
            $query->where('role_id', $request->role_id);
        }
        
        // Filter by status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }
        
        // Filter by date range
        if ($request->has('date_from') && $request->date_from != '') {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to') && $request->date_to != '') {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        $users = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);
        
        // Calculate total stats (without filters)
        $totalStats = [
            'total_staff' => User::count(),
            'active_staff' => User::where('status', 1)->count(),
            'unverified_staff' => User::where('status', 0)->count()
        ];
        
        return response()->json([
            'success' => true,
            'data' => $users,
            'stats' => $totalStats
        ]);
    }
    
    public function getRoles()
    {
        $roles = Role::all();
        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }
    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile' => 'nullable|string|max:20',
            'country_code' => 'nullable|integer',
            'aadhar_number' => 'nullable|string|size:12|regex:/^[0-9]{12}$/',
            'password' => 'required|string|min:8',
            'role_id' => 'required|integer|exists:roles,id',
            'status' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ], [
            'aadhar_number.size' => 'Aadhar number must be exactly 12 digits',
            'aadhar_number.regex' => 'Aadhar number must contain only numbers'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userData = $request->except('image');
        $userData['password'] = Hash::make($request->password);
        $userData['status'] = $request->status ?? 1;
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = 'user_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            // Create user_images directory if it doesn't exist
            $uploadPath = public_path('user_images');
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }
            
            $image->move($uploadPath, $imageName);
            $userData['image'] = 'user_images/' . $imageName;
        }
        
        $user = User::create($userData);
        
        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user->load('role')
        ]);
    }
    
    public function show($id)
    {
        $user = User::with('role')->find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        // Add image URL
        if ($user->image) {
            $user->image_url = asset($user->image);
        }
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
    
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'mobile' => 'nullable|string|max:20',
            'country_code' => 'nullable|integer',
            'aadhar_number' => 'nullable|string|size:12|regex:/^[0-9]{12}$/',
            'password' => 'nullable|string|min:8',
            'role_id' => 'sometimes|required|integer|exists:roles,id',
            'status' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ], [
            'aadhar_number.size' => 'Aadhar number must be exactly 12 digits',
            'aadhar_number.regex' => 'Aadhar number must contain only numbers'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userData = $request->except(['image', 'password']);
        
        // Update password if provided
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($user->image && file_exists(public_path($user->image))) {
                unlink(public_path($user->image));
            }
            
            $image = $request->file('image');
            $imageName = 'user_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            // Create user_images directory if it doesn't exist
            $uploadPath = public_path('user_images');
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }
            
            $image->move($uploadPath, $imageName);
            $userData['image'] = 'user_images/' . $imageName;
        }
        
        $user->update($userData);
        
        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->load('role')
        ]);
    }
    
    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        // Prevent deleting admin users
        if ($user->role_id === 1) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete admin users'
            ], 403);
        }
        
        // Delete user image if exists
        if ($user->image && file_exists(public_path($user->image))) {
            unlink(public_path($user->image));
        }
        
        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
    
    public function toggleStatus($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $user->status = $user->status ? 0 : 1;
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }
    
    public function changePassword(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        // Log the request data for debugging
        \Log::info('Password change request:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'new_password' => 'required|string|min:8|confirmed',
        ]);
        
        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }
        
        $user->password = Hash::make($request->new_password);
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}
