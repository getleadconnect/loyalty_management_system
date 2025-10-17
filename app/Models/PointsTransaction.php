<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointsTransaction extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'type',
        'points',
        'balance_after',
        'description',
        'purchase_id',
        'redemption_id',
    ];
    
    protected $casts = [
        'points' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
    
    public function redemption()
    {
        return $this->belongsTo(RewardRedemption::class, 'redemption_id');
    }
}
