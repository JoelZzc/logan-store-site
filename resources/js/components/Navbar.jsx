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
        <nav className="bg-white border-b border-[#e4e0db] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-10">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="no-underline">
                        <div
                            className="text-xl text-[#2a2826] font-light leading-none"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            LoGan
                        </div>
                        <div className="text-[8px] tracking-[.22em] text-[#7a7672] mt-0.5 font-light">
                            PERFUMERÍA
                        </div>
                    </Link>

                    {/* Links de navegación */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-[11px] tracking-[.12em] text-[#7a7672] hover:text-[#2a2826] transition-colors no-underline font-light"
                        >
                            INICIO
                        </Link>
                        <Link
                            to="/products"
                            className="text-[11px] tracking-[.12em] text-[#7a7672] hover:text-[#2a2826] transition-colors no-underline font-light"
                        >
                            CATÁLOGO
                        </Link>
                        {user && (
                            <Link
                                to="/admin"
                                className="text-[11px] tracking-[.12em] text-[#7a7672] hover:text-[#2a2826] transition-colors no-underline font-light"
                            >
                                ADMIN
                            </Link>
                        )}
                    </div>

                    {/* Carrito y usuario */}
                    <div className="flex items-center gap-5">

                        {/* Carrito */}
                        <Link to="/cart" className="relative text-[#2a2826] hover:text-[#b08070] transition-colors">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            {getItemCount() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#2a2826] text-[#f4f0ec] text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-light">
                                    {getItemCount()}
                                </span>
                            )}
                        </Link>

                        {/* Usuario */}
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] tracking-[.06em] text-[#7a7672] hidden md:block font-light">
                                    Hola, {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-[10px] tracking-[.12em] text-[#7a7672] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer font-light"
                                >
                                    SALIR
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className="text-[11px] tracking-[.1em] text-[#7a7672] hover:text-[#2a2826] transition-colors no-underline font-light"
                                >
                                    ENTRAR
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-[#2a2826] text-[#f4f0ec] px-5 py-2 text-[10px] tracking-[.12em] hover:opacity-80 transition-opacity no-underline font-light"
                                >
                                    REGISTRARSE
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}