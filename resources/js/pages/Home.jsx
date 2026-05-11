import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import Navbar from '../components/Navbar';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeaturedProducts();
    }, []);

    const loadFeaturedProducts = async () => {
        try {
            const response = await getProducts({});
            const products = response.data.data || response.data;
            // Muestra solo los primeros 6 productos
            setFeaturedProducts(products.slice(0, 6));
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Bienvenido a Logan Store
                    </h1>
                    <p className="text-xl mb-8">
                        Descubre las mejores fragancias para cada ocasión
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Ver catálogo completo
                    </Link>
                </div>
            </div>

            {/* Productos destacados */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Productos Destacados
                </h2>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Cargando productos...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProducts.map((product) => (
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

                {!loading && featuredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No hay productos disponibles</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; 2026 Logan Store. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
