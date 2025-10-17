<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone' => '1234567890',
            'password' => Hash::make('password123'),
            'role_id' => 1, // Admin
            'points_balance' => 0,
        ]);
        
        // Create customer user with some points
        User::create([
            'name' => 'John Doe',
            'email' => 'customer@example.com',
            'phone' => '9876543210',
            'password' => Hash::make('password123'),
            'role_id' => 2, // Customer
            'points_balance' => 1500,
        ]);
        
        // Create another customer
        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'phone' => '5555555555',
            'password' => Hash::make('password123'),
            'role_id' => 2, // Customer
            'points_balance' => 2500,
        ]);
    }
}
