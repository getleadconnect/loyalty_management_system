<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\NotificationLog;
use Carbon\Carbon;
use DB;

class NotificationLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some customer IDs from the database
        $customerIds = DB::table('customers')->pluck('pk_customer_id')->take(10)->toArray();
        
        // If no customers exist, use dummy IDs
        if (empty($customerIds)) {
            $customerIds = [1, 2, 3, 4, 5];
        }

        $channels = ['sms', 'whatsapp', 'email'];
        $statuses = ['delivered', 'delivered', 'delivered', 'failed', 'pending']; // More delivered for realistic data
        $campaigns = ['Welcome Campaign', 'Holiday Promotion', 'Points Reminder', 'Birthday Wishes', 'Flash Sale'];

        // Create notifications for the last 30 days
        for ($i = 0; $i < 100; $i++) {
            $channel = $channels[array_rand($channels)];
            $status = $statuses[array_rand($statuses)];
            $sentAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23));
            
            $data = [
                'customer_id' => $customerIds[array_rand($customerIds)],
                'channel' => $channel,
                'status' => $status,
                'recipient' => $channel === 'email' ? 'customer@example.com' : '+1234567890',
                'message' => $this->generateMessage($channel),
                'subject' => $channel === 'email' ? 'Special Offer for You!' : null,
                'campaign_name' => $campaigns[array_rand($campaigns)],
                'metadata' => json_encode(['source' => 'system', 'template_id' => rand(1, 10)]),
                'sent_at' => $sentAt,
                'created_at' => $sentAt,
                'updated_at' => $sentAt
            ];

            // Add delivery timestamp if delivered
            if ($status === 'delivered') {
                $data['delivered_at'] = $sentAt->copy()->addMinutes(rand(1, 5));
                
                // Add engagement data for some delivered messages
                if (rand(0, 100) < 40) { // 40% open rate
                    $data['opened_at'] = $sentAt->copy()->addMinutes(rand(10, 120));
                    
                    if (rand(0, 100) < 25) { // 25% click rate of opened
                        $data['clicked_at'] = $sentAt->copy()->addMinutes(rand(15, 180));
                    }
                }
            } elseif ($status === 'failed') {
                $data['failed_at'] = $sentAt->copy()->addMinutes(rand(1, 3));
            }

            NotificationLog::create($data);
        }

        // Create some recent notifications for today
        for ($i = 0; $i < 10; $i++) {
            $channel = $channels[array_rand($channels)];
            $sentAt = Carbon::now()->subHours(rand(0, 8));
            
            NotificationLog::create([
                'customer_id' => $customerIds[array_rand($customerIds)],
                'channel' => $channel,
                'status' => 'delivered',
                'recipient' => $channel === 'email' ? 'recent@example.com' : '+9876543210',
                'message' => $this->generateMessage($channel),
                'subject' => $channel === 'email' ? 'Today\'s Deal!' : null,
                'campaign_name' => 'Daily Deals',
                'metadata' => json_encode(['source' => 'manual', 'user_id' => 1]),
                'sent_at' => $sentAt,
                'delivered_at' => $sentAt->copy()->addMinutes(2),
                'opened_at' => rand(0, 100) < 60 ? $sentAt->copy()->addMinutes(rand(5, 30)) : null,
                'created_at' => $sentAt,
                'updated_at' => $sentAt
            ]);
        }

        echo "Seeded " . NotificationLog::count() . " notification logs.\n";
    }

    private function generateMessage($channel)
    {
        $messages = [
            'sms' => [
                'You have earned 100 bonus points! Check your account now.',
                'Flash Sale: 50% off all rewards today only!',
                'Your points are expiring soon. Redeem them today!',
                'Welcome to our loyalty program! Start earning rewards.',
                'Happy Birthday! Enjoy double points today.'
            ],
            'whatsapp' => [
                '🎉 Congratulations! You\'ve reached Gold status!',
                '📱 New rewards available in your account.',
                '🛍️ Exclusive offer just for you - 30% off!',
                '⏰ Last chance to redeem your expiring points.',
                '🎁 Special birthday reward waiting for you!'
            ],
            'email' => [
                'Thank you for being a valued member. We have special offers waiting for you.',
                'Your monthly points summary is now available.',
                'Exclusive member-only sale starts tomorrow!',
                'You\'re just 50 points away from your next reward.',
                'New products added to our rewards catalog.'
            ]
        ];

        return $messages[$channel][array_rand($messages[$channel])];
    }
}