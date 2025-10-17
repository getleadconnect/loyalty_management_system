<?php

namespace App\Services;

use App\Models\CommunicationLog;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $apiKey;
    protected $apiUrl;
    protected $senderId;

    public function __construct()
    {
        $this->apiKey = config('services.sms.api_key', '');
        $this->apiUrl = config('services.sms.api_url', '');
        $this->senderId = config('services.sms.sender_id', 'LOYALTY');
    }

    public function send($recipient, $message, $metadata = [])
    {
        try {
            $phoneNumber = $this->formatPhoneNumber($recipient);
            
            // For development/testing, we'll simulate SMS sending
            // In production, integrate with actual SMS gateway like Twilio, Nexmo, etc.
            $response = $this->simulateSend($phoneNumber, $message);
            
            return [
                'success' => $response['success'],
                'message_id' => $response['message_id'] ?? null,
                'error' => $response['error'] ?? null,
                'metadata' => array_merge($metadata, [
                    'phone' => $phoneNumber,
                    'sender_id' => $this->senderId,
                    'timestamp' => now()->toIso8601String()
                ])
            ];
        } catch (\Exception $e) {
            Log::error('SMS sending failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'metadata' => $metadata
            ];
        }
    }

    public function sendBulk($recipients, $message, $metadata = [])
    {
        $results = [
            'successful' => [],
            'failed' => [],
            'total' => count($recipients)
        ];

        foreach ($recipients as $recipient) {
            $result = $this->send($recipient, $message, $metadata);
            
            if ($result['success']) {
                $results['successful'][] = $recipient;
            } else {
                $results['failed'][] = [
                    'recipient' => $recipient,
                    'error' => $result['error']
                ];
            }
        }

        $results['success_count'] = count($results['successful']);
        $results['failed_count'] = count($results['failed']);

        return $results;
    }

    protected function formatPhoneNumber($phone)
    {
        // Remove any non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Add country code if not present (assuming default country code)
        if (strlen($phone) == 10) {
            $phone = '1' . $phone; // Default to US country code
        }
        
        return '+' . $phone;
    }

    protected function simulateSend($phoneNumber, $message)
    {
        // Simulate SMS sending for development
        // In production, replace with actual API call
        
        Log::info('SMS Simulation', [
            'to' => $phoneNumber,
            'message' => $message,
            'sender_id' => $this->senderId
        ]);

        // Simulate 95% success rate
        $success = rand(1, 100) <= 95;

        return [
            'success' => $success,
            'message_id' => $success ? 'SMS_' . uniqid() : null,
            'error' => $success ? null : 'Simulated failure for testing'
        ];
    }

    public function getBalance()
    {
        // Implement SMS credit balance check
        // This would connect to your SMS provider's API
        return [
            'balance' => 1000,
            'currency' => 'USD'
        ];
    }

    public function validatePhoneNumber($phone)
    {
        $formatted = $this->formatPhoneNumber($phone);
        // Basic validation - check if it's a valid phone number format
        return preg_match('/^\+[1-9]\d{10,14}$/', $formatted);
    }
}