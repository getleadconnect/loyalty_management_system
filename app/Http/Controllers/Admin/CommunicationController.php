<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CommunicationTemplate;
use App\Models\CommunicationLog;
use App\Models\CustomerSegment;
use App\Services\SmsService;
use App\Services\WhatsAppService;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommunicationController extends Controller
{
    protected $smsService;
    protected $whatsAppService;
    protected $emailService;

    public function __construct(
        SmsService $smsService,
        WhatsAppService $whatsAppService,
        EmailService $emailService
    ) {
        $this->smsService = $smsService;
        $this->whatsAppService = $whatsAppService;
        $this->emailService = $emailService;
    }

    public function sendIndividualMessage(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'channel' => 'required|in:sms,whatsapp,email',
            'template_id' => 'nullable|exists:communication_templates,id',
            'subject' => 'required_if:channel,email|string|max:255',
            'message' => 'required_if:template_id,null|string',
            'variables' => 'nullable|array'
        ]);

        $customer = User::findOrFail($validated['customer_id']);
        
        // Prepare message content
        $content = $validated['message'] ?? '';
        $subject = $validated['subject'] ?? '';
        
        if ($validated['template_id'] ?? false) {
            $template = CommunicationTemplate::findOrFail($validated['template_id']);
            $processedContent = $template->replaceVariables($validated['variables'] ?? []);
            $content = $processedContent['content'];
            $subject = $processedContent['subject'] ?? $subject;
            $template->incrementUsage();
        }

        // Create communication log
        $log = CommunicationLog::create([
            'channel' => $validated['channel'],
            'type' => 'individual',
            'template_id' => $validated['template_id'] ?? null,
            'sender_id' => $request->user()->id,
            'recipients' => [$customer->toArray()],
            'subject' => $subject,
            'content' => $content,
            'status' => 'processing',
            'total_recipients' => 1,
        ]);

        // Send message based on channel
        $result = $this->sendMessage($validated['channel'], $customer, $subject, $content);

        // Update log status
        if ($result['success']) {
            $log->markAsSent(1, 0);
        } else {
            $log->markAsFailed($result['error'] ?? 'Unknown error');
        }

        return response()->json([
            'success' => $result['success'],
            'message' => $result['success'] ? 'Message sent successfully' : 'Failed to send message',
            'channel' => $validated['channel'],
            'recipient' => $customer->name,
            'log_id' => $log->id
        ]);
    }

    public function sendBulkMessage(Request $request)
    {
        $validated = $request->validate([
            'channel' => 'required|in:sms,whatsapp,email',
            'segment_id' => 'nullable|exists:customer_segments,id',
            'template_id' => 'nullable|exists:communication_templates,id',
            'subject' => 'required_if:channel,email|string|max:255',
            'message' => 'required_if:template_id,null|string',
            'variables' => 'nullable|array',
            'customer_ids' => 'nullable|array',
            'customer_ids.*' => 'exists:users,id'
        ]);

        // Get recipients based on segment or specific IDs
        if ($validated['customer_ids'] ?? false) {
            $recipients = User::whereIn('id', $validated['customer_ids'])->get();
        } elseif ($validated['segment_id'] ?? false) {
            $segment = CustomerSegment::findOrFail($validated['segment_id']);
            $recipients = $segment->getCustomers()->get();
        } else {
            $recipients = User::where('role_id', 2)->get();
        }

        // Prepare message content
        $content = $validated['message'] ?? '';
        $subject = $validated['subject'] ?? '';
        
        if ($validated['template_id'] ?? false) {
            $template = CommunicationTemplate::findOrFail($validated['template_id']);
            $processedContent = $template->replaceVariables($validated['variables'] ?? []);
            $content = $processedContent['content'];
            $subject = $processedContent['subject'] ?? $subject;
            $template->incrementUsage();
        }

        // Create communication log
        $log = CommunicationLog::create([
            'channel' => $validated['channel'],
            'type' => 'bulk',
            'template_id' => $validated['template_id'] ?? null,
            'segment_id' => $validated['segment_id'] ?? null,
            'sender_id' => $request->user()->id,
            'recipients' => $recipients->map(function ($user) {
                return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'mobile' => $user->mobile];
            })->toArray(),
            'subject' => $subject,
            'content' => $content,
            'status' => 'processing',
            'total_recipients' => $recipients->count(),
        ]);

        // Send messages in background (in production, use queues)
        $results = $this->sendBulkMessages($validated['channel'], $recipients, $subject, $content);

        // Update log status
        if ($results['failed_count'] == 0) {
            $log->markAsSent($results['success_count'], 0);
        } elseif ($results['success_count'] == 0) {
            $log->markAsFailed($results['failed'] ?? []);
        } else {
            $log->markAsPartial($results['success_count'], $results['failed_count'], $results['failed'] ?? []);
        }

        return response()->json([
            'message' => 'Bulk message processing completed',
            'channel' => $validated['channel'],
            'total_recipients' => $recipients->count(),
            'successful' => $results['success_count'],
            'failed' => $results['failed_count'],
            'log_id' => $log->id
        ]);
    }

    protected function sendMessage($channel, $user, $subject, $content)
    {
        switch ($channel) {
            case 'sms':
                return $this->smsService->send($user->mobile, $content);
            case 'whatsapp':
                return $this->whatsAppService->sendMessage($user->mobile, $content);
            case 'email':
                return $this->emailService->send(
                    ['email' => $user->email, 'name' => $user->name],
                    $subject,
                    $content
                );
            default:
                return ['success' => false, 'error' => 'Invalid channel'];
        }
    }

    protected function sendBulkMessages($channel, $recipients, $subject, $content)
    {
        $recipientData = [];
        
        foreach ($recipients as $user) {
            switch ($channel) {
                case 'sms':
                    $recipientData[] = $user->mobile;
                    break;
                case 'whatsapp':
                    $recipientData[] = ['phone' => $user->mobile, 'name' => $user->name];
                    break;
                case 'email':
                    $recipientData[] = ['email' => $user->email, 'name' => $user->name];
                    break;
            }
        }

        switch ($channel) {
            case 'sms':
                return $this->smsService->sendBulk($recipientData, $content);
            case 'whatsapp':
                return $this->whatsAppService->sendBulkMessages($recipientData, $content);
            case 'email':
                return $this->emailService->sendBulk($recipientData, $subject, $content);
            default:
                return [
                    'success_count' => 0,
                    'failed_count' => count($recipientData),
                    'failed' => ['Invalid channel']
                ];
        }
    }

    // Template Management CRUD Operations
    
    public function getTemplates(Request $request)
    {
        $query = CommunicationTemplate::query();

        if ($request->channel) {
            $query->where('channel', $request->channel);
        }

        if ($request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        $templates = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($templates);
    }

    public function getTemplate($id)
    {
        $template = CommunicationTemplate::findOrFail($id);
        return response()->json($template);
    }

    public function createTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'event_type' => 'nullable|string|max:100',
            'channel' => 'required|in:sms,whatsapp,email',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        $template = CommunicationTemplate::create($validated);

        return response()->json([
            'message' => 'Template created successfully',
            'template' => $template
        ], 201);
    }

    public function updateTemplate(Request $request, $id)
    {
        $template = CommunicationTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'event_type' => 'nullable|string|max:100',
            'channel' => 'in:sms,whatsapp,email',
            'subject' => 'nullable|string|max:255',
            'content' => 'string',
            'variables' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        $template->update($validated);

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $template
        ]);
    }

    public function deleteTemplate($id)
    {
        $template = CommunicationTemplate::findOrFail($id);
        
        // Check if template has been used
        if ($template->usage_count > 0) {
            // Soft delete by deactivating instead of deleting
            $template->update(['is_active' => false]);
            return response()->json([
                'message' => 'Template deactivated (has been used previously)'
            ]);
        }

        $template->delete();

        return response()->json([
            'message' => 'Template deleted successfully'
        ]);
    }

    // Segment Management CRUD Operations
    
    public function getSegments(Request $request)
    {
        $query = CustomerSegment::query();

        if ($request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        $segments = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($segments);
    }

    public function getSegment($id)
    {
        $segment = CustomerSegment::with('communicationLogs')->findOrFail($id);
        $segment->customer_count = $segment->updateCustomerCount();
        return response()->json($segment);
    }

    public function createSegment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'criteria' => 'required|array',
            'criteria.*.field' => 'required|in:points_balance,registration_date,total_spent,redemption_count,last_activity',
            'criteria.*.operator' => 'required|in:>,<,>=,<=,=,!=',
            'criteria.*.value' => 'required',
            'is_active' => 'boolean'
        ]);

        $segment = CustomerSegment::create($validated);
        $segment->updateCustomerCount();

        return response()->json([
            'message' => 'Segment created successfully',
            'segment' => $segment
        ], 201);
    }

    public function updateSegment(Request $request, $id)
    {
        $segment = CustomerSegment::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'criteria' => 'array',
            'criteria.*.field' => 'required|in:points_balance,registration_date,total_spent,redemption_count,last_activity',
            'criteria.*.operator' => 'required|in:>,<,>=,<=,=,!=',
            'criteria.*.value' => 'required',
            'is_active' => 'boolean'
        ]);

        $segment->update($validated);
        $segment->updateCustomerCount();

        return response()->json([
            'message' => 'Segment updated successfully',
            'segment' => $segment
        ]);
    }

    public function deleteSegment($id)
    {
        $segment = CustomerSegment::findOrFail($id);
        
        // Check if segment has been used in communications
        if ($segment->communicationLogs()->exists()) {
            // Soft delete by deactivating
            $segment->update(['is_active' => false]);
            return response()->json([
                'message' => 'Segment deactivated (has been used in communications)'
            ]);
        }

        $segment->delete();

        return response()->json([
            'message' => 'Segment deleted successfully'
        ]);
    }

    public function getSegmentCustomers($id)
    {
        $segment = CustomerSegment::findOrFail($id);
        $customers = $segment->getCustomers()->paginate(20);
        
        return response()->json($customers);
    }

    // Communication History
    
    public function getCommunicationHistory(Request $request)
    {
        $query = CommunicationLog::with(['template', 'segment', 'sender']);

        if ($request->channel) {
            $query->where('channel', $request->channel);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->days) {
            $query->recent($request->days);
        }

        $history = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($history);
    }

    public function getCommunicationDetails($id)
    {
        $log = CommunicationLog::with(['template', 'segment', 'sender'])->findOrFail($id);
        return response()->json($log);
    }

    // Dashboard Statistics
    
    public function getCommunicationStats(Request $request)
    {
        $days = $request->days ?? 30;

        $stats = [
            'total_sent' => CommunicationLog::recent($days)->where('status', '!=', 'pending')->count(),
            'success_rate' => CommunicationLog::recent($days)->where('status', 'sent')->count(),
            'by_channel' => [
                'sms' => CommunicationLog::recent($days)->where('channel', 'sms')->count(),
                'whatsapp' => CommunicationLog::recent($days)->where('channel', 'whatsapp')->count(),
                'email' => CommunicationLog::recent($days)->where('channel', 'email')->count(),
            ],
            'by_type' => [
                'individual' => CommunicationLog::recent($days)->where('type', 'individual')->count(),
                'bulk' => CommunicationLog::recent($days)->where('type', 'bulk')->count(),
                'automated' => CommunicationLog::recent($days)->where('type', 'automated')->count(),
            ],
            'templates_used' => CommunicationTemplate::where('usage_count', '>', 0)->count(),
            'active_segments' => CustomerSegment::where('is_active', true)->count(),
        ];

        $stats['success_rate'] = $stats['total_sent'] > 0 
            ? round(($stats['success_rate'] / $stats['total_sent']) * 100, 2) 
            : 0;

        return response()->json($stats);
    }
}