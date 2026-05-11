import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { getItemCount } = useCart();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-blue-600">
                        Logan Store
                    </Link>

                    {/* Links de navegación */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
                            Inicio
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-blue-600 transition">
                            Productos
                        </Link>
                    </div>

                    {/* Carrito y usuario */}
                    <div className="flex items-center gap-4">
                        {/* Carrito */}
                        <Link to="/cart" className="relative">
                            <svg
                                className="w-6 h-6 text-gray-700 hover:text-blue-600 transition"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            {getItemCount() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {getItemCount()}
                                </span>
                            )}
                        </Link>

                        {/* Usuario */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-gray-700 hidden md:block">
                                    Hola, {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Salir
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 transition"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
