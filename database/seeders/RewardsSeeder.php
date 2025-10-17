<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Reward;

class RewardsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rewards = [
            [
                'name' => '$5 Store Credit',
                'description' => 'Get $5 off your next purchase',
                'points_required' => 500,
                'category' => 'Store Credit',
                'is_active' => true,
                'stock_quantity' => null,
            ],
            [
                'name' => '$10 Store Credit',
                'description' => 'Get $10 off your next purchase',
                'points_required' => 900,
                'category' => 'Store Credit',
                'is_active' => true,
                'stock_quantity' => null,
            ],
            [
                'name' => '$25 Store Credit',
                'description' => 'Get $25 off your next purchase',
                'points_required' => 2000,
                'category' => 'Store Credit',
                'is_active' => true,
                'stock_quantity' => null,
            ],
            [
                'name' => 'Free Shipping',
                'description' => 'Free shipping on your next order',
                'points_required' => 300,
                'category' => 'Shipping',
                'is_active' => true,
                'stock_quantity' => 100,
            ],
            [
                'name' => '20% Off Coupon',
                'description' => 'Get 20% off your entire purchase',
                'points_required' => 1500,
                'category' => 'Discount',
                'is_active' => true,
                'stock_quantity' => 50,
            ],
            [
                'name' => 'VIP Member Status',
                'description' => 'Unlock VIP benefits for 3 months',
                'points_required' => 5000,
                'category' => 'Membership',
                'is_active' => true,
                'stock_quantity' => 10,
            ],
            [
                'name' => 'Birthday Special',
                'description' => 'Special birthday discount - 30% off',
                'points_required' => 100,
                'category' => 'Special',
                'is_active' => true,
                'stock_quantity' => null,
            ],
            [
                'name' => 'Mystery Gift',
                'description' => 'Receive a surprise gift with your next order',
                'points_required' => 750,
                'category' => 'Gift',
                'is_active' => true,
                'stock_quantity' => 25,
            ],
        ];
        
        foreach ($rewards as $reward) {
            Reward::create($reward);
        }
    }
}
