<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'order_number',
        'amount',
        'points_earned',
        'description',
        'purchased_at',
    ];
    
    protected $casts = [
        'amount' => 'decimal:2',
        'points_earned' => 'decimal:2',
        'purchased_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function pointsTransaction()
    {
        return $this->hasOne(PointsTransaction::class);
    }
}
