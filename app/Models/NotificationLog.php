<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'channel',
        'status',
        'recipient',
        'message',
        'subject',
        'campaign_name',
        'metadata',
        'sent_at',
        'delivered_at',
        'failed_at',
        'opened_at',
        'clicked_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'failed_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the customer that owns the notification log.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'pk_customer_id');
    }

    /**
     * Scope to filter by channel
     */
    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('sent_at', [$startDate, $endDate]);
    }

    /**
     * Get delivery rate
     */
    public static function getDeliveryRate($channel = null, $dateRange = null)
    {
        $query = self::query();
        
        if ($channel) {
            $query->where('channel', $channel);
        }
        
        if ($dateRange) {
            $query->whereBetween('sent_at', $dateRange);
        }
        
        $total = $query->count();
        $delivered = $query->where('status', 'delivered')->count();
        
        return $total > 0 ? round(($delivered / $total) * 100, 2) : 0;
    }

    /**
     * Get engagement metrics
     */
    public static function getEngagementMetrics($channel = null, $dateRange = null)
    {
        $query = self::query();
        
        if ($channel) {
            $query->where('channel', $channel);
        }
        
        if ($dateRange) {
            $query->whereBetween('sent_at', $dateRange);
        }
        
        $total = $query->count();
        $opened = $query->whereNotNull('opened_at')->count();
        $clicked = $query->whereNotNull('clicked_at')->count();
        
        return [
            'open_rate' => $total > 0 ? round(($opened / $total) * 100, 2) : 0,
            'click_rate' => $total > 0 ? round(($clicked / $total) * 100, 2) : 0
        ];
    }
}