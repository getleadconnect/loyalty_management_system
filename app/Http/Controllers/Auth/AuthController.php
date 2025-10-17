<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'country_code' => 'required|string|max:5',
            'phone' => 'required|string|max:20',
            'aadhar_number' => 'required|string|size:12|regex:/^[0-9]{12}$/|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);
        
        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'],
            'mobile' => $validated['phone'],
            'aadhar_number' => $validated['aadhar_number'],
            'password' => Hash::make($validated['password']),
            'role_id' => 2, // Customer role
            'points_balance' => 0,
        ];
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('user_image'), $imageName);
            $userData['image'] = 'user_image/' . $imageName;
        }
        
        $user = User::create($userData);
        
        return response()->json([
            'message' => 'Registration successful! Please login to continue.',
            'success' => true
        ], 201);
    }
    
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }
        
        $user = Auth::user();
        
        // Check if user account is active
        if ($user->status != 1) {
            Auth::logout();
            
            $message = "Please be patient. Your account verification is processing, It's take 2 or 3 hours. Thank You.";
            if ($user->status == 2) {
                $message = 'Your account has been blocked. Please contact support.';
            }
            
            throw ValidationException::withMessages([
                'status' => [$message],
            ]);
        }
        
        $token = $user->createToken('auth-token')->plainTextToken;
        
        return response()->json([
            'user' => $user,
            'token' => $token,
            'role' => $user->role_id === 1 ? 'admin' : 'customer',
            'message' => 'Login successful!'
        ]);
    }
    
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
    
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'role' => $request->user()->role_id === 1 ? 'admin' : 'customer',
        ]);
    }
}
