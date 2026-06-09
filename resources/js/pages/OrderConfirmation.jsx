import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function OrderConfirmation() {
    const location = useLocation();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="min-h-screen bg-[#f4f0ec] flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="text-5xl font-light text-[#2a2826] mb-6"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        LoGan
                    </div>
                    <h1
                        className="text-2xl font-light text-[#2a2826] mb-3"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        No se encontró información del pedido
                    </h1>
                    <p className="text-[11px] text-[#7a7672] font-light mb-8 tracking-wide">
                        Es posible que el pedido haya expirado o no exista
                    </p>
                    <Link
                        to="/"
                        className="inline-block bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.16em] font-light hover:opacity-80 transition-opacity no-underline"
                    >
                        VOLVER AL INICIO
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-2xl mx-auto px-10 py-16">

                {/* Icono de éxito */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#e8f0e4] flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-8 h-8 text-[#3a6030]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <p className="text-[9px] tracking-[.22em] text-[#b08070] mb-3">PEDIDO PROCESADO</p>
                    <h1
                        className="text-4xl font-light text-[#2a2826] mb-4"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        ¡Pedido confirmado!
                    </h1>
                    <p className="text-sm text-[#7a7672] font-light leading-relaxed max-w-sm mx-auto">
                        Tu pedido ha sido procesado exitosamente. Recibirás un correo de confirmación pronto.
                    </p>
                </div>

                {/* Detalles del pedido */}
                <div className="border border-[#e4e0db] mb-10">

                    <div className="bg-[#f4f0ec] px-8 py-5 border-b border-[#e4e0db]">
                        <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">RESUMEN</p>
                        <h2
                            className="text-lg font-light text-[#2a2826]"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            Detalles del pedido
                        </h2>
                    </div>

                    <div className="px-8 py-6 space-y-3 border-b border-[#e4e0db]">
                        <div className="flex justify-between">
                            <span className="text-[11px] text-[#7a7672] font-light tracking-wide">NÚMERO DE PEDIDO</span>
                            <span className="text-[12px] text-[#2a2826] font-normal">#{order.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[11px] text-[#7a7672] font-light tracking-wide">ESTADO</span>
                            <span className="text-[12px] text-[#2a2826] font-normal capitalize">{order.status}</span>
                        </div>
                        {order.payment_method && (
                            <div className="flex justify-between">
                                <span className="text-[11px] text-[#7a7672] font-light tracking-wide">MÉTODO DE PAGO</span>
                                <span className="text-[12px] text-[#2a2826] font-normal uppercase">
                                    {order.payment_method === 'card' ? `${order.card_brand || 'Tarjeta'} (•••• ${order.card_last_four})` : 'Efectivo'}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-[#e4e0db]">
                            <span className="text-[11px] text-[#7a7672] font-light tracking-wide">TOTAL</span>
                            <span className="text-sm text-[#2a2826] font-normal">${order.total}</span>
                        </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                        <div className="px-8 py-6">
                            <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-4">PRODUCTOS</p>
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span className="text-[12px] text-[#7a7672] font-light">
                                            {item.product?.name || 'Producto'} ×{item.quantity}
                                        </span>
                                        <span className="text-[12px] text-[#2a2826] font-light">
                                            ${(item.unit_price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-4 justify-center">
                    <Link
                        to="/products"
                        className="bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.16em] font-light hover:opacity-80 transition-opacity no-underline"
                    >
                        SEGUIR COMPRANDO
                    </Link>
                    <Link
                        to="/"
                        className="border border-[#e4e0db] text-[#7a7672] px-8 py-3 text-[10px] tracking-[.16em] font-light hover:bg-[#f4f0ec] transition-colors no-underline"
                    >
                        VOLVER AL INICIO
                    </Link>
                </div>

            </div>
        </div>
    );
}