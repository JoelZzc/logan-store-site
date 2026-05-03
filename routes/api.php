<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;

Route::apiResource('products', ProductController::class);
Route::apiResource('categories', CategoryController::class);

// Ruta extra: productos filtrados por categoría
// GET /api/categories/{category}/products
Route::get('categories/{category}/products', [CategoryController::class, 'products']);
