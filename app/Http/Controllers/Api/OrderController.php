<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use App\Models\SavedCard;
use Illuminate\Support\Str;

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
        $rules = [
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'address_id'         => 'nullable|exists:addresses,id',
            'coupon_code'        => 'nullable|string',
            'payment_method'     => 'required|in:cash,card',
            'saved_card_id'      => 'nullable|integer|exists:saved_cards,id',
        ];

        if ($request->input('payment_method') === 'card' && !$request->filled('saved_card_id')) {
            $rules['cardholder_name'] = ['required', 'string', 'max:255'];
            $rules['card_number']     = ['required', 'string', 'regex:/^([0-9]{16}|[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4})$/'];
            $rules['expiry_date']     = ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/[0-9]{2}$/'];
            $rules['cvv']             = ['required', 'string', 'regex:/^\d{3,4}$/'];
        }

        $validated = $request->validate($rules);

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

            // Procesar método de pago
            $cardholderName = null;
            $cardLastFour   = null;
            $cardBrand      = null;
            $savedCardId    = null;

            if ($validated['payment_method'] === 'card') {
                if (!empty($validated['saved_card_id'])) {
                    $savedCard = SavedCard::where('user_id', $request->user()->id)
                        ->where('id', $validated['saved_card_id'])
                        ->first();
                    if (!$savedCard) {
                        throw new \Exception("La tarjeta seleccionada no es válida.");
                    }
                    $cardholderName = $savedCard->cardholder_name;
                    $cardLastFour   = $savedCard->last_four;
                    $cardBrand      = $savedCard->brand;
                    $savedCardId    = $savedCard->id;
                } else {
                    $expiryParts = explode('/', str_replace(' ', '', $validated['expiry_date']));
                    if (count($expiryParts) !== 2) {
                        $expiryParts = [substr($validated['expiry_date'], 0, 2), substr($validated['expiry_date'], 2)];
                    }
                    $expiryMonth = (int) $expiryParts[0];
                    $expiryYear  = (int) $expiryParts[1];

                    // Validar expiración básica
                    $currentYear = (int) date('y');
                    $currentMonth = (int) date('m');
                    if ($expiryYear < $currentYear || ($expiryYear === $currentYear && $expiryMonth < $currentMonth)) {
                        throw new \Exception("La tarjeta ingresada ha expirado.");
                    }

                    // Limpiar guiones del número de tarjeta
                    $cleanCardNumber = str_replace('-', '', $validated['card_number']);

                    $cardHash = hash('sha256', $cleanCardNumber);
                    $lastFour = substr($cleanCardNumber, -4);
                    $detectedBrand = $this->getCardBrand($cleanCardNumber);

                    // Buscar duplicado de tarjeta
                    $savedCard = SavedCard::where('user_id', $request->user()->id)
                        ->where('card_hash', $cardHash)
                        ->first();

                    if (!$savedCard) {
                        $savedCard = SavedCard::create([
                            'user_id'         => $request->user()->id,
                            'cardholder_name' => $validated['cardholder_name'],
                            'last_four'       => $lastFour,
                            'brand'           => $detectedBrand,
                            'expiry_month'    => $expiryMonth,
                            'expiry_year'     => $expiryYear,
                            'token'           => 'tok_' . Str::random(24),
                            'card_hash'       => $cardHash,
                        ]);
                    }

                    $cardholderName = $savedCard->cardholder_name;
                    $cardLastFour   = $savedCard->last_four;
                    $cardBrand      = $savedCard->brand;
                    $savedCardId    = $savedCard->id;
                }
            }

            $order = Order::create([
                'user_id'         => $request->user()->id,
                'address_id'      => $validated['address_id'] ?? null,
                'total'           => round($total, 2),
                'status'          => $validated['payment_method'] === 'card' ? 'paid' : 'pending',
                'payment_method'  => $validated['payment_method'],
                'card_last_four'  => $cardLastFour,
                'card_brand'      => $cardBrand,
                'cardholder_name' => $cardholderName,
                'saved_card_id'   => $savedCardId,
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
                'payment_method'  => $order->payment_method,
                'card_last_four'  => $order->card_last_four,
                'card_brand'      => $order->card_brand,
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

    /**
     * Detect the card brand (Visa, Mastercard, Amex, Discover) based on card number.
     */
    private function getCardBrand($cardNumber)
    {
        $number = preg_replace('/\D/', '', $cardNumber);
        if (str_starts_with($number, '4')) {
            return 'visa';
        }
        if (preg_match('/^5[1-5]/', $number) || preg_match('/^2(22[1-9]|2[3-9]|[3-6]|7[0-1]|720)/', $number)) {
            return 'mastercard';
        }
        if (preg_match('/^3[47]/', $number)) {
            return 'amex';
        }
        if (preg_match('/^6(?:011|5)/', $number)) {
            return 'discover';
        }
        return 'card';
    }
}
