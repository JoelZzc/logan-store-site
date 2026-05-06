<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'min_order_amount',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'expires_at'  => 'datetime',
        'is_active'   => 'boolean',
        'discount_value'    => 'decimal:2',
        'min_order_amount'  => 'decimal:2',
    ];

}
