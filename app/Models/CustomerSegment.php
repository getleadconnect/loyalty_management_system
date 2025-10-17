<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CustomerSegment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'criteria',
        'customer_count',
        'is_active',
        'last_updated',
    ];

    protected $casts = [
        'criteria' => 'array',
        'is_active' => 'boolean',
        'last_updated' => 'datetime',
    ];

    public function communicationLogs()
    {
        return $this->hasMany(CommunicationLog::class, 'segment_id');
    }

    public function getCustomers()
    {
        $query = User::where('role_id', 2);

        if (!empty($this->criteria)) {
            foreach ($this->criteria as $criterion) {
                switch ($criterion['field']) {
                    case 'points_balance':
                        $query->where('points_balance', $criterion['operator'], $criterion['value']);
                        break;
                    case 'registration_date':
                        $query->whereDate('created_at', $criterion['operator'], $criterion['value']);
                        break;
                    case 'total_spent':
                        $subQuery = DB::table('purchases')
                            ->select('user_id', DB::raw('SUM(amount) as total_spent'))
                            ->groupBy('user_id');
                        $query->joinSub($subQuery, 'purchase_totals', function ($join) {
                            $join->on('users.id', '=', 'purchase_totals.user_id');
                        })->where('purchase_totals.total_spent', $criterion['operator'], $criterion['value']);
                        break;
                    case 'redemption_count':
                        $subQuery = DB::table('reward_redemptions')
                            ->select('user_id', DB::raw('COUNT(*) as redemption_count'))
                            ->groupBy('user_id');
                        $query->joinSub($subQuery, 'redemption_counts', function ($join) {
                            $join->on('users.id', '=', 'redemption_counts.user_id');
                        })->where('redemption_counts.redemption_count', $criterion['operator'], $criterion['value']);
                        break;
                    case 'last_activity':
                        $subQuery = DB::table('points_transactions')
                            ->select('user_id', DB::raw('MAX(created_at) as last_activity'))
                            ->groupBy('user_id');
                        $query->joinSub($subQuery, 'activity_dates', function ($join) {
                            $join->on('users.id', '=', 'activity_dates.user_id');
                        })->whereDate('activity_dates.last_activity', $criterion['operator'], $criterion['value']);
                        break;
                }
            }
        }

        return $query;
    }

    public function updateCustomerCount()
    {
        $count = $this->getCustomers()->count();
        $this->update([
            'customer_count' => $count,
            'last_updated' => now()
        ]);
        return $count;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}