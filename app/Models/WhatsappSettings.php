<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'provider',
        'api_key',
        'api_secret',
        'phone_number',
        'business_id',
        'api_url',
        'is_active',
        'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}