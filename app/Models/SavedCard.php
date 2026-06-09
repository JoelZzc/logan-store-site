<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedCard extends Model
{
    use HasFactory;

    protected $table = 'saved_cards';

    protected $fillable = [
        'user_id',
        'cardholder_name',
        'last_four',
        'brand',
        'expiry_month',
        'expiry_year',
        'token',
        'card_hash',
    ];

    /**
     * Get the user that owns the saved card.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the orders associated with this saved card.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
