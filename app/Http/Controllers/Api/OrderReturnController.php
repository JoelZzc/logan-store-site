<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderReturnResource;
use App\Models\Order;
use App\Models\OrderReturn;
use Illuminate\Http\Request;

class OrderReturnController extends Controller
{
    // GET /api/returns — todas las devoluciones (admin)
    public function index()
    {
        $returns = OrderReturn::with(['order', 'user'])
            ->orderByDesc('created_at')
            ->get();

        return OrderReturnResource::collection($returns);
    }

    // POST /api/orders/{order}/return — solicitar devolución (cliente)
    public function store(Request $request, Order $order)
    {
        // Verificar que el pedido pertenece al usuario
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Solo se puede solicitar devolución de pedidos entregados
        if (!in_array($order->status, ['delivered', 'paid', 'shipped'])) {
            return response()->json(['message' => 'Solo puedes solicitar devolución de pedidos entregados o pagados'], 422);
        }

        // Verificar que no tenga ya una devolución
        if ($order->orderReturn) {
            return response()->json(['message' => 'Este pedido ya tiene una solicitud de devolución'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ]);

        $return = OrderReturn::create([
            'order_id' => $order->id,
            'user_id'  => $request->user()->id,
            'reason'   => $validated['reason'],
            'status'   => 'requested',
        ]);

        return new OrderReturnResource($return->load('user'));
    }

    // PATCH /api/returns/{return} — aprobar o rechazar (admin)
    public function update(Request $request, OrderReturn $orderReturn)
    {
        $validated = $request->validate([
            'status'        => 'required|in:approved,rejected',
            'admin_notes'   => 'nullable|string|max:500',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);

        $orderReturn->update($validated);

        // Si se aprueba, actualizar el estado del pedido a cancelled
        if ($validated['status'] === 'approved') {
            $orderReturn->order->update(['status' => 'cancelled']);
        }

        return new OrderReturnResource($orderReturn->load('user'));
    }
}
