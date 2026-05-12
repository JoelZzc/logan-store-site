import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-[#2a2826] text-[#c8c4be] py-10 mt-10">
            <div className="max-w-7xl mx-auto px-10 flex justify-between items-start">
                {/* Logo */}
                <div>
                    <div className="text-xl font-light mb-1"
                         style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        LoGan
                    </div>
                    <div className="text-[9px] tracking-[.18em] text-[#8a8680]">
                        PERFUMERÍA · EST. 2023
                    </div>
                </div>

                {/* Links */}
                <div className="flex gap-16 text-[11px] font-light">
                    {/* Columna 1 */}
                    <div className="flex flex-col gap-2">
                        <Link to="/products" className="text-[#c8c4be] hover:text-white transition-colors no-underline">
                            Tienda
                        </Link>
                        <Link to="/products" className="text-[#c8c4be] hover:text-white transition-colors no-underline">
                            Marcas
                        </Link>
                        <Link to="/products" className="text-[#c8c4be] hover:text-white transition-colors no-underline">
                            Ofertas
                        </Link>
                    </div>

                    {/* Columna 2 */}
                    <div className="flex flex-col gap-2">
                        <Link to="/login" className="text-[#c8c4be] hover:text-white transition-colors no-underline">
                            Mi cuenta
                        </Link>
                        <Link to="/login" className="text-[#c8c4be] hover:text-white transition-colors no-underline">
                            Mis pedidos
                        </Link>
                        <Link to="/cart" className="text-[#c8c4be] hover:text-white transition-colors no-underline">
                            Favoritos
                        </Link>
                    </div>

                    {/* Columna 3 */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[#c8c4be] cursor-default">Contacto</span>
                        <span className="text-[#c8c4be] cursor-default">Envíos</span>
                        <span className="text-[#c8c4be] cursor-default">Devoluciones</span>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="text-center text-[10px] text-[#5a5652] mt-8 tracking-[.08em]">
                © 2025 LOGANSTORE · TODOS LOS DERECHOS RESERVADOS
            </div>
        </footer>
    );
}
