<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'mail_driver',
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_from_address',
        'mail_from_name',
        'is_active',
        'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'mail_port' => 'integer'
    ];

    // Get active email settings
    public static function getActive()
    {
        return static::where('is_active', true)->get();
    }

    // Get the first active email setting for sending
    public static function getActiveForSending()
    {
        return static::where('is_active', true)->first();
    }
}
