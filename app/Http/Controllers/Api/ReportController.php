<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $period = $request->get('period', 'month'); // day, week, month, year

        // Calcular fecha de inicio según el período
        $startDate = match($period) {
            'day'   => now()->startOfDay(),
            'week'  => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year'  => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        // Total de ventas y número de pedidos en el período
        $summary = Order::where('created_at', '>=', $startDate)
            ->where('status', '!=', 'cancelled')
            ->selectRaw('COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_sales')
            ->first();

        // Producto más vendido en el período
        $topProduct = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.created_at', '>=', $startDate)
            ->where('orders.status', '!=', 'cancelled')
            ->selectRaw('products.name, SUM(order_items.quantity) as total_sold')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->first();

        // Ventas agrupadas por día
        $salesByDay = Order::where('created_at', '>=', $startDate)
            ->where('status', '!=', 'cancelled')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total), 0) as sales')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Pedidos recientes (últimos 10)
        $recentOrders = Order::with('user')
            ->where('created_at', '>=', $startDate)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($order) => [
                'id'         => $order->id,
                'user'       => $order->user?->name ?? 'Cliente',
                'total'      => $order->total,
                'status'     => $order->status,
                'created_at' => $order->created_at->format('d/m/Y H:i'),
            ]);

        // Alertas: productos con stock bajo
        $stockAlerts = Product::whereColumn('stock', '<=', 'min_stock')
            ->count();

        return response()->json([
            'period'        => $period,
            'start_date'    => $startDate->format('d/m/Y'),
            'total_sales'   => (float) $summary->total_sales,
            'total_orders'  => (int) $summary->total_orders,
            'top_product'   => $topProduct ? [
                'name'       => $topProduct->name,
                'total_sold' => $topProduct->total_sold,
            ] : null,
            'sales_by_day'  => $salesByDay,
            'recent_orders' => $recentOrders,
            'stock_alerts'  => $stockAlerts,
        ]);
    }
}
