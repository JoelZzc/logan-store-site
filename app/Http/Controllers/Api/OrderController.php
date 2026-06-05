<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // GET /api/orders — pedidos del usuario autenticado
    public function index(Request $request)
    {
        return $request->user()
            ->orders()
            ->with(['items.product', 'address', 'shipment', 'orderReturn'])
            ->orderByDesc('created_at')
            ->get();
    }

    // GET /api/orders/{order} — detalle de un pedido
    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($order->load(['items.product', 'address', 'shipment']));
    }

    // POST /api/orders — crear pedido
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'address_id'         => 'nullable|exists:addresses,id',
            'coupon_code'        => 'nullable|string',
        ]);

        $order = DB::transaction(function () use ($request, $validated) {

            $total     = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stock insuficiente para {$product->name}");
                }

                $total      += $product->price * $item['quantity'];
                $itemsData[] = [
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $product->price,
                ];

                $product->decrement('stock', $item['quantity']);
            }

            // Aplicar cupón si se mandó
            if (!empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', $validated['coupon_code'])
                    ->where('is_active', true)
                    ->first();

                if ($coupon && ($coupon->expires_at === null || $coupon->expires_at->isFuture())) {
                    if ($coupon->discount_type === 'percentage') {
                        $total = $total - ($total * $coupon->discount_value / 100);
                    } else {
                        $total = max(0, $total - $coupon->discount_value);
                    }
                }
            }

            $order = Order::create([
                'user_id'    => $request->user()->id,
                'address_id' => $validated['address_id'] ?? null,
                'total'      => round($total, 2),
                'status'     => 'pending',
            ]);

            $order->items()->createMany($itemsData);

            return $order;
        });

        return response()->json($order->load(['items.product', 'address']), 201);
    }

    // GET /api/admin/orders — todos los pedidos (admin)
    public function adminIndex()
    {
        $orders = Order::with(['user', 'items.product', 'address', 'shipment', 'orderReturn'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($order) => [
                'id'         => $order->id,
                'status'     => $order->status,
                'total'      => $order->total,
                'created_at' => $order->created_at->format('d/m/Y H:i'),
                'user'       => $order->user?->name ?? 'Cliente',
                'address'    => $order->address ? [
                    'street'   => $order->address->street,
                    'city'     => $order->address->city,
                    'state'    => $order->address->state,
                    'zip_code' => $order->address->zip_code,
                    'country'  => $order->address->country,
                ] : null,
                'items'      => $order->items->map(fn($item) => [
                    'product' => $item->product?->name,
                    'qty'     => $item->quantity,
                    'price'   => $item->unit_price,
                ]),
                'shipment'   => $order->shipment ? [
                    'id'              => $order->shipment->id,
                    'carrier'         => $order->shipment->carrier,
                    'tracking_number' => $order->shipment->tracking_number,
                    'status'          => $order->shipment->status,
                ] : null,
            ]);

        return response()->json($orders);
    }

    // PATCH /api/admin/orders/{order}/status — cambiar estado (admin)
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,shipped,delivered,cancelled',
        ]);

        $order->update($validated);

        return response()->json(['message' => 'Estado actualizado', 'order' => $order]);
    }
}
