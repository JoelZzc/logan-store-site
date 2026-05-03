<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products
    public function index(Request $request)
    {
        $query = Product::with('category'); // carga la categoría en la misma query (evita N+1)

        // Filtro opcional: GET /api/products?category=perfumes-mujer
        if ($request->has('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        return ProductResource::collection($query->get());
    }

    // GET /api/products/{product}
    // Laravel inyecta el Product automáticamente (Route Model Binding)
    public function show(Product $product)
    {
        return new ProductResource($product->load('category'));
    }

    // POST /api/products
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'image_url'   => 'nullable|url',
        ]);

        $product = Product::create($validated);

        return new ProductResource($product);
    }

    // PUT /api/products/{product}
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'image_url'   => 'nullable|url',
        ]);

        $product->update($validated);

        return new ProductResource($product);
    }

    // DELETE /api/products/{product}
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Producto eliminado'], 200);
    }
}
