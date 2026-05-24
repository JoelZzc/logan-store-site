import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories, getBrands, getCoupons, getInventoryAlerts } from '../services/api';
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
        min_stock: '',
        reorder_point: '',
        supplier_notes: '',
        category_id: '',
        brand_id: '',
        image_url: '',
    });

    const [coupons, setCoupons] = useState([]);
    const [alerts, setAlerts] = useState([]);
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

            // Cargar alertas de inventario
            const alertsRes = await getInventoryAlerts();
            setAlerts(alertsRes.data.data || alertsRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    };

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
            min_stock: product.min_stock || '',
            reorder_point: product.reorder_point || '',
            supplier_notes: product.supplier_notes || '',
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
            min_stock: '',
            reorder_point: '',
            supplier_notes: '',
            category_id: '',
            brand_id: '',
            image_url: '',
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    // Shared input classes
    const inputCls = "w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors";

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-10 py-10">

                {/* ── PRODUCTOS ── */}
                <div className="flex justify-between items-center mb-8 border-b border-[#e4e0db] pb-6">
                    <div>
                        <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">ADMINISTRACIÓN</p>
                        <h1
                            className="text-2xl font-light text-[#2a2826]"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            Panel de administración
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`text-[10px] tracking-[.14em] font-light px-6 py-3 transition-all border ${
                            showForm
                                ? 'border-[#e4e0db] text-[#7a7672] hover:bg-[#f4f0ec]'
                                : 'bg-[#2a2826] text-[#f4f0ec] border-[#2a2826] hover:opacity-80'
                        }`}
                    >
                        {showForm ? 'CANCELAR' : '+ NUEVO PRODUCTO'}
                    </button>
                </div>

                {/* Formulario de producto */}
                {showForm && (
                    <div className="border border-[#e4e0db] p-8 mb-8 bg-[#f4f0ec]">
                        <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">
                            {editingProduct ? 'EDITAR' : 'CREAR'}
                        </p>
                        <h2
                            className="text-lg font-light text-[#2a2826] mb-6"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            {editingProduct ? 'Editar producto' : 'Nuevo producto'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={inputCls}
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Precio"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className={inputCls}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                className={inputCls}
                                required
                            />
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                className={inputCls}
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
                                className={inputCls}
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
                                className={inputCls}
                            />
                            <input
                                type="number"
                                placeholder="Stock mínimo (alerta)"
                                value={formData.min_stock}
                                onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                                className={inputCls}
                            />
                            <input
                                type="number"
                                placeholder="Punto de reorden"
                                value={formData.reorder_point}
                                onChange={(e) => setFormData({...formData, reorder_point: e.target.value})}
                                className={inputCls}
                            />
                            <textarea
                                placeholder="Notas del proveedor (opcional)"
                                value={formData.supplier_notes}
                                onChange={(e) => setFormData({...formData, supplier_notes: e.target.value})}
                                className={`col-span-2 ${inputCls} resize-none`}
                                rows="2"
                            />
                            <textarea
                                placeholder="Descripción"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className={`col-span-2 ${inputCls} resize-none`}
                                rows="3"
                            />
                            <div className="col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity"
                                >
                                    {editingProduct ? 'ACTUALIZAR' : 'CREAR'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="border border-[#e4e0db] text-[#7a7672] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:bg-white transition-colors"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de productos */}
                <div className="border border-[#e4e0db] overflow-hidden mb-16">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#f4f0ec] border-b border-[#e4e0db]">
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">ID</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">NOMBRE</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">PRECIO</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">STOCK</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">CATEGORÍA</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4e0db]">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-[#f4f0ec] transition-colors">
                                    <td className="px-6 py-4 text-[11px] text-[#7a7672] font-light">{product.id}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-normal">{product.name}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-light">${product.price}</td>
                                    <td className="px-6 py-4 text-[12px] font-light">
                                        <span className={
                                            product.stock === 0
                                                ? 'text-red-600 font-semibold'
                                                : product.stock <= product.min_stock
                                                    ? 'text-orange-500 font-semibold'
                                                    : 'text-[#2a2826]'
                                        }>
                                            {product.stock}
                                            {product.stock === 0 && ' ⚠ SIN STOCK'}
                                            {product.stock > 0 && product.stock <= product.min_stock && ' ⚠ BAJO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[12px] text-[#7a7672] font-light">{product.category?.name}</td>
                                    <td className="px-6 py-4 text-[11px] space-x-4">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-[#b08070] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer font-light tracking-wide"
                                        >
                                            EDITAR
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-[#7a7672] hover:text-[#8a3a2a] transition-colors bg-transparent border-none cursor-pointer font-light tracking-wide"
                                        >
                                            ELIMINAR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── ALERTAS DE INVENTARIO ── */}
                {alerts.length > 0 && (
                    <div className="mb-16">
                        <div className="border-b border-[#e4e0db] pb-6 mb-8">
                            <p className="text-[9px] tracking-[.2em] text-red-500 mb-1">INVENTARIO</p>
                            <h2 className="text-2xl font-light text-[#2a2826]"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Alertas de Stock Bajo
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alerts.map((product) => (
                                <div key={product.id} className="border border-orange-200 bg-orange-50 p-4 rounded">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-normal text-[#2a2826]">{product.name}</h3>
                                        {product.stock === 0
                                            ? <span className="text-[9px] tracking-widest text-red-600 bg-red-100 px-2 py-1">SIN STOCK</span>
                                            : <span className="text-[9px] tracking-widest text-orange-600 bg-orange-100 px-2 py-1">STOCK BAJO</span>
                                        }
                                    </div>
                                    <div className="text-[11px] text-[#7a7672] space-y-1">
                                        <p>Stock actual: <span className="font-semibold text-red-600">{product.stock}</span></p>
                                        <p>Stock mínimo: <span className="font-semibold">{product.min_stock}</span></p>
                                        <p>Punto de reorden: <span className="font-semibold">{product.reorder_point}</span></p>
                                        {product.supplier_notes && (
                                            <p className="mt-2 text-[#b08070] italic">{product.supplier_notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CUPONES ── */}
                <div className="flex justify-between items-center mb-8 border-b border-[#e4e0db] pb-6">
                    <div>
                        <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">DESCUENTOS</p>
                        <h2
                            className="text-2xl font-light text-[#2a2826]"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            Cupones de descuento
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowCouponForm(!showCouponForm)}
                        className={`text-[10px] tracking-[.14em] font-light px-6 py-3 transition-all border ${
                            showCouponForm
                                ? 'border-[#e4e0db] text-[#7a7672] hover:bg-[#f4f0ec]'
                                : 'bg-[#2a2826] text-[#f4f0ec] border-[#2a2826] hover:opacity-80'
                        }`}
                    >
                        {showCouponForm ? 'CANCELAR' : '+ NUEVO CUPÓN'}
                    </button>
                </div>

                {/* Formulario de cupones */}
                {showCouponForm && (
                    <div className="border border-[#e4e0db] p-8 mb-8 bg-[#f4f0ec]">
                        <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">
                            {editingCoupon ? 'EDITAR' : 'CREAR'}
                        </p>
                        <h3
                            className="text-lg font-light text-[#2a2826] mb-6"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            {editingCoupon ? 'Editar cupón' : 'Nuevo cupón'}
                        </h3>
                        <form onSubmit={handleCouponSubmit} className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Código (ej: VERANO10)"
                                value={couponFormData.code}
                                onChange={(e) => setCouponFormData({...couponFormData, code: e.target.value.toUpperCase()})}
                                className={`${inputCls} uppercase tracking-widest`}
                                required
                            />
                            <select
                                value={couponFormData.discount_type}
                                onChange={(e) => setCouponFormData({...couponFormData, discount_type: e.target.value})}
                                className={inputCls}
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
                                className={inputCls}
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Monto mínimo (opcional)"
                                value={couponFormData.min_order_amount}
                                onChange={(e) => setCouponFormData({...couponFormData, min_order_amount: e.target.value})}
                                className={inputCls}
                            />
                            <input
                                type="date"
                                value={couponFormData.expires_at}
                                onChange={(e) => setCouponFormData({...couponFormData, expires_at: e.target.value})}
                                className={inputCls}
                            />
                            <label className="flex items-center gap-3 text-[12px] text-[#7a7672] font-light cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={couponFormData.is_active}
                                    onChange={(e) => setCouponFormData({...couponFormData, is_active: e.target.checked})}
                                    className="accent-[#2a2826] w-4 h-4"
                                />
                                Activo
                            </label>
                            <div className="col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity"
                                >
                                    {editingCoupon ? 'ACTUALIZAR' : 'CREAR'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetCouponForm}
                                    className="border border-[#e4e0db] text-[#7a7672] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:bg-white transition-colors"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de cupones */}
                <div className="border border-[#e4e0db] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#f4f0ec] border-b border-[#e4e0db]">
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">CÓDIGO</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">TIPO</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">DESCUENTO</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">MÍN. PEDIDO</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">EXPIRA</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">ESTADO</th>
                                <th className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4e0db]">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-[#f4f0ec] transition-colors">
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-normal tracking-widest">
                                        {coupon.code}
                                    </td>
                                    <td className="px-6 py-4 text-[12px] text-[#7a7672] font-light">
                                        {coupon.discount_type === 'percentage' ? 'Porcentaje' : 'Fijo'}
                                    </td>
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-light">
                                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                                    </td>
                                    <td className="px-6 py-4 text-[12px] text-[#7a7672] font-light">
                                        {coupon.min_order_amount ? `$${coupon.min_order_amount}` : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-[12px] text-[#7a7672] font-light">
                                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('es-MX') : 'Sin límite'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] px-3 py-1 tracking-[.08em] font-light ${
                                            coupon.is_active
                                                ? 'bg-[#e8f0e4] text-[#3a6030]'
                                                : 'bg-[#f0ece8] text-[#6a5848]'
                                        }`}>
                                            {coupon.is_active ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] space-x-4">
                                        <button
                                            onClick={() => handleEditCoupon(coupon)}
                                            className="text-[#b08070] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer font-light tracking-wide"
                                        >
                                            EDITAR
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCoupon(coupon.id)}
                                            className="text-[#7a7672] hover:text-[#8a3a2a] transition-colors bg-transparent border-none cursor-pointer font-light tracking-wide"
                                        >
                                            ELIMINAR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}