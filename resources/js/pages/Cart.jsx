import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#f4f0ec] flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="text-6xl font-light text-[#2a2826] mb-4"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        LoGan
                    </div>
                    <h1
                        className="text-2xl font-light text-[#2a2826] mb-3"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        Tu carrito está vacío
                    </h1>
                    <p className="text-[11px] tracking-[.1em] text-[#7a7672] font-light mb-8">
                        Descubre nuestras fragancias
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.16em] font-light hover:opacity-80 transition-opacity no-underline"
                    >
                        VER PRODUCTOS
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-10 py-10">

                {/* Header */}
                <div className="flex justify-between items-center mb-10 border-b border-[#e4e0db] pb-6">
                    <div>
                        <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">RESUMEN</p>
                        <h1
                            className="text-2xl font-light text-[#2a2826]"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            Carrito de compras
                        </h1>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-[10px] tracking-[.1em] text-[#7a7672] hover:text-[#8a3a2a] transition-colors bg-transparent border-none cursor-pointer font-light"
                    >
                        VACIAR CARRITO
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Lista de productos */}
                    <div className="lg:col-span-2 space-y-0">
                        {cart.map((item) => (
                            <div key={item.product.id} className="border-b border-[#e4e0db] py-6">
                                <div className="flex gap-6">
                                    <div className="w-24 h-24 bg-[#f4f0ec] flex-shrink-0 overflow-hidden">
                                        <img
                                            src={item.product.image_url || 'https://via.placeholder.com/150'}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-sm font-normal text-[#2a2826] tracking-wide mb-1">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-[11px] text-[#7a7672] font-light mb-4">
                                            ${item.product.price} c/u
                                        </p>

                                        <div className="flex items-center gap-6">
                                            {/* Cantidad */}
                                            <div className="flex items-center gap-3 border border-[#e4e0db]">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-[#7a7672] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer text-lg font-light"
                                                >
                                                    −
                                                </button>
                                                <span className="text-sm text-[#2a2826] font-light w-5 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product.stock}
                                                    className="w-8 h-8 flex items-center justify-center text-[#7a7672] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer text-lg font-light disabled:opacity-30"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-[10px] tracking-[.1em] text-[#7a7672] hover:text-[#8a3a2a] transition-colors bg-transparent border-none cursor-pointer font-light ml-auto"
                                            >
                                                ELIMINAR
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-normal text-[#2a2826]">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#f4f0ec] p-8 sticky top-24">
                            <h2
                                className="text-xl font-light text-[#2a2826] mb-6"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                            >
                                Resumen del pedido
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-[12px] text-[#7a7672] font-light pb-3 border-b border-[#e4e0db]">
                                    <span>Subtotal</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[12px] text-[#7a7672] font-light pb-3 border-b border-[#e4e0db]">
                                    <span>Envío</span>
                                    <span className="text-[#3a6030]">Gratis</span>
                                </div>
                                <div className="flex justify-between text-sm text-[#2a2826] font-normal pt-1">
                                    <span>Total</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-[#2a2826] text-[#f4f0ec] py-3 text-[11px] tracking-[.16em] font-light hover:opacity-80 transition-opacity mb-4"
                            >
                                PROCEDER AL PAGO
                            </button>

                            <Link
                                to="/products"
                                className="block text-center text-[10px] tracking-[.1em] text-[#b08070] hover:text-[#2a2826] transition-colors no-underline font-light"
                            >
                                SEGUIR COMPRANDO
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}