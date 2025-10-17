<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'provider',
        'api_key',
        'api_secret',
        'sender_id',
        'api_url',
        'is_active',
        'is_default',
        'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    // Ensure only one default SMS setting exists
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->is_default) {
                // Set all other records to not default
                static::where('id', '!=', $model->id)->update(['is_default' => false]);
            }
        });
    }

    // Get the default SMS settings
    public static function getDefault()
    {
        return static::where('is_default', true)->first();
    }

    // Get active SMS settings
    public static function getActive()
    {
        return static::where('is_active', true)->get();
    }
}
