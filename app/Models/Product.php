<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'product_name',
        'points',
        'barcode_value',
        'is_active'
    ];
    
    protected $casts = [
        'points' => 'integer',
        'is_active' => 'boolean'
    ];
}
