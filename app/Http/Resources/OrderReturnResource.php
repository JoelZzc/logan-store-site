<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderReturnResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'order_id'      => $this->order_id,
            'user'          => $this->user?->name,
            'reason'        => $this->reason,
            'status'        => $this->status,
            'admin_notes'   => $this->admin_notes,
            'refund_amount' => $this->refund_amount,
            'created_at'    => $this->created_at->format('d/m/Y H:i'),
        ];
    }
}
