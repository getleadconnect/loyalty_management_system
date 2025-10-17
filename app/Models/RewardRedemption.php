<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RewardRedemption extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'reward_id',
        'points_spent',
        'status',
        'redemption_code',
        'notes',
        'redeemed_at',
        'delivered_at',
    ];
    
    protected $casts = [
        'points_spent' => 'decimal:2',
        'redeemed_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }
    
    public function pointsTransaction()
    {
        return $this->hasOne(PointsTransaction::class, 'redemption_id');
    }
}
