<?php

namespace App\Http\Resources;

use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'price'       => (float) $this->price,
            'stock'       => $this->stock,
            'min_stock'   => $this->min_stock,
            'reorder_point' => $this->reorder_point,
            'supplier_notes' => $this->supplier_notes,
            'image_url'   => $this->image_url,
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'brand'       => new BrandResource($this->whenLoaded('brand')),
            'created_at'  => $this->created_at->toDateTimeString(),
        ];
    }
}
