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
        $query = Product::with('category', 'brand');

        // Filtro por categoría (ID)
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // Filtro por marca (ID)
        if ($request->filled('brand')) {
            $query->where('brand_id', $request->brand);
        }

        // Filtro por búsqueda
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        return ProductResource::collection($query->get());
    }

    // GET /api/products/inventory-alerts
    public function inventoryAlerts()
    {
        $products = Product::with('category', 'brand')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock', 'asc')
            ->get();

        return ProductResource::collection($products);
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
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'required|numeric|min:0',
            'stock'          => 'required|integer|min:0',
            'min_stock'      => 'nullable|integer|min:0',
            'reorder_point'  => 'nullable|integer|min:0',
            'supplier_notes' => 'nullable|string',
            'image_url'      => 'nullable|string|max:500',
            'category_id'    => 'nullable|exists:categories,id',
            'brand_id'       => 'nullable|exists:brands,id',
        ]);

        $product = Product::create($validated);

        return new ProductResource($product);
    }

    // PUT /api/products/{product}
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'sometimes|numeric|min:0',
            'stock'          => 'sometimes|integer|min:0',
            'min_stock'      => 'nullable|integer|min:0',
            'reorder_point'  => 'nullable|integer|min:0',
            'supplier_notes' => 'nullable|string',
            'image_url'      => 'nullable|string|max:500',
            'category_id'    => 'nullable|exists:categories,id',
            'brand_id'       => 'nullable|exists:brands,id',
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
