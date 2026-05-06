<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CouponResource;
use Illuminate\Http\Request;
use App\Models\Coupon;

class CouponController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return  CouponResource::collection(Coupon::all());

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'discount_type'  =>'required|in:percentage,fixed',
            'discount_value'  =>'required|numeric|min:0',
            'min_order_amount'  =>'nullable|numeric|min:0',
            'expires_at'  =>'nullable|date',
            'is_active'  =>'boolean',
        ]);

        $coupon = Coupon::create($validated);

        return response()->json([
            'message' => 'Cupón creado correctamente',
            'coupon' => $coupon,
        ],201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Coupon $coupon)
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|unique:coupons,code,' . $coupon->id,
            'discount_type' => 'sometimes|in:percentage,fixed',
            'discount_value' => 'sometimes|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $coupon->update($validated);

        return response()->json([
            'message' => 'Cupón actualizado',
            'coupon' => $coupon
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return response()->json(['message' => 'Cupon eliminado correctamente'], 200);
    }

    public function apply(Request $request){
        // 1. Validar que venga el campo code
        $request->validate(['code' => 'required|string']);

        // 2. Buscar el cupón por code
        $coupon = Coupon::where('code', $request->code)->first();

        // 3. Verificar que existe
        if (!$coupon) {
            return response()->json(['message' => 'Lo sentimos, el cupon no existe'], 422);
        }

        // 4. Verificar que está activo
        if (!$coupon->is_active) {
            return response()->json(['message' => 'Lo sentimos, el cupon no esta activo'], 422);
        }

        // 5. Verificar que no ha expirado
        if ($coupon->expires_at !== null && !$coupon->expires_at->isFuture()) {
            return response()->json(['message' => 'Lo sentimos, el cupon ah expirado'], 422);
        }

        // 6. Todo bien, retornar el cupón
        return new CouponResource($coupon);
    }
}
