import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadFeaturedProducts();
    }, []);

    const loadFeaturedProducts = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts({}),
                getCategories(),
            ]);
            
            const products = productsRes.data.data || productsRes.data;
            setFeaturedProducts(products.slice(0, 6));
            
            const cats = categoriesRes.data.data || categoriesRes.data;
            setCategories(cats);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white font-light">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-[#f4f0ec]">
                <div className="max-w-7xl mx-auto px-10 py-24 flex items-center justify-between gap-12">
                    {/* Texto */}
                    <div className="max-w-md">
                        <p className="text-[10px] tracking-[.22em] text-[#b08070] mb-4 font-normal">
                            NUEVA COLECCIÓN · PRIMAVERA 2026
                        </p>
                        <h1 className="text-5xl font-light text-[#2a2826] mb-5 leading-tight"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
                            El perfume<br />que te define
                        </h1>
                        <p className="text-sm text-[#7a7672] mb-8 leading-relaxed font-light">
                            Descubre las mejores fragancias para cada ocasión.
                            Desde clásicos atemporales hasta creaciones únicas.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                to="/products"
                                className="border border-[#b08070] text-[#b08070] px-7 py-3 text-[10px] tracking-[.14em] hover:bg-[#b08070] hover:text-white transition-all"
                            >
                                VER CATÁLOGO
                            </Link>
                        </div>
                    </div>

                    {/* Visual botellas decorativas */}
                    <div className="flex gap-4 items-end flex-shrink-0">
                        <div className="w-16 h-24 bg-[#ece8e4] flex flex-col items-center justify-center gap-1">
                            <span className="text-[#b08070] text-2xl">◈</span>
                            <span className="text-[8px] tracking-widest text-[#b08070]">EDT</span>
                        </div>
                        <div className="w-24 h-40 bg-[#ddd8d0] flex flex-col items-center justify-center gap-1">
                            <span className="text-[#7a7672] text-4xl">◈</span>
                            <span className="text-[8px] tracking-widest text-[#7a7672]">SIGNATURE</span>
                        </div>
                        <div className="w-20 h-32 bg-[#ece8e4] flex flex-col items-center justify-center gap-1">
                            <span className="text-[#b08070] text-3xl">◈</span>
                            <span className="text-[8px] tracking-widest text-[#b08070]">EDP</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categorías */}
            <div className="max-w-7xl mx-auto px-10 py-14">
                <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-2">EXPLORAR</p>
                <h2 className="text-2xl font-light text-[#2a2826] mb-6"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    Encuentra tu esencia
                </h2>
                <div className="grid grid-cols-3 gap-3">
                    {categories.slice(0, 3).map((category) => (
                        <Link
                            key={category.id}
                            to={`/products?category=${category.id}`}
                            className="bg-[#f4f0ec] px-5 py-5 flex justify-between items-center hover:bg-[#ece8e4] transition-colors no-underline group"
                        >
                            <div>
                                <div className="text-lg text-[#2a2826] font-light"
                                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                    {category.name}
                                </div>
                                <div className="text-[10px] tracking-[.08em] text-[#7a7672] mt-1 font-light">
                                    VER PRODUCTOS
                                </div>
                            </div>
                            <span className="text-[#7a7672] group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    ))}
                </div>
            </div>


            <div className="border-t border-[#e4e0db] mx-10" />

            {/* Productos Destacados */}
            <div className="max-w-7xl mx-auto px-10 py-14">
                <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-2">SELECCIÓN</p>
                <h2 className="text-2xl font-light text-[#2a2826] mb-8"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    Bienvenido a Logan Store
                </h2>

                {loading ? (
                    <div className="py-16 text-center">
                        <p className="text-[#7a7672] text-sm tracking-widest font-light">CARGANDO...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProducts.map((product) => (
                            <Link
                                key={product.id}
                                to={`/products/${product.id}`}
                                className="group no-underline"
                            >
                                <div className="bg-[#f4f0ec] h-52 flex items-center justify-center mb-3 overflow-hidden transition-colors group-hover:bg-[#ece8e4]">
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="px-1">
                                    <h3 className="text-sm font-normal text-[#2a2826] tracking-wide">
                                        {product.name}
                                    </h3>
                                    <p className="text-[10px] tracking-[.1em] text-[#7a7672] mt-1 mb-2 font-light uppercase line-clamp-1">
                                        {product.description}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[#2a2826]">
                                            ${product.price}
                                        </span>
                                        <span className="text-[10px] text-[#7a7672] font-light">
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && featuredProducts.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-[#7a7672] text-sm font-light">No hay productos disponibles</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}