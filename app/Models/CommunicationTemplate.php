<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'event_type',
        'channel',
        'subject',
        'content',
        'variables',
        'is_active',
        'usage_count',
        'last_used_at',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function communicationLogs()
    {
        return $this->hasMany(CommunicationLog::class, 'template_id');
    }

    public function incrementUsage()
    {
        $this->increment('usage_count');
        $this->update(['last_used_at' => now()]);
    }

    public function replaceVariables($data)
    {
        $content = $this->content;
        $subject = $this->subject;

        foreach ($data as $key => $value) {
            $content = str_replace("{{$key}}", $value, $content);
            if ($subject) {
                $subject = str_replace("{{$key}}", $value, $subject);
            }
        }

        return [
            'content' => $content,
            'subject' => $subject
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeByEventType($query, $eventType)
    {
        return $query->where('event_type', $eventType);
    }
}