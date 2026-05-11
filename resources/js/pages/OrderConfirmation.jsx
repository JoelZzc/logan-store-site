import { useLocation, Link } from 'react-router-dom';

export default function OrderConfirmation() {
    const location = useLocation();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        No se encontró información del pedido
                    </h1>
                    <Link
                        to="/"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    {/* Icono de éxito */}
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg
                                className="w-12 h-12 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        ¡Pedido confirmado!
                    </h1>
                    
                    <p className="text-gray-600 mb-8">
                        Tu pedido ha sido procesado exitosamente. Recibirás un correo de confirmación pronto.
                    </p>

                    {/* Detalles del pedido */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Detalles del pedido
                        </h2>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Número de pedido:</span>
                                <span className="font-semibold">#{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Estado:</span>
                                <span className="font-semibold capitalize">{order.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-semibold text-xl text-blue-600">
                                    ${order.total}
                                </span>
                            </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Productos:</h3>
                                <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                {item.product?.name || 'Producto'} x{item.quantity}
                                            </span>
                                            <span className="font-semibold">
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
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Seguir comprando
                        </Link>
                        <Link
                            to="/"
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
