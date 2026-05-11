import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getProductReviews, createReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    // Estado para nueva review
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        loadProduct();
        loadReviews();
    }, [id]);

    const loadProduct = async () => {
        try {
            const response = await getProduct(id);
            setProduct(response.data.data || response.data);
        } catch (error) {
            console.error('Error cargando producto:', error);
        }
        setLoading(false);
    };

    const loadReviews = async () => {
        try {
            const response = await getProductReviews(id);
            setReviews(response.data.data || response.data);
        } catch (error) {
            console.error('Error cargando reviews:', error);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        alert('Producto agregado al carrito');
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!user) {
            alert('Debes iniciar sesión para dejar una reseña');
            navigate('/login');
            return;
        }
        
        try {
            await createReview(id, { rating, comment });
            setComment('');
            setRating(5);
            setShowReviewForm(false);
            loadReviews();
            alert('Reseña publicada');
        } catch (error) {
            console.error('Error al crear reseña:', error);
            alert('Error al publicar reseña');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Cargando producto...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Producto no encontrado</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Botón volver */}
                <button
                    onClick={() => navigate('/products')}
                    className="mb-6 text-blue-600 hover:underline"
                >
                    ← Volver al catálogo
                </button>

                {/* Detalle del producto */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        {/* Imagen */}
                        <div>
                            <img
                                src={product.image_url || 'https://via.placeholder.com/500'}
                                alt={product.name}
                                className="w-full h-96 object-cover rounded-lg"
                            />
                        </div>

                        {/* Info */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                {product.name}
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                {product.description}
                            </p>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-blue-600">
                                    ${product.price}
                                </span>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Stock disponible:</span> {product.stock} unidades
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Categoría:</span> {product.category?.name}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Marca:</span> {product.brand?.name}
                                </p>
                            </div>

                            {/* Cantidad */}
                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.stock}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Botón agregar al carrito */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reseñas */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Reseñas ({reviews.length})
                        </h2>
                        {user && (
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                {showReviewForm ? 'Cancelar' : 'Escribir reseña'}
                            </button>
                        )}
                    </div>

                    {/* Formulario de nueva reseña */}
                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Calificación
                                </label>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                    <option value="4">⭐⭐⭐⭐ (4)</option>
                                    <option value="3">⭐⭐⭐ (3)</option>
                                    <option value="2">⭐⭐ (2)</option>
                                    <option value="1">⭐ (1)</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Comentario (opcional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Cuéntanos tu experiencia con este producto..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Publicar reseña
                            </button>
                        </form>
                    )}

                    {/* Lista de reseñas */}
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            Aún no hay reseñas para este producto
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b pb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {review.user?.name || 'Usuario'}
                                            </p>
                                            <p className="text-yellow-500">
                                                {'⭐'.repeat(review.rating)}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-700">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
