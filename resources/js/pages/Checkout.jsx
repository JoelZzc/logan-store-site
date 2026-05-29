import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAddresses, createAddress, createOrder, applyCoupon } from '../services/api';
import Navbar from '../components/Navbar';

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
                address_id: selectedAddress,
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
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-10 py-10">

                {/* Header */}
                <div className="mb-10 border-b border-[#e4e0db] pb-6">
                    <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">PAGO</p>
                    <h1
                        className="text-2xl font-light text-[#2a2826]"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        Finalizar compra
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Formularios */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Dirección de envío */}
                        <div>
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">ENVÍO</p>
                                    <h2
                                        className="text-lg font-light text-[#2a2826]"
                                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                                    >
                                        Dirección de envío
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="text-[10px] tracking-[.1em] text-[#b08070] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer font-light"
                                >
                                    {showAddressForm ? 'CANCELAR' : '+ NUEVA DIRECCIÓN'}
                                </button>
                            </div>

                            {showAddressForm && (
                                <form onSubmit={handleAddAddress} className="mb-6 p-6 bg-[#f4f0ec] border border-[#e4e0db]">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Calle y número"
                                            value={newAddress.street}
                                            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                            className="col-span-2 px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Ciudad"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                            className="px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Estado"
                                            value={newAddress.state}
                                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                            className="px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Código postal"
                                            value={newAddress.zip_code}
                                            onChange={(e) => setNewAddress({...newAddress, zip_code: e.target.value})}
                                            className="px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="País (MX)"
                                            value={newAddress.country}
                                            onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                                            className="px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                            maxLength="2"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="mt-5 bg-[#2a2826] text-[#f4f0ec] px-6 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity"
                                    >
                                        GUARDAR DIRECCIÓN
                                    </button>
                                </form>
                            )}

                            {addresses.length === 0 ? (
                                <p className="text-[12px] text-[#7a7672] font-light">
                                    No tienes direcciones guardadas. Agrega una nueva dirección.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((address) => (
                                        <label
                                            key={address.id}
                                            className={`flex items-start gap-4 p-5 border cursor-pointer transition-colors ${
                                                selectedAddress === address.id
                                                    ? 'border-[#2a2826] bg-white'
                                                    : 'border-[#e4e0db] bg-white hover:bg-[#f4f0ec]'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                value={address.id}
                                                checked={selectedAddress === address.id}
                                                onChange={() => setSelectedAddress(address.id)}
                                                className="mt-1 accent-[#2a2826]"
                                            />
                                            <div>
                                                <p className="text-sm font-normal text-[#2a2826]">
                                                    {address.street}
                                                </p>
                                                <p className="text-[11px] text-[#7a7672] font-light mt-1">
                                                    {address.city}, {address.state} {address.zip_code}
                                                </p>
                                                <p className="text-[11px] text-[#7a7672] font-light">
                                                    {address.country}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cupón */}
                        <div className="border-t border-[#e4e0db] pt-8">
                            <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">DESCUENTO</p>
                            <h2
                                className="text-lg font-light text-[#2a2826] mb-5"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                            >
                                Cupón de descuento
                            </h2>
                            <div className="flex gap-0">
                                <input
                                    type="text"
                                    placeholder="Código de cupón"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 px-4 py-3 border border-[#e4e0db] border-r-0 text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors tracking-widest"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="bg-[#2a2826] text-[#f4f0ec] px-6 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity"
                                >
                                    APLICAR
                                </button>
                            </div>
                            {appliedCoupon && (
                                <p className="mt-3 text-[11px] text-[#3a6030] font-light tracking-wide">
                                    ✓ Cupón "{appliedCoupon.code}" aplicado correctamente
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#f4f0ec] p-8 sticky top-24">
                            <h2
                                className="text-xl font-light text-[#2a2826] mb-6"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                            >
                                Resumen del pedido
                            </h2>

                            {/* Items */}
                            <div className="space-y-3 mb-6 border-b border-[#e4e0db] pb-6">
                                {cart.map((item) => (
                                    <div key={item.product.id} className="flex justify-between">
                                        <span className="text-[11px] text-[#7a7672] font-light">
                                            {item.product.name} ×{item.quantity}
                                        </span>
                                        <span className="text-[11px] text-[#2a2826] font-light">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totales */}
                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between">
                                    <span className="text-[12px] text-[#7a7672] font-light">Subtotal</span>
                                    <span className="text-[12px] text-[#7a7672] font-light">${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b border-[#e4e0db] pb-3">
                                    <span className="text-[12px] text-[#7a7672] font-light">Envío</span>
                                    <span className="text-[12px] text-[#3a6030] font-light">Gratis</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between">
                                        <span className="text-[12px] text-[#3a6030] font-light">Descuento</span>
                                        <span className="text-[12px] text-[#3a6030] font-light">-${calculateDiscount().toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-1">
                                    <span className="text-sm text-[#2a2826] font-normal">Total</span>
                                    <span className="text-sm text-[#2a2826] font-normal">${getFinalTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || !selectedAddress}
                                className="w-full bg-[#2a2826] text-[#f4f0ec] py-3 text-[11px] tracking-[.16em] font-light hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {loading ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO'}
                            </button>

                            <p className="mt-4 text-center text-[10px] text-[#7a7672] font-light tracking-wide">
                                🔒 Pago 100% seguro
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}