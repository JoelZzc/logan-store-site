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
        <div className="min-h-screen bg-gray-50">
             <Navbar />
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filtros */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-4">Filtros</h2>
                            
                            {/* Búsqueda */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Buscar
                                </label>
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    placeholder="Nombre del producto..."
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Categorías */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marca
                                </label>
                                <select
                                    value={filters.brand}
                                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>

                    {/* Grid de productos */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Cargando productos...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No se encontraron productos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/products/${product.id}`}
                                        className="bg-white rounded-lg shadow hover:shadow-lg transition"
                                    >
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/300'}
                                            alt={product.name}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg text-gray-900 mb-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                                {product.description}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    ${product.price}
                                                </span>
                                                <span className="text-sm text-gray-500">
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