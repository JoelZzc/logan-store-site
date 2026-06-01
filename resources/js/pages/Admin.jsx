import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories, getBrands, getCoupons, getInventoryAlerts, getShipments, createShipment, updateShipment, getAdminOrders, getReturns, updateReturn } from '../services/api';
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
        name: '', description: '', price: '', stock: '',
        min_stock: '', reorder_point: '', supplier_notes: '',
        category_id: '', brand_id: '', image_url: '',
    });
    const [coupons, setCoupons] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [adminOrders, setAdminOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [showShipmentForm, setShowShipmentForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingShipment, setEditingShipment] = useState(null);
    const [shipmentFormData, setShipmentFormData] = useState({
        carrier: '', tracking_number: '', status: 'pending', notes: '',
    });
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [couponFormData, setCouponFormData] = useState({
        code: '', discount_type: 'percentage', discount_value: '',
        min_order_amount: '', expires_at: '', is_active: true,
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes, brandsRes, couponsRes] = await Promise.all([
                getProducts({}), getCategories(), getBrands(), getCoupons(),
            ]);
            setProducts(productsRes.data.data || productsRes.data);
            setCategories(categoriesRes.data.data || categoriesRes.data);
            setBrands(brandsRes.data.data || brandsRes.data);
            setCoupons(couponsRes.data.data || couponsRes.data);
            const alertsRes = await getInventoryAlerts();
            setAlerts(alertsRes.data.data || alertsRes.data);
            const shipmentsRes = await getShipments();
            setShipments(shipmentsRes.data.data || shipmentsRes.data);
            const ordersRes = await getAdminOrders();
            setAdminOrders(ordersRes.data);
            const returnsRes = await getReturns();
            setReturns(returnsRes.data.data || returnsRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCoupon) { await api.put(`/coupons/${editingCoupon.id}`, couponFormData); alert('Cupón actualizado'); }
            else { await api.post('/coupons', couponFormData); alert('Cupón creado'); }
            resetCouponForm(); loadData();
        } catch (error) { alert('Error al guardar cupón'); }
    };

    const handleEditCoupon = (coupon) => {
        setEditingCoupon(coupon);
        setCouponFormData({
            code: coupon.code, discount_type: coupon.discount_type,
            discount_value: coupon.discount_value, min_order_amount: coupon.min_order_amount || '',
            expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '', is_active: coupon.is_active,
        });
        setShowCouponForm(true);
    };

    const handleDeleteCoupon = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
        try { await api.delete(`/coupons/${id}`); alert('Cupón eliminado'); loadData(); }
        catch (error) { alert('Error al eliminar cupón'); }
    };

    const resetCouponForm = () => {
        setCouponFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', expires_at: '', is_active: true });
        setEditingCoupon(null); setShowCouponForm(false);
    };

    const handleShipmentSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingShipment) { await updateShipment(editingShipment.id, shipmentFormData); alert('Envío actualizado'); }
            else { await createShipment(selectedOrder.id, shipmentFormData); alert('Envío creado'); }
            resetShipmentForm(); loadData();
        } catch (error) { alert(error.response?.data?.message || 'Error al guardar envío'); }
    };

    const handleEditShipment = (shipment) => {
        setEditingShipment(shipment);
        setShipmentFormData({ carrier: shipment.carrier, tracking_number: shipment.tracking_number || '', status: shipment.status, notes: shipment.notes || '' });
        const order = adminOrders.find(o => o.id === shipment.order_id);
        setSelectedOrder(order || { id: shipment.order_id, user: 'Pedido #' + shipment.order_id });
        setShowShipmentForm(true);
    };

    const resetShipmentForm = () => {
        setShipmentFormData({ carrier: '', tracking_number: '', status: 'pending', notes: '' });
        setEditingShipment(null); setSelectedOrder(null); setShowShipmentForm(false);
    };

    const handleReturnAction = async (returnId, status, adminNotes = '') => {
        try {
            await updateReturn(returnId, { status, admin_notes: adminNotes });
            alert(status === 'approved' ? 'Devolución aprobada' : 'Devolución rechazada');
            loadData();
        } catch (error) { alert('Error al procesar la devolución'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const cleanData = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v]));
            if (editingProduct) { await api.put(`/products/${editingProduct.id}`, cleanData); alert('Producto actualizado'); }
            else { await api.post('/products', cleanData); alert('Producto creado'); }
            resetForm(); loadData();
        } catch (error) { alert(error.response?.data?.message || 'Error al guardar producto'); }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name, description: product.description || '', price: product.price,
            stock: product.stock, min_stock: product.min_stock || '', reorder_point: product.reorder_point || '',
            supplier_notes: product.supplier_notes || '', category_id: product.category?.id || '',
            brand_id: product.brand?.id || '', image_url: product.image_url || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try { await api.delete(`/products/${id}`); alert('Producto eliminado'); loadData(); }
        catch (error) { alert('Error al eliminar producto'); }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: '', stock: '', min_stock: '', reorder_point: '', supplier_notes: '', category_id: '', brand_id: '', image_url: '' });
        setEditingProduct(null); setShowForm(false);
    };

    const inputCls = "w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors";
    const sectionHeader = (tag, title) => (
        <div className="border-b border-[#e4e0db] pb-6 mb-8">
            <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">{tag}</p>
            <h2 className="text-2xl font-light text-[#2a2826]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{title}</h2>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-10 py-10">

                {/* ── PRODUCTOS ── */}
                <div className="flex justify-between items-center mb-8 border-b border-[#e4e0db] pb-6">
                    <div>
                        <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">ADMINISTRACIÓN</p>
                        <h1 className="text-2xl font-light text-[#2a2826]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                            Panel de administración
                        </h1>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className={`text-[10px] tracking-[.14em] font-light px-6 py-3 transition-all border ${showForm ? 'border-[#e4e0db] text-[#7a7672] hover:bg-[#f4f0ec]' : 'bg-[#2a2826] text-[#f4f0ec] border-[#2a2826] hover:opacity-80'}`}>
                        {showForm ? 'CANCELAR' : '+ NUEVO PRODUCTO'}
                    </button>
                </div>

                {showForm && (
                    <div className="border border-[#e4e0db] p-8 mb-8 bg-[#f4f0ec]">
                        <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">{editingProduct ? 'EDITAR' : 'CREAR'}</p>
                        <h2 className="text-lg font-light text-[#2a2826] mb-6" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                            {editingProduct ? 'Editar producto' : 'Nuevo producto'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputCls} required />
                            <input type="number" step="0.01" placeholder="Precio" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className={inputCls} required />
                            <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className={inputCls} required />
                            <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className={inputCls} required>
                                <option value="">Selecciona categoría</option>
                                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <select value={formData.brand_id} onChange={(e) => setFormData({...formData, brand_id: e.target.value})} className={inputCls} required>
                                <option value="">Selecciona marca</option>
                                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                            </select>
                            <input type="url" placeholder="URL de imagen" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className={inputCls} />
                            <input type="number" placeholder="Stock mínimo (alerta)" value={formData.min_stock} onChange={(e) => setFormData({...formData, min_stock: e.target.value})} className={inputCls} />
                            <input type="number" placeholder="Punto de reorden" value={formData.reorder_point} onChange={(e) => setFormData({...formData, reorder_point: e.target.value})} className={inputCls} />
                            <textarea placeholder="Notas del proveedor (opcional)" value={formData.supplier_notes} onChange={(e) => setFormData({...formData, supplier_notes: e.target.value})} className={`col-span-2 ${inputCls} resize-none`} rows="2" />
                            <textarea placeholder="Descripción" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`col-span-2 ${inputCls} resize-none`} rows="3" />
                            <div className="col-span-2 flex gap-3">
                                <button type="submit" className="bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity">{editingProduct ? 'ACTUALIZAR' : 'CREAR'}</button>
                                <button type="button" onClick={resetForm} className="border border-[#e4e0db] text-[#7a7672] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:bg-white transition-colors">CANCELAR</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="border border-[#e4e0db] overflow-hidden mb-16">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#f4f0ec] border-b border-[#e4e0db]">
                                {['ID','NOMBRE','PRECIO','STOCK','CATEGORÍA','ACCIONES'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4e0db]">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-[#f4f0ec] transition-colors">
                                    <td className="px-6 py-4 text-[11px] text-[#7a7672] font-light">{product.id}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-normal">{product.name}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-light">${product.price}</td>
                                    <td className="px-6 py-4 text-[12px] font-light">
                                        <span className={product.stock === 0 ? 'text-[#8a3a2a] font-normal' : product.stock <= product.min_stock ? 'text-[#b08070] font-normal' : 'text-[#2a2826]'}>
                                            {product.stock}
                                            {product.stock === 0 && ' · SIN STOCK'}
                                            {product.stock > 0 && product.stock <= product.min_stock && ' · BAJO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[12px] text-[#7a7672] font-light">{product.category?.name}</td>
                                    <td className="px-6 py-4 text-[11px] space-x-4">
                                        <button onClick={() => handleEdit(product)} className="text-[#b08070] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer font-light tracking-wide">EDITAR</button>
                                        <button onClick={() => handleDelete(product.id)} className="text-[#7a7672] hover:text-[#8a3a2a] transition-colors bg-transparent border-none cursor-pointer font-light tracking-wide">ELIMINAR</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── ALERTAS ── */}
                {alerts.length > 0 && (
                    <div className="mb-16">
                        {sectionHeader('INVENTARIO', 'Alertas de stock bajo')}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alerts.map((product) => (
                                <div key={product.id} className="border border-[#e4b0a0] bg-[#fdf0ec] p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-sm font-normal text-[#2a2826]">{product.name}</h3>
                                        {product.stock === 0
                                            ? <span className="text-[9px] tracking-widest text-[#8a3a2a] bg-[#fde0d8] px-2 py-1">SIN STOCK</span>
                                            : <span className="text-[9px] tracking-widest text-[#b08070] bg-[#f5e8e0] px-2 py-1">STOCK BAJO</span>
                                        }
                                    </div>
                                    <div className="text-[11px] text-[#7a7672] space-y-1 font-light">
                                        <p>Stock actual: <span className="text-[#8a3a2a]">{product.stock}</span></p>
                                        <p>Stock mínimo: <span className="text-[#2a2826]">{product.min_stock}</span></p>
                                        <p>Punto de reorden: <span className="text-[#2a2826]">{product.reorder_point}</span></p>
                                        {product.supplier_notes && <p className="mt-2 text-[#b08070] italic">{product.supplier_notes}</p>}
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
                        <h2 className="text-2xl font-light text-[#2a2826]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Cupones de descuento</h2>
                    </div>
                    <button onClick={() => setShowCouponForm(!showCouponForm)}
                        className={`text-[10px] tracking-[.14em] font-light px-6 py-3 transition-all border ${showCouponForm ? 'border-[#e4e0db] text-[#7a7672] hover:bg-[#f4f0ec]' : 'bg-[#2a2826] text-[#f4f0ec] border-[#2a2826] hover:opacity-80'}`}>
                        {showCouponForm ? 'CANCELAR' : '+ NUEVO CUPÓN'}
                    </button>
                </div>

                {showCouponForm && (
                    <div className="border border-[#e4e0db] p-8 mb-8 bg-[#f4f0ec]">
                        <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">{editingCoupon ? 'EDITAR' : 'CREAR'}</p>
                        <h3 className="text-lg font-light text-[#2a2826] mb-6" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                            {editingCoupon ? 'Editar cupón' : 'Nuevo cupón'}
                        </h3>
                        <form onSubmit={handleCouponSubmit} className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Código (ej: VERANO10)" value={couponFormData.code} onChange={(e) => setCouponFormData({...couponFormData, code: e.target.value.toUpperCase()})} className={`${inputCls} uppercase tracking-widest`} required />
                            <select value={couponFormData.discount_type} onChange={(e) => setCouponFormData({...couponFormData, discount_type: e.target.value})} className={inputCls}>
                                <option value="percentage">Porcentaje (%)</option>
                                <option value="fixed">Monto fijo ($)</option>
                            </select>
                            <input type="number" step="0.01" placeholder={couponFormData.discount_type === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'} value={couponFormData.discount_value} onChange={(e) => setCouponFormData({...couponFormData, discount_value: e.target.value})} className={inputCls} required />
                            <input type="number" step="0.01" placeholder="Monto mínimo (opcional)" value={couponFormData.min_order_amount} onChange={(e) => setCouponFormData({...couponFormData, min_order_amount: e.target.value})} className={inputCls} />
                            <input type="date" value={couponFormData.expires_at} onChange={(e) => setCouponFormData({...couponFormData, expires_at: e.target.value})} className={inputCls} />
                            <label className="flex items-center gap-3 text-[12px] text-[#7a7672] font-light cursor-pointer">
                                <input type="checkbox" checked={couponFormData.is_active} onChange={(e) => setCouponFormData({...couponFormData, is_active: e.target.checked})} className="accent-[#2a2826] w-4 h-4" />
                                Activo
                            </label>
                            <div className="col-span-2 flex gap-3">
                                <button type="submit" className="bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity">{editingCoupon ? 'ACTUALIZAR' : 'CREAR'}</button>
                                <button type="button" onClick={resetCouponForm} className="border border-[#e4e0db] text-[#7a7672] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:bg-white transition-colors">CANCELAR</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="border border-[#e4e0db] overflow-hidden mb-16">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#f4f0ec] border-b border-[#e4e0db]">
                                {['CÓDIGO','TIPO','DESCUENTO','MÍN. PEDIDO','EXPIRA','ESTADO','ACCIONES'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4e0db]">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-[#f4f0ec] transition-colors">
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-normal tracking-widest">{coupon.code}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#7a7672] font-light">{coupon.discount_type === 'percentage' ? 'Porcentaje' : 'Fijo'}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-light">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#7a7672] font-light">{coupon.min_order_amount ? `$${coupon.min_order_amount}` : '—'}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#7a7672] font-light">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('es-MX') : 'Sin límite'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] px-3 py-1 tracking-[.08em] font-light ${coupon.is_active ? 'bg-[#e8f0e4] text-[#3a6030]' : 'bg-[#f0ece8] text-[#6a5848]'}`}>
                                            {coupon.is_active ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] space-x-4">
                                        <button onClick={() => handleEditCoupon(coupon)} className="text-[#b08070] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer font-light tracking-wide">EDITAR</button>
                                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-[#7a7672] hover:text-[#8a3a2a] transition-colors bg-transparent border-none cursor-pointer font-light tracking-wide">ELIMINAR</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── ENVÍOS ── */}
                <div className="flex justify-between items-center mb-8 border-b border-[#e4e0db] pb-6">
                    <div>
                        <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">LOGÍSTICA</p>
                        <h2 className="text-2xl font-light text-[#2a2826]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Gestión de envíos</h2>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-[10px] tracking-[.14em] text-[#7a7672] mb-4">PEDIDOS PENDIENTES DE ENVÍO</p>
                    {adminOrders.filter(o => o.status === 'pending' || o.status === 'paid').length === 0 ? (
                        <p className="text-[12px] text-[#7a7672] font-light py-4">No hay pedidos pendientes de envío</p>
                    ) : (
                        <div className="space-y-3">
                            {adminOrders.filter(o => o.status === 'pending' || o.status === 'paid').map(order => (
                                <div key={order.id} className={`border p-5 transition-colors ${selectedOrder?.id === order.id ? 'border-[#2a2826] bg-[#f4f0ec]' : 'border-[#e4e0db] hover:bg-[#f9f7f5]'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className="text-[11px] text-[#7a7672]">#{order.id}</span>
                                                <span className="text-[12px] font-normal text-[#2a2826]">{order.user}</span>
                                                <span className="text-[12px] text-[#2a2826]">${parseFloat(order.total).toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                                                <span className="text-[9px] tracking-widest text-[#b08070] bg-[#f5e8e0] px-2 py-1">{order.status.toUpperCase()}</span>
                                            </div>
                                            <div className="text-[11px] text-[#7a7672] font-light mb-2">
                                                {order.items.map((item, i) => (
                                                    <span key={i}>{item.product} x{item.qty}{i < order.items.length - 1 ? ', ' : ''}</span>
                                                ))}
                                            </div>
                                            {order.address ? (
                                                <div className="text-[11px] text-[#7a7672] font-light">
                                                    📍 {order.address.street}, {order.address.city}, {order.address.state} {order.address.zip_code}
                                                </div>
                                            ) : (
                                                <div className="text-[11px] text-[#b08070]">Sin dirección registrada</div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            {order.shipment ? (
                                                <span className="text-[9px] tracking-widest text-[#3a6030] bg-[#e8f0e4] px-3 py-1">ENVÍO CREADO</span>
                                            ) : (
                                                <button onClick={() => { setSelectedOrder(order); setShowShipmentForm(true); }}
                                                    className="bg-[#2a2826] text-[#f4f0ec] px-4 py-2 text-[10px] tracking-[.12em] hover:opacity-80 transition-opacity">
                                                    CREAR ENVÍO
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showShipmentForm && selectedOrder && (
                    <div className="border border-[#2a2826] p-8 mb-8 bg-[#f4f0ec]">
                        <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-1">{editingShipment ? 'EDITAR ENVÍO' : 'REGISTRAR ENVÍO'}</p>
                        <h3 className="text-lg font-light text-[#2a2826] mb-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                            Pedido #{selectedOrder.id} — {selectedOrder.user}
                        </h3>
                        <p className="text-[11px] text-[#7a7672] mb-6">
                            {selectedOrder.address ? `${selectedOrder.address.street}, ${selectedOrder.address.city}` : 'Sin dirección'}
                        </p>
                        <form onSubmit={handleShipmentSubmit} className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Paquetería (DHL, FedEx, Estafeta...)" value={shipmentFormData.carrier} onChange={(e) => setShipmentFormData({...shipmentFormData, carrier: e.target.value})} className={inputCls} required />
                            <input type="text" placeholder="Número de rastreo (opcional)" value={shipmentFormData.tracking_number} onChange={(e) => setShipmentFormData({...shipmentFormData, tracking_number: e.target.value})} className={inputCls} />
                            {editingShipment && (
                                <select value={shipmentFormData.status} onChange={(e) => setShipmentFormData({...shipmentFormData, status: e.target.value})} className={inputCls}>
                                    <option value="pending">Pendiente</option>
                                    <option value="shipped">Enviado</option>
                                    <option value="in_transit">En tránsito</option>
                                    <option value="delivered">Entregado</option>
                                    <option value="failed">Fallido</option>
                                </select>
                            )}
                            <textarea placeholder="Notas (opcional)" value={shipmentFormData.notes} onChange={(e) => setShipmentFormData({...shipmentFormData, notes: e.target.value})} className={`col-span-2 ${inputCls} resize-none`} rows="2" />
                            <div className="col-span-2 flex gap-3">
                                <button type="submit" className="bg-[#2a2826] text-[#f4f0ec] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity">
                                    {editingShipment ? 'ACTUALIZAR' : 'REGISTRAR ENVÍO'}
                                </button>
                                <button type="button" onClick={resetShipmentForm} className="border border-[#e4e0db] text-[#7a7672] px-8 py-3 text-[10px] tracking-[.14em] font-light hover:bg-white transition-colors">CANCELAR</button>
                            </div>
                        </form>
                    </div>
                )}

                <p className="text-[10px] tracking-[.14em] text-[#7a7672] mb-4 mt-8">ENVÍOS REGISTRADOS</p>
                <div className="border border-[#e4e0db] overflow-hidden mb-16">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#f4f0ec] border-b border-[#e4e0db]">
                                {['PEDIDO','PAQUETERÍA','RASTREO','ESTADO','ENVIADO','ENTREGADO','ACCIONES'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4e0db]">
                            {shipments.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-[12px] text-[#7a7672] font-light">No hay envíos registrados</td></tr>
                            ) : shipments.map((shipment) => (
                                <tr key={shipment.id} className="hover:bg-[#f4f0ec] transition-colors">
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826]">#{shipment.order_id}</td>
                                    <td className="px-6 py-4 text-[12px] text-[#2a2826] font-light">{shipment.carrier}</td>
                                    <td className="px-6 py-4 text-[11px] text-[#7a7672] font-light">{shipment.tracking_number || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] px-3 py-1 tracking-[.08em] font-light ${
                                            shipment.status === 'delivered' ? 'bg-[#e8f0e4] text-[#3a6030]' :
                                            shipment.status === 'shipped' || shipment.status === 'in_transit' ? 'bg-[#e8f0f8] text-[#1a5070]' :
                                            shipment.status === 'failed' ? 'bg-[#fde0d8] text-[#8a3a2a]' :
                                            'bg-[#f0ece8] text-[#6a5848]'
                                        }`}>
                                            {shipment.status === 'pending' ? 'PENDIENTE' :
                                             shipment.status === 'shipped' ? 'ENVIADO' :
                                             shipment.status === 'in_transit' ? 'EN TRÁNSITO' :
                                             shipment.status === 'delivered' ? 'ENTREGADO' : 'FALLIDO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-[#7a7672] font-light">{shipment.shipped_at || '—'}</td>
                                    <td className="px-6 py-4 text-[11px] text-[#7a7672] font-light">{shipment.delivered_at || '—'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleEditShipment(shipment)} className="text-[#b08070] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer text-[11px] font-light tracking-wide">EDITAR</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── DEVOLUCIONES ── */}
                <div className="flex justify-between items-center mb-8 border-b border-[#e4e0db] pb-6">
                    <div>
                        <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">POSTVENTA</p>
                        <h2 className="text-2xl font-light text-[#2a2826]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                            Gestión de devoluciones
                        </h2>
                    </div>
                </div>

                {returns.length === 0 ? (
                    <p className="text-[12px] text-[#7a7672] font-light py-4 mb-16">No hay solicitudes de devolución</p>
                ) : (
                    <div className="space-y-4 mb-16">
                        {returns.map((ret) => (
                            <div key={ret.id} className="border border-[#e4e0db] p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-[11px] text-[#7a7672]">#{ret.id}</span>
                                            <span className="text-[12px] font-normal text-[#2a2826]">
                                                {ret.user?.name || 'Cliente'}
                                            </span>
                                            <span className="text-[11px] text-[#7a7672]">Pedido #{ret.order_id}</span>
                                            <span className={`text-[9px] px-3 py-1 tracking-[.08em] font-light ${
                                                ret.status === 'approved' ? 'bg-[#e8f0e4] text-[#3a6030]' :
                                                ret.status === 'rejected' ? 'bg-[#fde0d8] text-[#8a3a2a]' :
                                                'bg-[#f5e8e0] text-[#b08070]'
                                            }`}>
                                                {ret.status === 'pending' ? 'PENDIENTE' :
                                                 ret.status === 'approved' ? 'APROBADA' : 'RECHAZADA'}
                                            </span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-[10px] tracking-[.08em] text-[#7a7672]">MOTIVO · </span>
                                            <span className="text-[12px] text-[#2a2826] font-light">{ret.reason}</span>
                                        </div>
                                        {ret.admin_notes && (
                                            <div className="text-[11px] text-[#b08070] italic mt-1">
                                                Nota: {ret.admin_notes}
                                            </div>
                                        )}
                                        <div className="text-[10px] text-[#7a7672] font-light mt-2">
                                            Solicitado: {new Date(ret.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                    {ret.status === 'pending' && (
                                        <div className="ml-6 flex flex-col gap-2 flex-shrink-0">
                                            <button onClick={() => handleReturnAction(ret.id, 'approved')}
                                                className="bg-[#2a2826] text-[#f4f0ec] px-5 py-2 text-[10px] tracking-[.12em] font-light hover:opacity-80 transition-opacity">
                                                APROBAR
                                            </button>
                                            <button onClick={() => handleReturnAction(ret.id, 'rejected')}
                                                className="border border-[#e4e0db] text-[#7a7672] px-5 py-2 text-[10px] tracking-[.12em] font-light hover:bg-[#f4f0ec] transition-colors">
                                                RECHAZAR
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}