<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');

//rutas publicas y protegidas productos
Route::apiResource('products', ProductController::class)->only(['index','show']);
Route::middleware('auth:sanctum')->group(function(){
    Route::apiResource('products', ProductController::class)->only(['store', 'update', 'destroy']);
});

//rutas publicas y protegidas categorias

Route::get('categories/{category}/products', [CategoryController::class, 'products']);
Route::apiResource('categories', CategoryController::class)->only(['index','show']);
Route::middleware('auth:sanctum')->group(function(){
    Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
});


