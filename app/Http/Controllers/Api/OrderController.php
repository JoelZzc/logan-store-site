<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;

class OrderController extends Controller
{
    public function index(Request $request){
        return $request->user()->orders()->with('items.product')->get();
    }

    public function show(Request $request,Order $order){
        
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($order->load('items.product'));
    }

    public function store(Request $request){
        $validated = $request->validate([
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'required|integer|exists:products,id',
            'items.*.quantity'     => 'required|integer|min:1',
        ]);

        $total = 0;
        $itemsData = [];

        foreach($validated['items'] as $item){
            $product = Product::findOrFail($item['product_id']);

            // 3. Verifica stock — si no hay suficiente, devuelve error 422
            if ($product->stock < $item['quantity']) { 
                return response()->json(['message' => "Stock insuficiente para {$product->name}"], 422); 
            }
            
            // 4. Acumula el total
            $total += $product->price * $item['quantity'];
            
            // 5. Guarda los datos del item para crear después
            $itemsData[] = [ 'product_id' => $product->id, 'quantity' => $item['quantity'], 'unit_price' => $product->price];
            
            $product->decrement('stock',$item['quantity']);

        }

        // 6. Crea el pedido
        $order = Order::create([
            'user_id' => $request->user()->id,
            'total' => $total,
            'status' => 'pending',
        ]);

        // 7. Crea todos los items de una vez
        $order->items()->createMany($itemsData);

        return response()->json($order->load('items.product'), 201);
    }
}
