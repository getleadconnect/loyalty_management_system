<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reward extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'description',
        'points_required',
        'category',
        'image_url',
        'is_active',
        'stock_quantity',
        'valid_from',
        'valid_until',
        'terms_conditions',
    ];
    
    protected $casts = [
        'points_required' => 'decimal:2',
        'is_active' => 'boolean',
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];
    
    public function redemptions()
    {
        return $this->hasMany(RewardRedemption::class);
    }
    
    public function isAvailable()
    {
        return $this->is_active && 
               ($this->stock_quantity === null || $this->stock_quantity > 0) &&
               ($this->valid_from === null || $this->valid_from <= now()) &&
               ($this->valid_until === null || $this->valid_until >= now());
    }
}
