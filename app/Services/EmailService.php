<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    protected $fromAddress;
    protected $fromName;

    public function __construct()
    {
        $this->fromAddress = config('mail.from.address', 'noreply@loyalty.com');
        $this->fromName = config('mail.from.name', 'Loyalty Program');
    }

    public function send($recipient, $subject, $content, $metadata = [])
    {
        try {
            $email = is_array($recipient) ? $recipient['email'] : $recipient;
            $name = is_array($recipient) ? ($recipient['name'] ?? '') : '';

            // For development/testing, we'll simulate email sending
            if (app()->environment('local')) {
                Log::info('Email Simulation', [
                    'to' => $email,
                    'subject' => $subject,
                    'content' => $content,
                    'metadata' => $metadata
                ]);

                return [
                    'success' => true,
                    'message_id' => 'EMAIL_' . uniqid(),
                    'simulated' => true,
                    'metadata' => array_merge($metadata, [
                        'email' => $email,
                        'timestamp' => now()->toIso8601String()
                    ])
                ];
            }

            // In production, use Laravel's Mail facade
            Mail::html($this->wrapInTemplate($content, $name), function ($message) use ($email, $subject, $name) {
                $message->to($email, $name)
                        ->subject($subject)
                        ->from($this->fromAddress, $this->fromName);
            });

            return [
                'success' => true,
                'message_id' => 'EMAIL_' . uniqid(),
                'metadata' => array_merge($metadata, [
                    'email' => $email,
                    'timestamp' => now()->toIso8601String()
                ])
            ];
        } catch (\Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'metadata' => $metadata
            ];
        }
    }

    public function sendBulk($recipients, $subject, $content, $metadata = [])
    {
        $results = [
            'successful' => [],
            'failed' => [],
            'total' => count($recipients)
        ];

        foreach ($recipients as $recipient) {
            $result = $this->send($recipient, $subject, $content, $metadata);
            
            if ($result['success']) {
                $results['successful'][] = is_array($recipient) ? $recipient['email'] : $recipient;
            } else {
                $results['failed'][] = [
                    'recipient' => is_array($recipient) ? $recipient['email'] : $recipient,
                    'error' => $result['error']
                ];
            }
        }

        $results['success_count'] = count($results['successful']);
        $results['failed_count'] = count($results['failed']);

        return $results;
    }

    public function sendNewsletter($users, $subject, $content, $metadata = [])
    {
        $recipients = [];
        foreach ($users as $user) {
            $recipients[] = [
                'email' => $user->email,
                'name' => $user->name
            ];
        }

        return $this->sendBulk($recipients, $subject, $content, array_merge($metadata, [
            'type' => 'newsletter'
        ]));
    }

    protected function wrapInTemplate($content, $name = '')
    {
        $greeting = $name ? "Dear {$name}," : "Dear Valued Customer,";
        
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7f7f7;
        }
        .email-container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #7c3aed;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
        }
        .content {
            padding: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #7c3aed;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .points-badge {
            display: inline-block;
            background-color: #fbbf24;
            color: #78350f;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: bold;
        }
        h2 {
            color: #1f2937;
            margin-bottom: 15px;
        }
        .reward-card {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🎁 Loyalty Program</div>
        </div>
        <div class="content">
            <p>{$greeting}</p>
            {$content}
        </div>
        <div class="footer">
            <p>This email was sent by your Loyalty Program.</p>
            <p>© 2025 Loyalty Management System. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    public function getWelcomeTemplate($userName, $initialPoints = 0)
    {
        return <<<HTML
<h2>Welcome to Our Loyalty Program!</h2>
<p>We're thrilled to have you as a member of our exclusive loyalty program.</p>
<p>As a welcome gift, you've been credited with <span class="points-badge">{$initialPoints} points</span> to get you started!</p>
<div class="reward-card">
    <h3>🌟 Member Benefits:</h3>
    <ul>
        <li>Earn points on every purchase</li>
        <li>Exclusive member-only rewards</li>
        <li>Birthday bonuses</li>
        <li>Early access to sales</li>
        <li>Special promotional offers</li>
    </ul>
</div>
<p>Start shopping today and watch your points grow!</p>
<center><a href="#" class="button">View Rewards Catalog</a></center>
HTML;
    }

    public function getPointsEarnedTemplate($points, $description, $newBalance)
    {
        return <<<HTML
<h2>You've Earned Points! 🎉</h2>
<p>Great news! You've just earned loyalty points for your recent activity.</p>
<div class="reward-card">
    <p><strong>Points Earned:</strong> <span class="points-badge">+{$points} points</span></p>
    <p><strong>Activity:</strong> {$description}</p>
    <p><strong>New Balance:</strong> <span class="points-badge">{$newBalance} points</span></p>
</div>
<p>Keep up the great work! You're getting closer to amazing rewards.</p>
<center><a href="#" class="button">Redeem Points</a></center>
HTML;
    }

    public function getRedemptionSuccessTemplate($rewardName, $redemptionCode, $pointsSpent)
    {
        return <<<HTML
<h2>Redemption Successful! ✅</h2>
<p>Congratulations! You've successfully redeemed your points for an amazing reward.</p>
<div class="reward-card">
    <h3>Redemption Details:</h3>
    <p><strong>Reward:</strong> {$rewardName}</p>
    <p><strong>Redemption Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #7c3aed;">{$redemptionCode}</span></p>
    <p><strong>Points Used:</strong> <span class="points-badge">{$pointsSpent} points</span></p>
</div>
<p><strong>Important:</strong> Please save this redemption code. You'll need it to claim your reward.</p>
<p>Thank you for being a valued member of our loyalty program!</p>
HTML;
    }

    public function getNewsletterTemplate($title, $content, $highlights = [])
    {
        $highlightsHtml = '';
        if (!empty($highlights)) {
            $highlightsHtml = '<div class="reward-card"><h3>This Month\'s Highlights:</h3><ul>';
            foreach ($highlights as $highlight) {
                $highlightsHtml .= "<li>{$highlight}</li>";
            }
            $highlightsHtml .= '</ul></div>';
        }

        return <<<HTML
<h2>{$title}</h2>
{$content}
{$highlightsHtml}
<center><a href="#" class="button">Visit Member Portal</a></center>
HTML;
    }

    public function validateEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
}