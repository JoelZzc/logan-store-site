<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShipmentResource;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    // GET /api/shipments — listar todos los envíos (admin)
    public function index()
    {
        $shipments = Shipment::with('order.user')
            ->orderByDesc('created_at')
            ->get();

        return ShipmentResource::collection($shipments);
    }

    // POST /api/orders/{order}/shipment — crear envío para un pedido (admin)
    public function store(Request $request, Order $order)
    {
        if ($order->shipment) {
            return response()->json(['message' => 'Este pedido ya tiene un envío registrado'], 422);
        }

        $validated = $request->validate([
            'carrier'         => 'required|string|max:100',
            'tracking_number' => 'nullable|string|max:100',
            'notes'           => 'nullable|string',
        ]);

        $shipment = Shipment::create([
            'order_id'        => $order->id,
            'carrier'         => $validated['carrier'],
            'tracking_number' => $validated['tracking_number'] ?? null,
            'notes'           => $validated['notes'] ?? null,
            'status'          => 'pending',
        ]);

        // Actualizar estado del pedido a 'shipped'
        $order->update(['status' => 'shipped']);

        return new ShipmentResource($shipment);
    }

    // PUT /api/shipments/{shipment} — actualizar estado del envío (admin)
    public function update(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'carrier'         => 'sometimes|string|max:100',
            'tracking_number' => 'nullable|string|max:100',
            'status'          => 'sometimes|in:pending,shipped,in_transit,delivered,failed',
            'notes'           => 'nullable|string',
        ]);

        // Asignar fechas automáticamente según el estado
        if (isset($validated['status'])) {
            if ($validated['status'] === 'shipped' && !$shipment->shipped_at) {
                $validated['shipped_at'] = now();
            }
            if ($validated['status'] === 'delivered' && !$shipment->delivered_at) {
                $validated['delivered_at'] = now();
                // Actualizar pedido a entregado
                $shipment->order->update(['status' => 'delivered']);
            }
        }

        $shipment->update($validated);

        return new ShipmentResource($shipment);
    }

    // GET /api/orders/{order}/shipment — ver envío de un pedido (cliente)
    public function show(Order $order)
    {
        if (!$order->shipment) {
            return response()->json(['message' => 'Este pedido aún no tiene envío registrado'], 404);
        }

        return new ShipmentResource($order->shipment);
    }
}
