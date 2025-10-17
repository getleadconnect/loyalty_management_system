<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerPoint extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'product_id',
        'product_name',
        'points',
        'quantity',
        'total_points'
    ];
    
    protected $casts = [
        'points' => 'integer',
        'quantity' => 'integer',
        'total_points' => 'integer'
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
