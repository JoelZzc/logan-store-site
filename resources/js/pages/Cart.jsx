import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Tu carrito está vacío
                    </h1>
                    <Link
                        to="/products"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Ver productos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
                    <button
                        onClick={clearCart}
                        className="text-red-600 hover:underline"
                    >
                        Vaciar carrito
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de productos */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item.product.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex gap-6">
                                    <img
                                        src={item.product.image_url || 'https://via.placeholder.com/150'}
                                        alt={item.product.name}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                    
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            ${item.product.price} c/u
                                        </p>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                                                >
                                                    -
                                                </button>
                                                <span className="font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product.stock}
                                                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-red-600 hover:underline ml-auto"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Envío</span>
                                    <span>Gratis</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mb-3"
                            >
                                Proceder al pago
                            </button>
                            
                            <Link
                                to="/products"
                                className="block text-center text-blue-600 hover:underline"
                            >
                                Seguir comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
