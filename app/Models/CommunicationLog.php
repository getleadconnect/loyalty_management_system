<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel',
        'type',
        'template_id',
        'segment_id',
        'sender_id',
        'recipients',
        'subject',
        'content',
        'status',
        'total_recipients',
        'successful_count',
        'failed_count',
        'error_details',
        'metadata',
        'scheduled_at',
        'sent_at',
    ];

    protected $casts = [
        'recipients' => 'array',
        'error_details' => 'array',
        'metadata' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function template()
    {
        return $this->belongsTo(CommunicationTemplate::class, 'template_id');
    }

    public function segment()
    {
        return $this->belongsTo(CustomerSegment::class, 'segment_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function markAsSent($successCount = null, $failedCount = null)
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
            'successful_count' => $successCount ?? $this->total_recipients,
            'failed_count' => $failedCount ?? 0,
        ]);
    }

    public function markAsFailed($errorDetails = null)
    {
        $this->update([
            'status' => 'failed',
            'error_details' => $errorDetails,
            'failed_count' => $this->total_recipients,
        ]);
    }

    public function markAsPartial($successCount, $failedCount, $errorDetails = null)
    {
        $this->update([
            'status' => 'partial',
            'sent_at' => now(),
            'successful_count' => $successCount,
            'failed_count' => $failedCount,
            'error_details' => $errorDetails,
        ]);
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getSuccessRateAttribute()
    {
        if ($this->total_recipients == 0) {
            return 0;
        }
        return round(($this->successful_count / $this->total_recipients) * 100, 2);
    }
}