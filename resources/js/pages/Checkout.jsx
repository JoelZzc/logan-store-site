import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAddresses, createAddress, createOrder, applyCoupon } from '../services/api';

export default function Checkout() {
    const { user } = useAuth();
    const { cart, getTotal, clearCart } = useCart();
    const navigate = useNavigate();
    
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Formulario de nueva dirección
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'MX',
        is_default: false,
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        if (cart.length === 0) {
            navigate('/cart');
            return;
        }
        
        loadAddresses();
    }, [user, cart]);

    const loadAddresses = async () => {
        try {
            const response = await getAddresses();
            const addressList = response.data.data || response.data;
            setAddresses(addressList);
            
            if (addressList.length > 0) {
                setSelectedAddress(addressList[0].id);
            }
        } catch (error) {
            console.error('Error cargando direcciones:', error);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await createAddress(newAddress);
            setNewAddress({
                street: '',
                city: '',
                state: '',
                zip_code: '',
                country: 'MX',
                is_default: false,
            });
            setShowAddressForm(false);
            loadAddresses();
        } catch (error) {
            console.error('Error creando dirección:', error);
            alert('Error al guardar la dirección');
        }
    };

    const handleApplyCoupon = async () => {
        try {
            const response = await applyCoupon(couponCode);
            setAppliedCoupon(response.data.data || response.data);
            alert('Cupón aplicado correctamente');
        } catch (error) {
            alert(error.response?.data?.message || 'Cupón no válido');
            setAppliedCoupon(null);
        }
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        
        const subtotal = getTotal();
        
        if (appliedCoupon.discount_type === 'percentage') {
            return (subtotal * appliedCoupon.discount_value) / 100;
        }
        
        return appliedCoupon.discount_value;
    };

    const getFinalTotal = () => {
        return getTotal() - calculateDiscount();
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Selecciona una dirección de envío');
            return;
        }
        
        setLoading(true);
        
        try {
            const orderData = {
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                })),
            };
            
            const response = await createOrder(orderData);
            clearCart();
            navigate('/order-confirmation', { state: { order: response.data } });
        } catch (error) {
            console.error('Error creando pedido:', error);
            alert(error.response?.data?.message || 'Error al procesar el pedido');
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formularios */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Dirección de envío */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Dirección de envío
                                </h2>
                                <button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {showAddressForm ? 'Cancelar' : '+ Nueva dirección'}
                                </button>
                            </div>

                            {showAddressForm && (
                                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 rounded">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Calle y número"
                                            value={newAddress.street}
                                            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                            className="col-span-2 px-3 py-2 border rounded-lg"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Ciudad"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                            className="px-3 py-2 border rounded-lg"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Estado"
                                            value={newAddress.state}
                                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                            className="px-3 py-2 border rounded-lg"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Código postal"
                                            value={newAddress.zip_code}
                                            onChange={(e) => setNewAddress({...newAddress, zip_code: e.target.value})}
                                            className="px-3 py-2 border rounded-lg"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="País (MX)"
                                            value={newAddress.country}
                                            onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                                            className="px-3 py-2 border rounded-lg"
                                            maxLength="2"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Guardar dirección
                                    </button>
                                </form>
                            )}

                            {addresses.length === 0 ? (
                                <p className="text-gray-500">No tienes direcciones guardadas</p>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((address) => (
                                        <label
                                            key={address.id}
                                            className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                value={address.id}
                                                checked={selectedAddress === address.id}
                                                onChange={() => setSelectedAddress(address.id)}
                                                className="mt-1"
                                            />
                                            <div>
                                                <p className="font-semibold">{address.street}</p>
                                                <p className="text-gray-600">
                                                    {address.city}, {address.state} {address.zip_code}
                                                </p>
                                                <p className="text-gray-600">{address.country}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cupón */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Cupón de descuento
                            </h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Código de cupón"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 px-3 py-2 border rounded-lg"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Aplicar
                                </button>
                            </div>
                            {appliedCoupon && (
                                <p className="mt-2 text-green-600">
                                    ✓ Cupón "{appliedCoupon.code}" aplicado
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Resumen del pedido
                            </h2>

                            <div className="space-y-3 mb-6">
                                {cart.map((item) => (
                                    <div key={item.product.id} className="flex justify-between text-sm">
                                        <span className="text-gray-700">
                                            {item.product.name} x{item.quantity}
                                        </span>
                                        <span className="font-semibold">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Descuento</span>
                                        <span>-${calculateDiscount().toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>${getFinalTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || !selectedAddress}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Procesando...' : 'Confirmar pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
