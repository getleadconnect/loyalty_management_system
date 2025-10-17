<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CommunicationTemplate;

class CommunicationTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // SMS Templates
            [
                'name' => 'Welcome SMS',
                'event_type' => 'user_registration',
                'channel' => 'sms',
                'subject' => null,
                'content' => 'Welcome to our Loyalty Program, {name}! You have {points} points to start. Visit our store to earn more!',
                'variables' => ['name', 'points'],
                'is_active' => true,
            ],
            [
                'name' => 'Points Earned SMS',
                'event_type' => 'points_earned',
                'channel' => 'sms',
                'subject' => null,
                'content' => 'Great news {name}! You earned {points} points. Your new balance is {balance} points.',
                'variables' => ['name', 'points', 'balance'],
                'is_active' => true,
            ],
            [
                'name' => 'Reward Redeemed SMS',
                'event_type' => 'reward_redeemed',
                'channel' => 'sms',
                'subject' => null,
                'content' => 'Congrats {name}! Your reward "{reward_name}" is confirmed. Code: {redemption_code}',
                'variables' => ['name', 'reward_name', 'redemption_code'],
                'is_active' => true,
            ],
            
            // WhatsApp Templates
            [
                'name' => 'Welcome WhatsApp',
                'event_type' => 'user_registration',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => "🎉 *Welcome to Our Loyalty Program!*\n\nHi {name}! 👋\n\nYou're now part of our exclusive loyalty family!\n\n💎 Starting Balance: *{points} points*\n🎁 Explore amazing rewards in our catalog\n📱 Track your points anytime\n\nThank you for joining us! 🙏",
                'variables' => ['name', 'points'],
                'is_active' => true,
            ],
            [
                'name' => 'Points Earned WhatsApp',
                'event_type' => 'points_earned',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => "💰 *Points Earned!*\n\nGreat news {name}!\n\n➕ Points Earned: *{points}*\n💎 New Balance: *{balance} points*\n📝 Activity: {description}\n\nKeep earning to unlock amazing rewards! 🎁",
                'variables' => ['name', 'points', 'balance', 'description'],
                'is_active' => true,
            ],
            [
                'name' => 'Monthly Update WhatsApp',
                'event_type' => 'monthly_update',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => "📊 *Your Monthly Loyalty Update*\n\nHi {name}!\n\n💎 Current Balance: *{balance} points*\n🛍️ Points Earned This Month: *{monthly_earned}*\n🎁 Rewards Available: *{available_rewards}*\n\n✨ *Special Offer:* Double points this weekend!\n\nVisit our store to earn more rewards! 🚀",
                'variables' => ['name', 'balance', 'monthly_earned', 'available_rewards'],
                'is_active' => true,
            ],
            
            // Email Templates
            [
                'name' => 'Welcome Email',
                'event_type' => 'user_registration',
                'channel' => 'email',
                'subject' => 'Welcome to Our Loyalty Program!',
                'content' => "<h2>Welcome to Our Loyalty Program!</h2>\n<p>Dear {name},</p>\n<p>We're thrilled to have you as a member of our exclusive loyalty program!</p>\n<p>You've been credited with <strong>{points} points</strong> to get you started.</p>\n<h3>Member Benefits:</h3>\n<ul>\n<li>Earn points on every purchase</li>\n<li>Exclusive member-only rewards</li>\n<li>Birthday bonuses</li>\n<li>Early access to sales</li>\n</ul>\n<p>Start shopping today and watch your points grow!</p>",
                'variables' => ['name', 'points'],
                'is_active' => true,
            ],
            [
                'name' => 'Points Earned Email',
                'event_type' => 'points_earned',
                'channel' => 'email',
                'subject' => 'You\'ve Earned {points} Points!',
                'content' => "<h2>Points Earned! 🎉</h2>\n<p>Hi {name},</p>\n<p>Great news! You've just earned loyalty points for your recent activity.</p>\n<div style='background: #f3f4f6; padding: 15px; border-radius: 8px;'>\n<p><strong>Points Earned:</strong> +{points} points</p>\n<p><strong>Activity:</strong> {description}</p>\n<p><strong>New Balance:</strong> {balance} points</p>\n</div>\n<p>Keep up the great work! You're getting closer to amazing rewards.</p>",
                'variables' => ['name', 'points', 'description', 'balance'],
                'is_active' => true,
            ],
            [
                'name' => 'Reward Redeemed Email',
                'event_type' => 'reward_redeemed',
                'channel' => 'email',
                'subject' => 'Your Reward is Ready!',
                'content' => "<h2>Redemption Successful! ✅</h2>\n<p>Dear {name},</p>\n<p>Congratulations! You've successfully redeemed your points for an amazing reward.</p>\n<div style='background: #f3f4f6; padding: 15px; border-radius: 8px;'>\n<h3>Redemption Details:</h3>\n<p><strong>Reward:</strong> {reward_name}</p>\n<p><strong>Redemption Code:</strong> <span style='font-size: 18px; font-weight: bold; color: #7c3aed;'>{redemption_code}</span></p>\n<p><strong>Points Used:</strong> {points_spent} points</p>\n</div>\n<p><strong>Important:</strong> Please save this redemption code. You'll need it to claim your reward.</p>\n<p>Thank you for being a valued member!</p>",
                'variables' => ['name', 'reward_name', 'redemption_code', 'points_spent'],
                'is_active' => true,
            ],
            [
                'name' => 'Monthly Newsletter',
                'event_type' => 'newsletter',
                'channel' => 'email',
                'subject' => 'Your Monthly Loyalty Update - {month}',
                'content' => "<h2>Your Monthly Loyalty Update</h2>\n<p>Hi {name},</p>\n<p>Here's your monthly loyalty program update for {month}:</p>\n<div style='background: #f3f4f6; padding: 15px; border-radius: 8px;'>\n<h3>Your Stats:</h3>\n<p>💎 Current Balance: <strong>{balance} points</strong></p>\n<p>📈 Points Earned This Month: <strong>{monthly_earned}</strong></p>\n<p>🎁 Rewards Redeemed: <strong>{monthly_redeemed}</strong></p>\n</div>\n<h3>This Month's Highlights:</h3>\n<ul>\n<li>New rewards added to the catalog</li>\n<li>Double points weekend coming up!</li>\n<li>Exclusive member-only sale next week</li>\n</ul>\n<p>Keep earning and enjoying your rewards!</p>",
                'variables' => ['name', 'month', 'balance', 'monthly_earned', 'monthly_redeemed'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            CommunicationTemplate::create($template);
        }
    }
}