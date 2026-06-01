<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'address_id',
        'status',
        'total',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function address(){
        return $this->belongsTo(Address::class);
    }

    public function items(){
        return $this->hasMany(OrderItem::class);
    }

    public function shipment(){
        return $this->hasOne(Shipment::class);
    }

    public function orderReturn(){
        return $this->hasOne(OrderReturn::class);
    }

}
