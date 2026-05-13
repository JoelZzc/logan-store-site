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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-[#7a7672] text-[11px] tracking-widest font-light">CARGANDO...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-[#7a7672] text-sm font-light">Producto no encontrado</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-10 py-10">

                {/* Volver */}
                <button
                    onClick={() => navigate('/products')}
                    className="mb-8 text-[10px] tracking-[.12em] text-[#7a7672] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer font-light flex items-center gap-2"
                >
                    ← VOLVER AL CATÁLOGO
                </button>

                {/* Detalle del producto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14 mb-16">

                    {/* Imagen */}
                    <div className="bg-[#f4f0ec] flex items-center justify-center h-[420px] overflow-hidden">
                        <img
                            src={product.image_url || 'https://via.placeholder.com/500'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">

                        {/* Marca y nombre */}
                        {product.brand?.name && (
                            <p className="text-[10px] tracking-[.18em] text-[#b08070] mb-2 font-light">
                                {product.brand.name.toUpperCase()}
                            </p>
                        )}
                        <h1
                            className="text-4xl font-light text-[#2a2826] mb-4 leading-tight"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            {product.name}
                        </h1>

                        <p className="text-sm text-[#7a7672] font-light leading-relaxed mb-6">
                            {product.description}
                        </p>

                        {/* Precio */}
                        <div className="mb-6 pb-6 border-b border-[#e4e0db]">
                            <span className="text-3xl font-light text-[#2a2826]">
                                ${product.price}
                            </span>
                        </div>

                        {/* Meta */}
                        <div className="space-y-2 mb-6 pb-6 border-b border-[#e4e0db]">
                            <div className="flex gap-2">
                                <span className="text-[10px] tracking-[.08em] text-[#7a7672] font-light w-24">CATEGORÍA</span>
                                <span className="text-[12px] text-[#2a2826] font-light">{product.category?.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] tracking-[.08em] text-[#7a7672] font-light w-24">MARCA</span>
                                <span className="text-[12px] text-[#2a2826] font-light">{product.brand?.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] tracking-[.08em] text-[#7a7672] font-light w-24">STOCK</span>
                                <span className={`text-[12px] font-light ${product.stock > 0 ? 'text-[#3a6030]' : 'text-[#8a3a2a]'}`}>
                                    {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
                                </span>
                            </div>
                        </div>

                        {/* Cantidad */}
                        <div className="mb-6">
                            <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-3 font-light">
                                CANTIDAD
                            </label>
                            <div className="flex items-center gap-0 border border-[#e4e0db] w-fit">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-[#7a7672] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer text-lg font-light"
                                >
                                    −
                                </button>
                                <span className="w-10 h-10 flex items-center justify-center text-sm text-[#2a2826] font-light border-x border-[#e4e0db]">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    className="w-10 h-10 flex items-center justify-center text-[#7a7672] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer text-lg font-light"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Agregar al carrito */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="w-full bg-[#2a2826] text-[#f4f0ec] py-4 text-[11px] tracking-[.16em] font-light hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {product.stock === 0 ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
                        </button>
                    </div>
                </div>

                <div className="border-t border-[#e4e0db]" />

                {/* Reseñas */}
                <div className="pt-12">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">OPINIONES</p>
                            <h2
                                className="text-2xl font-light text-[#2a2826]"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                            >
                                Reseñas ({reviews.length})
                            </h2>
                        </div>
                        {user && (
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className={`text-[10px] tracking-[.12em] font-light px-5 py-3 transition-all border ${
                                    showReviewForm
                                        ? 'border-[#e4e0db] text-[#7a7672] hover:bg-[#f4f0ec]'
                                        : 'bg-[#2a2826] text-[#f4f0ec] border-[#2a2826] hover:opacity-80'
                                }`}
                            >
                                {showReviewForm ? 'CANCELAR' : 'ESCRIBIR RESEÑA'}
                            </button>
                        )}
                    </div>

                    {/* Formulario de reseña */}
                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="mb-10 p-8 bg-[#f4f0ec] border border-[#e4e0db]">
                            <div className="mb-5">
                                <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                    CALIFICACIÓN
                                </label>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                >
                                    <option value="5">★★★★★ — Excelente (5)</option>
                                    <option value="4">★★★★☆ — Muy bueno (4)</option>
                                    <option value="3">★★★☆☆ — Bueno (3)</option>
                                    <option value="2">★★☆☆☆ — Regular (2)</option>
                                    <option value="1">★☆☆☆☆ — Malo (1)</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                    COMENTARIO <span className="normal-case tracking-normal">(opcional)</span>
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors resize-none"
                                    placeholder="Cuéntanos tu experiencia con este producto..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity"
                            >
                                PUBLICAR RESEÑA
                            </button>
                        </form>
                    )}

                    {/* Lista de reseñas */}
                    {reviews.length === 0 ? (
                        <p className="text-[#7a7672] text-sm font-light text-center py-12">
                            Aún no hay reseñas para este producto
                        </p>
                    ) : (
                        <div className="divide-y divide-[#e4e0db]">
                            {reviews.map((review) => (
                                <div key={review.id} className="py-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-normal text-[#2a2826]">
                                                {review.user?.name || 'Usuario'}
                                            </p>
                                            <p className="text-[#b08070] text-sm mt-1">
                                                {'★'.repeat(review.rating)}
                                                <span className="text-[#e4e0db]">
                                                    {'★'.repeat(5 - review.rating)}
                                                </span>
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-[#7a7672] font-light tracking-wide">
                                            {new Date(review.created_at).toLocaleDateString('es-MX', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-[#7a7672] font-light leading-relaxed mt-2">
                                            {review.comment}
                                        </p>
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