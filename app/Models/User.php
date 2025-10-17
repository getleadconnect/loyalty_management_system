<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'country_code',
        'mobile',
        'password',
        'role_id',
        'points_balance',
        'aadhar_number',
        'status',
        'image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'points_balance' => 'decimal:2',
    ];
    
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['image_url'];
    
    /**
     * Get the image URL attribute.
     *
     * @return string|null
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            // If image path already contains http, return as is
            if (str_starts_with($this->image, 'http')) {
                return $this->image;
            }
            
            // For relative paths, prepend with slash if needed
            $imagePath = $this->image;
            if (!str_starts_with($imagePath, '/')) {
                $imagePath = '/' . $imagePath;
            }
            
            // Return the image path (will be relative to the current domain)
            return $imagePath;
        }
        return null;
    }
    
    public function pointsTransactions()
    {
        return $this->hasMany(PointsTransaction::class);
    }
    
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
    
    public function redemptions()
    {
        return $this->hasMany(RewardRedemption::class);
    }
    
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
    
    public function isAdmin()
    {
        return $this->role_id === 1;
    }
    
    public function isCustomer()
    {
        return $this->role_id === 2;
    }
    
    public function isStaff()
    {
        return $this->role_id === 3;
    }
}
