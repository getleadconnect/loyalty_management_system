<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CustomerSegment;

class CustomerSegmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $segments = [
            [
                'name' => 'High Value Customers',
                'description' => 'Customers with points balance greater than or equal to 1000',
                'criteria' => [
                    [
                        'field' => 'points_balance',
                        'operator' => '>=',
                        'value' => '1000'
                    ]
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Active Customers',
                'description' => 'Customers who have earned points in the last 30 days',
                'criteria' => [
                    [
                        'field' => 'last_activity',
                        'operator' => '>=',
                        'value' => now()->subDays(30)->format('Y-m-d')
                    ]
                ],
                'is_active' => true,
            ],
            [
                'name' => 'New Members',
                'description' => 'Customers who joined in the last 7 days',
                'criteria' => [
                    [
                        'field' => 'registration_date',
                        'operator' => '>=',
                        'value' => now()->subDays(7)->format('Y-m-d')
                    ]
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Low Points Balance',
                'description' => 'Customers with less than 100 points who might need encouragement',
                'criteria' => [
                    [
                        'field' => 'points_balance',
                        'operator' => '<',
                        'value' => '100'
                    ]
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Frequent Redeemers',
                'description' => 'Customers who have redeemed more than 3 rewards',
                'criteria' => [
                    [
                        'field' => 'redemption_count',
                        'operator' => '>',
                        'value' => '3'
                    ]
                ],
                'is_active' => true,
            ],
        ];

        foreach ($segments as $segmentData) {
            $segment = CustomerSegment::create($segmentData);
            $segment->updateCustomerCount();
        }
    }
}