<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'id' => 1,
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'System administrator with full access',
                'permissions' => [
                    'manage_users',
                    'manage_staff',
                    'manage_customers',
                    'manage_rewards',
                    'manage_communication',
                    'manage_settings',
                    'view_reports',
                    'export_data'
                ],
                'is_active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Customer',
                'slug' => 'customer',
                'description' => 'Loyalty program customer',
                'permissions' => [
                    'view_dashboard',
                    'view_points',
                    'redeem_rewards',
                    'view_history',
                    'update_profile'
                ],
                'is_active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Staff',
                'slug' => 'staff',
                'description' => 'Staff member with limited admin access',
                'permissions' => [
                    'view_customers',
                    'manage_rewards',
                    'send_communication',
                    'view_reports'
                ],
                'is_active' => true,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['id' => $roleData['id']],
                $roleData
            );
        }
    }
}