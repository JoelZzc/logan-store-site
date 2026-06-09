<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\OrderReturnController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SavedCardController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');

//rutas publicas y protegidas productos
Route::get('products/inventory-alerts', [ProductController::class, 'inventoryAlerts'])->middleware('auth:sanctum');
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

//rutas protegidas orders
Route::middleware('auth:sanctum')->group(function(){
    Route::apiResource('orders', OrderController::class)->only(['index', 'show', 'store']);
});
Route::middleware(['auth:sanctum', 'admin'])->group(function(){
    Route::get('admin/orders', [OrderController::class, 'adminIndex']);
    Route::patch('admin/orders/{order}/status', [OrderController::class, 'updateStatus']);
});

//rutas publicas y protegidas brands

Route::apiResource('brands', BrandController::class)->only(['index', 'show']);
Route::middleware('auth:sanctum')->group(function(){
    Route::apiResource('brands', BrandController::class)->only(['store', 'update', 'destroy']);
});

//rutas publicas y protegidas reviews

Route::get('products/{product}/reviews', [ReviewController::class,'index']);
Route::middleware('auth:sanctum')->group(function(){
    Route::post('products/{product}/reviews', [ReviewController::class, 'store']);
    Route::delete('reviews/{review}',         [ReviewController::class, 'destroy']);
});


//rutas protegidas address

Route::middleware('auth:sanctum')->group(function(){
    Route::get('addresses',[AddressController::class, 'index']);
    Route::post('addresses', [AddressController::class, 'store']);
    Route::put('addresses/{address}',[AddressController::class, 'update']);
    Route::delete('addresses/{address}',[AddressController::class, 'destroy']);
});

//rutas protegidas saved-cards
Route::middleware('auth:sanctum')->group(function(){
    Route::get('saved-cards', [SavedCardController::class, 'index']);
    Route::delete('saved-cards/{savedCard}', [SavedCardController::class, 'destroy']);
});

// rutas protegidas reportes
Route::middleware(['auth:sanctum', 'admin'])->group(function(){
    Route::get('reports/sales', [ReportController::class, 'sales']);
});

// rutas de envíos
Route::middleware('auth:sanctum')->group(function(){
    Route::get('orders/{order}/shipment', [ShipmentController::class, 'show']); // cliente
});
Route::middleware(['auth:sanctum', 'admin'])->group(function(){
    Route::get('shipments', [ShipmentController::class, 'index']);
    Route::put('shipments/{shipment}', [ShipmentController::class, 'update']);
    Route::post('orders/{order}/shipment', [ShipmentController::class, 'store']);
});

// rutas de devoluciones
Route::middleware('auth:sanctum')->group(function(){
    Route::post('orders/{order}/return', [OrderReturnController::class, 'store']); // cliente
});
Route::middleware(['auth:sanctum', 'admin'])->group(function(){
    Route::get('returns', [OrderReturnController::class, 'index']);
    Route::patch('returns/{orderReturn}', [OrderReturnController::class, 'update']);
});

//rutas protegidas y publicas cupons

Route::post('coupons/apply', [CouponController::class,'apply']);
Route::middleware('auth:sanctum')->group(function(){
    Route::get('coupons',[CouponController::class, 'index']);
    Route::post('coupons', [CouponController::class, 'store']);
    Route::put('coupons/{coupon}',[CouponController::class, 'update']);
    Route::delete('coupons/{coupon}',[CouponController::class, 'destroy']);
});

