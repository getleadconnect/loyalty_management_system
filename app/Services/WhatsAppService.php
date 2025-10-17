<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private $apiUrl;
    private $apiKey;
    private $senderId;
    
    public function __construct()
    {
        // You can use services like Twilio, WhatsApp Business API, or UltraMsg
        // This example uses a generic WhatsApp API structure
        $this->apiUrl = env('WHATSAPP_API_URL', 'https://api.whatsapp.com/v1');
        $this->apiKey = env('WHATSAPP_API_KEY', '');
        $this->senderId = env('WHATSAPP_SENDER_ID', '');
    }
    
    /**
     * Send a WhatsApp message to a single recipient
     */
    public function sendMessage($phoneNumber, $message, $mediaUrl = null)
    {
        try {
            // Format phone number (remove spaces, add country code if missing)
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);
            
            $payload = [
                'token' => $this->apiKey,
                'to' => $formattedPhone,
                'body' => $message,
                'from' => $this->senderId,
            ];
            
            // Add media if provided
            if ($mediaUrl) {
                $payload['image'] = $mediaUrl;
            }
            
            // For development/testing, we'll simulate the API call
            if (app()->environment('local') || empty($this->apiKey)) {
                Log::info('WhatsApp message (simulated)', [
                    'to' => $formattedPhone,
                    'message' => $message,
                    'media' => $mediaUrl
                ]);
                return [
                    'success' => true,
                    'message_id' => 'simulated_' . uniqid(),
                    'simulated' => true
                ];
            }
            
            // Make actual API call
            $response = Http::timeout(30)->post($this->apiUrl . '/messages', $payload);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'message_id' => $response->json('message_id'),
                    'data' => $response->json()
                ];
            }
            
            Log::error('WhatsApp API error', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            
            return [
                'success' => false,
                'error' => 'Failed to send WhatsApp message'
            ];
            
        } catch (\Exception $e) {
            Log::error('WhatsApp service error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Send bulk WhatsApp messages
     */
    public function sendBulkMessages($recipients, $message, $mediaUrl = null)
    {
        $results = [
            'success' => [],
            'failed' => [],
            'total' => count($recipients)
        ];
        
        foreach ($recipients as $recipient) {
            $phone = is_array($recipient) ? $recipient['phone'] : $recipient;
            $name = is_array($recipient) ? $recipient['name'] : '';
            
            // Personalize message if name is available
            $personalizedMessage = $message;
            if ($name) {
                $personalizedMessage = str_replace('{{name}}', $name, $message);
            }
            
            $result = $this->sendMessage($phone, $personalizedMessage, $mediaUrl);
            
            if ($result['success']) {
                $results['success'][] = $phone;
            } else {
                $results['failed'][] = [
                    'phone' => $phone,
                    'error' => $result['error'] ?? 'Unknown error'
                ];
            }
            
            // Add delay to avoid rate limiting
            usleep(500000); // 0.5 second delay between messages
        }
        
        $results['success_count'] = count($results['success']);
        $results['failed_count'] = count($results['failed']);
        
        return $results;
    }
    
    /**
     * Send template message (for verified business accounts)
     */
    public function sendTemplateMessage($phoneNumber, $templateName, $parameters = [])
    {
        try {
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);
            
            $payload = [
                'token' => $this->apiKey,
                'to' => $formattedPhone,
                'template_name' => $templateName,
                'parameters' => $parameters,
                'from' => $this->senderId,
            ];
            
            if (app()->environment('local') || empty($this->apiKey)) {
                Log::info('WhatsApp template message (simulated)', $payload);
                return [
                    'success' => true,
                    'message_id' => 'simulated_template_' . uniqid(),
                    'simulated' => true
                ];
            }
            
            $response = Http::timeout(30)->post($this->apiUrl . '/messages/template', $payload);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'message_id' => $response->json('message_id')
                ];
            }
            
            return [
                'success' => false,
                'error' => 'Failed to send template message'
            ];
            
        } catch (\Exception $e) {
            Log::error('WhatsApp template error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Format phone number to international format
     */
    private function formatPhoneNumber($phoneNumber)
    {
        // Remove all non-numeric characters
        $cleaned = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        // Add default country code if not present (example: US +1)
        $defaultCountryCode = env('DEFAULT_COUNTRY_CODE', '1');
        
        // If number doesn't start with country code, add it
        if (strlen($cleaned) == 10) { // Assuming 10-digit local number
            $cleaned = $defaultCountryCode . $cleaned;
        }
        
        return $cleaned;
    }
    
    /**
     * Validate WhatsApp number (check if registered)
     */
    public function validateNumber($phoneNumber)
    {
        try {
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);
            
            if (app()->environment('local') || empty($this->apiKey)) {
                return ['valid' => true, 'simulated' => true];
            }
            
            $response = Http::get($this->apiUrl . '/contacts', [
                'token' => $this->apiKey,
                'phone' => $formattedPhone
            ]);
            
            if ($response->successful()) {
                return [
                    'valid' => $response->json('exists', false),
                    'data' => $response->json()
                ];
            }
            
            return ['valid' => false];
            
        } catch (\Exception $e) {
            Log::error('WhatsApp validation error: ' . $e->getMessage());
            return ['valid' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Create message templates for rewards
     */
    public function getRewardNotificationTemplate($rewardName, $pointsRequired, $description)
    {
        return "🎁 *New Reward Available!*\n\n" .
               "Dear {{name}},\n\n" .
               "We're excited to announce a new reward in our loyalty program!\n\n" .
               "✨ *{$rewardName}*\n" .
               "💎 Points Required: {$pointsRequired}\n" .
               "📝 {$description}\n\n" .
               "Login to your account to redeem this reward before it runs out!\n\n" .
               "Thank you for being a valued customer! 🙏";
    }
    
    /**
     * Create message template for successful redemption
     */
    public function getRedemptionSuccessTemplate($rewardName, $redemptionCode, $pointsSpent)
    {
        return "✅ *Redemption Successful!*\n\n" .
               "Congratulations! You've successfully redeemed:\n\n" .
               "🎁 {$rewardName}\n" .
               "🎫 Redemption Code: *{$redemptionCode}*\n" .
               "💎 Points Used: {$pointsSpent}\n\n" .
               "Please save this code for your records.\n" .
               "Thank you for your loyalty! 🌟";
    }
    
    /**
     * Create message template for points earned
     */
    public function getPointsEarnedTemplate($points, $description, $newBalance)
    {
        return "💰 *Points Earned!*\n\n" .
               "Great news! You've earned loyalty points:\n\n" .
               "➕ Points Earned: {$points}\n" .
               "📝 {$description}\n" .
               "💎 New Balance: {$newBalance} points\n\n" .
               "Keep shopping to earn more rewards! 🛍️";
    }
}