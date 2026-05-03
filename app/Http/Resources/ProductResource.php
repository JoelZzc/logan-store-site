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
            'image_url'   => $this->image_url,
            // whenLoaded: solo incluye la categoría si fue cargada con with()
            // evita N+1 queries accidentales
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'created_at'  => $this->created_at->toDateTimeString(),
        ];
    }
}
