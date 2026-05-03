<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        return CategoryResource::collection(Category::all());
    }

    // GET /api/categories/{category}
    public function show(Category $category)
    {
        return new CategoryResource($category);
    }

    // GET /api/categories/{category}/products
    // Devuelve todos los productos de una categoría
    public function products(Category $category)
    {
        return ProductResource::collection($category->products);
    }

    // POST /api/categories
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
        ]);

        // Generamos el slug automáticamente desde el nombre
        // ej: "Perfumes Mujer" → "perfumes-mujer"
        $validated['slug'] = Str::slug($validated['name']);

        return new CategoryResource(Category::create($validated));
    }

    // PUT /api/categories/{category}
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return new CategoryResource($category);
    }

    // DELETE /api/categories/{category}
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Categoría eliminada'], 200);
    }
}
