<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use DB;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some customer IDs from the database
        $customerIds = DB::table('customers')->pluck('pk_customer_id')->toArray();
        
        // If no customers exist, create some sample customer IDs
        if (empty($customerIds)) {
            // Insert some sample customers first
            for ($i = 1; $i <= 5; $i++) {
                DB::table('customers')->insert([
                    'customer_name' => 'Customer ' . $i,
                    'country_code' => '+1',
                    'mobile' => '555000' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'email' => 'customer' . $i . '@example.com',
                    'dob' => Carbon::now()->subYears(rand(20, 50))->format('Y-m-d'),
                    'created_at' => Carbon::now()->subDays(rand(60, 180)),
                    'updated_at' => Carbon::now()
                ]);
            }
            $customerIds = DB::table('customers')->pluck('pk_customer_id')->toArray();
        }

        $descriptions = [
            'earned' => [
                'Purchase at Store - Order #',
                'Online Purchase - Order #',
                'Referral Bonus',
                'Birthday Bonus Points',
                'Welcome Bonus',
                'Seasonal Promotion',
                'Double Points Event'
            ],
            'redeemed' => [
                'Reward Redemption - Gift Card',
                'Discount Voucher Redemption',
                'Product Exchange',
                'Service Redemption',
                'Free Shipping Redemption'
            ],
            'adjusted' => [
                'Manual Adjustment - Customer Service',
                'Points Correction',
                'Compensation for Issue',
                'Loyalty Tier Bonus'
            ],
            'expired' => [
                'Points Expiration - Inactive Account',
                'Annual Points Expiration',
                'Promotional Points Expired'
            ]
        ];

        // Create transactions for the last 60 days
        for ($i = 0; $i < 200; $i++) {
            $type = ['earned', 'earned', 'earned', 'redeemed', 'adjusted', 'expired'][array_rand([0, 1, 2, 3, 4, 5])];
            $createdAt = Carbon::now()->subDays(rand(0, 60))->subHours(rand(0, 23));
            
            $points = 0;
            $amount = null;
            
            switch ($type) {
                case 'earned':
                    $points = rand(10, 500);
                    $amount = rand(20, 1000);
                    break;
                case 'redeemed':
                    $points = -rand(50, 300);
                    break;
                case 'adjusted':
                    $points = rand(-100, 200);
                    break;
                case 'expired':
                    $points = -rand(10, 100);
                    break;
            }

            $description = $descriptions[$type][array_rand($descriptions[$type])];
            if (strpos($description, 'Order #') !== false) {
                $description .= rand(10000, 99999);
            }

            Transaction::create([
                'customer_id' => $customerIds[array_rand($customerIds)],
                'type' => $type,
                'points' => $points,
                'amount' => $amount,
                'description' => $description,
                'reference_number' => 'TXN' . date('Ymd') . rand(10000, 99999),
                'transaction_id' => uniqid('txn_'),
                'metadata' => json_encode([
                    'source' => ['web', 'mobile', 'pos', 'admin'][array_rand(['web', 'mobile', 'pos', 'admin'])],
                    'ip_address' => '192.168.1.' . rand(1, 255),
                    'user_agent' => 'Mozilla/5.0'
                ]),
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);
        }

        // Create some recent transactions for today
        for ($i = 0; $i < 20; $i++) {
            $type = ['earned', 'earned', 'redeemed'][array_rand([0, 1, 2])];
            $createdAt = Carbon::now()->subHours(rand(0, 12));
            
            $points = $type === 'earned' ? rand(10, 200) : -rand(50, 150);
            $amount = $type === 'earned' ? rand(10, 500) : null;

            Transaction::create([
                'customer_id' => $customerIds[array_rand($customerIds)],
                'type' => $type,
                'points' => $points,
                'amount' => $amount,
                'description' => $type === 'earned' ? 'Today\'s Purchase - Order #' . rand(10000, 99999) : 'Reward Redemption',
                'reference_number' => 'TXN' . date('Ymd') . rand(10000, 99999),
                'transaction_id' => uniqid('txn_'),
                'metadata' => json_encode([
                    'source' => 'web',
                    'campaign' => 'daily_deals',
                    'processed' => true
                ]),
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);
        }

        // Update customer points based on transactions (if points column exists)
        $hasPointsColumn = Schema::hasColumn('customers', 'points');
        if ($hasPointsColumn) {
            foreach ($customerIds as $customerId) {
                $totalPoints = Transaction::where('customer_id', $customerId)->sum('points');
                DB::table('customers')
                    ->where('pk_customer_id', $customerId)
                    ->update([
                        'points' => max(0, $totalPoints),
                        'updated_at' => Carbon::now()
                    ]);
            }
        }

        echo "Seeded " . Transaction::count() . " transactions.\n";
    }
}