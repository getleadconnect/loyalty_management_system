<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScannedQrcode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'unique_id',
        'points'
    ];

    protected $casts = [
        'points' => 'integer'
    ];

    /**
     * Get the user that scanned the QR code
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
