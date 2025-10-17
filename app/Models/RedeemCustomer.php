<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RedeemCustomer extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'rewards_id',
        'reward_redemption_id',
        'rewards_name',
        'redeem_points',
        'redeem_status',
        'verified_at',
        'delivery_status'
    ];
    
    protected $casts = [
        'redeem_points' => 'integer',
        'redeem_status' => 'integer',
        'delivery_status' => 'integer',
        'verified_at' => 'datetime'
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function reward()
    {
        return $this->belongsTo(Reward::class, 'rewards_id');
    }

    public function reward_redemption()
    {
        return $this->belongsTo(RewardRedemption::class, 'reward_redemption_id');
    }
}
