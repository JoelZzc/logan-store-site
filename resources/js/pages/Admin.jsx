import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories, getBrands, getCoupons } from '../services/api';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        brand_id: '',
        image_url: '',
    });

    const [coupons, setCoupons] = useState([]);
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [couponFormData, setCouponFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        expires_at: '',
        is_active: true,
    });

    useEffect(() => {
        // Por simplicidad, no validamos rol de admin aquí
        // En producción deberías verificar que user.role === 'admin'
        if (!user) {
            navigate('/login');
            return;
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes, brandsRes, couponsRes] = await Promise.all([
                getProducts({}),
                getCategories(),
                getBrands(),
                getCoupons(),
            ]);
            setProducts(productsRes.data.data || productsRes.data);
            setCategories(categoriesRes.data.data || categoriesRes.data);
            setBrands(brandsRes.data.data || brandsRes.data);
            setCoupons(couponsRes.data.data || couponsRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    };

    // Funciones para cupones
    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon.id}`, couponFormData);
                alert('Cupón actualizado');
            } else {
                await api.post('/coupons', couponFormData);
                alert('Cupón creado');
            }
            resetCouponForm();
            loadData();
        } catch (error) {
            console.error('Error guardando cupón:', error);
            alert('Error al guardar cupón');
        }
    };

    const handleEditCoupon = (coupon) => {
        setEditingCoupon(coupon);
        setCouponFormData({
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_order_amount: coupon.min_order_amount || '',
            expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
            is_active: coupon.is_active,
        });
        setShowCouponForm(true);
    };

    const handleDeleteCoupon = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
        
        try {
            await api.delete(`/coupons/${id}`);
            alert('Cupón eliminado');
            loadData();
        } catch (error) {
            console.error('Error eliminando cupón:', error);
            alert('Error al eliminar cupón');
        }
    };

    const resetCouponForm = () => {
        setCouponFormData({
            code: '',
            discount_type: 'percentage',
            discount_value: '',
            min_order_amount: '',
            expires_at: '',
            is_active: true,
        });
        setEditingCoupon(null);
        setShowCouponForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formData);
                alert('Producto actualizado');
            } else {
                await api.post('/products', formData);
                alert('Producto creado');
            }
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error guardando producto:', error);
            alert('Error al guardar producto');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            category_id: product.category?.id || '',
            brand_id: product.brand?.id || '',
            image_url: product.image_url || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        
        try {
            await api.delete(`/products/${id}`);
            alert('Producto eliminado');
            loadData();
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('Error al eliminar producto');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category_id: '',
            brand_id: '',
            image_url: '',
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Cancelar' : '+ Nuevo Producto'}
                    </button>
                </div>

                {/* Formulario */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-xl font-bold mb-4">
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="px-3 py-2 border rounded-lg"
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Precio"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="px-3 py-2 border rounded-lg"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                className="px-3 py-2 border rounded-lg"
                                required
                            />
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                className="px-3 py-2 border rounded-lg"
                                required
                            >
                                <option value="">Selecciona categoría</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <select
                                value={formData.brand_id}
                                onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                                className="px-3 py-2 border rounded-lg"
                                required
                            >
                                <option value="">Selecciona marca</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                            <input
                                type="url"
                                placeholder="URL de imagen"
                                value={formData.image_url}
                                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                className="px-3 py-2 border rounded-lg"
                            />
                            <textarea
                                placeholder="Descripción"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="col-span-2 px-3 py-2 border rounded-lg"
                                rows="3"
                            />
                            <div className="col-span-2 flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    {editingProduct ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de productos */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">{product.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">${product.price}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{product.category?.name}</td>
                                    <td className="px-6 py-4 text-sm space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sección de Cupones */}
                <div className="mt-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Cupones de Descuento</h2>
                        <button
                            onClick={() => setShowCouponForm(!showCouponForm)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            {showCouponForm ? 'Cancelar' : '+ Nuevo Cupón'}
                        </button>
                    </div>

                    {/* Formulario de cupones */}
                    {showCouponForm && (
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <h3 className="text-xl font-bold mb-4">
                                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
                            </h3>
                            <form onSubmit={handleCouponSubmit} className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Código (ej: VERANO10)"
                                    value={couponFormData.code}
                                    onChange={(e) => setCouponFormData({...couponFormData, code: e.target.value.toUpperCase()})}
                                    className="px-3 py-2 border rounded-lg uppercase"
                                    required
                                />
                                <select
                                    value={couponFormData.discount_type}
                                    onChange={(e) => setCouponFormData({...couponFormData, discount_type: e.target.value})}
                                    className="px-3 py-2 border rounded-lg"
                                >
                                    <option value="percentage">Porcentaje (%)</option>
                                    <option value="fixed">Monto fijo ($)</option>
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder={couponFormData.discount_type === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'}
                                    value={couponFormData.discount_value}
                                    onChange={(e) => setCouponFormData({...couponFormData, discount_value: e.target.value})}
                                    className="px-3 py-2 border rounded-lg"
                                    required
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Monto mínimo (opcional)"
                                    value={couponFormData.min_order_amount}
                                    onChange={(e) => setCouponFormData({...couponFormData, min_order_amount: e.target.value})}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <input
                                    type="date"
                                    placeholder="Fecha de expiración"
                                    value={couponFormData.expires_at}
                                    onChange={(e) => setCouponFormData({...couponFormData, expires_at: e.target.value})}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={couponFormData.is_active}
                                        onChange={(e) => setCouponFormData({...couponFormData, is_active: e.target.checked})}
                                    />
                                    <span>Activo</span>
                                </label>
                                <div className="col-span-2 flex gap-2">
                                    <button
                                        type="submit"
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                    >
                                        {editingCoupon ? 'Actualizar' : 'Crear'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetCouponForm}
                                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tabla de cupones */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mín. Pedido</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id}>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{coupon.code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {coupon.discount_type === 'percentage' ? 'Porcentaje' : 'Fijo'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {coupon.min_order_amount ? `$${coupon.min_order_amount}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Sin límite'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {coupon.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <button
                                                onClick={() => handleEditCoupon(coupon)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon.id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
