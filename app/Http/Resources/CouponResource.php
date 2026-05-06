<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'   => $this->id,
            'code' => $this->code,
            'discount_type' => $this->discount_type,
            'discount_value'=> $this->discount_value,
            'min_order_amount' =>$this->min_order_amount,
            'expires_at' =>$this->expires_at,
            'is_active' => $this->is_active,
        ];
    }
}
