import { useState, useEffect } from 'react';
import { getProducts, getCategories, getBrands } from '../services/api';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        search: '',
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes, brandsRes] = await Promise.all([
                getProducts({}),
                getCategories(),
                getBrands(),
            ]);

            setProducts(productsRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
            setBrands(brandsRes.data.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Header */}
            <div className="bg-[#f4f0ec] border-b border-[#e4e0db]">
                <div className="max-w-7xl mx-auto px-10 py-10">
                    <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-2">TIENDA</p>
                    <h1
                        className="text-3xl font-light text-[#2a2826]"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        Catálogo de productos
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-10 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

                    {/* Filtros */}
                    <div className="lg:col-span-1">
                        <div className="border border-[#e4e0db] p-6">

                            <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-5">FILTROS</p>

                            {/* Búsqueda */}
                            <div className="mb-6">
                                <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                    BUSCAR
                                </label>
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    placeholder="Nombre del producto..."
                                    className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                />
                            </div>

                            {/* Categorías */}
                            <div className="mb-6">
                                <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                    CATEGORÍA
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                >
                                    <option value="">Todas</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Marcas */}
                            <div className="mb-6">
                                <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                    MARCA
                                </label>
                                <select
                                    value={filters.brand}
                                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                >
                                    <option value="">Todas</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setFilters({ category: '', brand: '', search: '' })}
                                className="w-full border border-[#e4e0db] text-[#7a7672] py-3 text-[10px] tracking-[.12em] font-light hover:bg-[#f4f0ec] transition-colors bg-white"
                            >
                                LIMPIAR FILTROS
                            </button>
                        </div>
                    </div>

                    {/* Grid de productos */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="py-20 text-center">
                                <p className="text-[#7a7672] text-[11px] tracking-widest font-light">
                                    CARGANDO...
                                </p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-[#7a7672] text-sm font-light">
                                    No se encontraron productos
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/products/${product.id}`}
                                        className="group no-underline"
                                    >
                                        <div className="bg-[#f4f0ec] h-52 overflow-hidden mb-3 transition-colors group-hover:bg-[#ece8e4]">
                                            <img
                                                src={product.image_url || 'https://via.placeholder.com/300'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="px-1">
                                            <h3 className="text-sm font-normal text-[#2a2826] tracking-wide mb-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-[11px] text-[#7a7672] font-light mb-2 line-clamp-1">
                                                {product.description}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[#2a2826] font-normal">
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
                    </div>

                </div>
            </div>
        </div>
    );
}