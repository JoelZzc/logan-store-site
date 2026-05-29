<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShipmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'order_id'        => $this->order_id,
            'carrier'         => $this->carrier,
            'tracking_number' => $this->tracking_number,
            'status'          => $this->status,
            'shipped_at'      => $this->shipped_at?->format('d/m/Y H:i'),
            'delivered_at'    => $this->delivered_at?->format('d/m/Y H:i'),
            'notes'           => $this->notes,
            'created_at'      => $this->created_at->format('d/m/Y H:i'),
        ];
    }
}
