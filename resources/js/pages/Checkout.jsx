import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAddresses, createAddress, createOrder, applyCoupon } from '../services/api';
import Navbar from '../components/Navbar';

const formatCardNumber = (value) => {
    const clean = value.replace(/\D/g, '');
    const match = clean.match(/.{1,4}/g);
    return match ? match.slice(0, 4).join('-') : clean;
};

const getCardBrand = (number) => {
    const clean = number.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean) || /^2(22[1-9]|2[3-9]|[3-6]|7[0-1]|720)/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    return '';
};

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
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cardErrors, setCardErrors] = useState({});

    const [card, setCard] = useState({
        cardholder_name: '',
        card_number: '',
        expiry_date: '',
        cvv: '',
    });

    const [newAddress, setNewAddress] = useState({
        street: '', city: '', state: '', zip_code: '', country: 'MX', is_default: false,
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (cart.length === 0) { navigate('/cart'); return; }
        loadAddresses();
    }, [user, cart]);

    const loadAddresses = async () => {
        try {
            const response = await getAddresses();
            const list = response.data.data || response.data;
            setAddresses(list);
            if (list.length > 0) setSelectedAddress(list[0].id);
        } catch (error) {
            console.error('Error cargando direcciones:', error);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await createAddress(newAddress);
            setNewAddress({ street: '', city: '', state: '', zip_code: '', country: 'MX', is_default: false });
            setShowAddressForm(false);
            loadAddresses();
        } catch (error) {
            alert('Error al guardar la dirección');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) { alert('Ingresa un código de cupón'); return; }
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
            return (subtotal * Number(appliedCoupon.discount_value)) / 100;
        }
        return Number(appliedCoupon.discount_value);
    };

    const getFinalTotal = () => Math.max(0, getTotal() - calculateDiscount());

    // Validación de tarjeta
    const validateCard = () => {
        const errors = {};
        if (!card.cardholder_name.trim()) {
            errors.cardholder_name = 'Ingresa el nombre del titular';
        }
        const cleanNum = card.card_number.replace(/\D/g, '');
        if (cleanNum.length !== 16) {
            errors.card_number = 'El número de tarjeta debe tener 16 dígitos';
        }
        if (!card.expiry_date.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
            errors.expiry_date = 'Formato inválido (MM/YY)';
        } else {
            const [month, year] = card.expiry_date.split('/');
            const now = new Date();
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            if (expiry < now) {
                errors.expiry_date = 'La tarjeta está vencida';
            }
        }
        if (card.cvv.length < 3 || card.cvv.length > 4) {
            errors.cvv = 'CVV inválido (3-4 dígitos)';
        }
        setCardErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Selecciona una dirección de envío');
            return;
        }
        if (paymentMethod === 'card' && !validateCard()) {
            return;
        }

        // Validar stock antes de enviar
        for (const item of cart) {
            if (item.quantity > item.product.stock) {
                alert(`Stock insuficiente para "${item.product.name}". Solo hay ${item.product.stock} unidades disponibles.`);
                return;
            }
        }

        setLoading(true);
        try {
            const orderData = {
                address_id:     selectedAddress,
                coupon_code:    appliedCoupon ? appliedCoupon.code : null,
                payment_method: paymentMethod,
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity:   item.quantity,
                })),
            };

            const response = await createOrder(orderData);
            clearCart();
            navigate('/order-confirmation', { state: { order: response.data } });
        } catch (error) {
            const msg = error.response?.data?.message || 'Error al procesar el pedido';
            alert(msg);
        }
        setLoading(false);
    };

    const inputCls = "w-full px-4 py-3 border text-[#2a2826] text-sm font-light bg-white focus:outline-none transition-colors";

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-10 py-10">
                <div className="mb-10 border-b border-[#e4e0db] pb-6">
                    <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">PAGO</p>
                    <h1 className="text-2xl font-light text-[#2a2826]"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        Finalizar compra
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">

                        {/* Dirección */}
                        <div>
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">ENVÍO</p>
                                    <h2 className="text-lg font-light text-[#2a2826]"
                                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                        Dirección de envío
                                    </h2>
                                </div>
                                <button onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="text-[10px] tracking-[.1em] text-[#b08070] hover:text-[#2a2826] transition-colors bg-transparent border-none cursor-pointer font-light">
                                    {showAddressForm ? 'CANCELAR' : '+ NUEVA DIRECCIÓN'}
                                </button>
                            </div>

                            {showAddressForm && (
                                <form onSubmit={handleAddAddress} className="mb-6 p-6 bg-[#f4f0ec] border border-[#e4e0db]">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Calle y número" value={newAddress.street}
                                            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                            className={`col-span-2 ${inputCls} border-[#e4e0db] focus:border-[#7a7672]`} required />
                                        <input type="text" placeholder="Ciudad" value={newAddress.city}
                                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                            className={`${inputCls} border-[#e4e0db] focus:border-[#7a7672]`} required />
                                        <input type="text" placeholder="Estado" value={newAddress.state}
                                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                            className={`${inputCls} border-[#e4e0db] focus:border-[#7a7672]`} required />
                                        <input type="text" placeholder="Código postal" value={newAddress.zip_code}
                                            onChange={(e) => setNewAddress({...newAddress, zip_code: e.target.value})}
                                            className={`${inputCls} border-[#e4e0db] focus:border-[#7a7672]`} required />
                                        <input type="text" placeholder="País (MX)" value={newAddress.country} maxLength="2"
                                            onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                                            className={`${inputCls} border-[#e4e0db] focus:border-[#7a7672]`} required />
                                    </div>
                                    <button type="submit"
                                        className="mt-5 bg-[#2a2826] text-[#f4f0ec] px-6 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity">
                                        GUARDAR DIRECCIÓN
                                    </button>
                                </form>
                            )}

                            {addresses.length === 0 ? (
                                <p className="text-[12px] text-[#7a7672] font-light">No tienes direcciones guardadas. Agrega una nueva.</p>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((address) => (
                                        <label key={address.id}
                                            className={`flex items-start gap-4 p-5 border cursor-pointer transition-colors ${
                                                selectedAddress === address.id ? 'border-[#2a2826] bg-white' : 'border-[#e4e0db] bg-white hover:bg-[#f4f0ec]'
                                            }`}>
                                            <input type="radio" name="address" value={address.id}
                                                checked={selectedAddress === address.id}
                                                onChange={() => setSelectedAddress(address.id)}
                                                className="mt-1 accent-[#2a2826]" />
                                            <div>
                                                <p className="text-sm font-normal text-[#2a2826]">{address.street}</p>
                                                <p className="text-[11px] text-[#7a7672] font-light mt-1">
                                                    {address.city}, {address.state} {address.zip_code}
                                                </p>
                                                <p className="text-[11px] text-[#7a7672] font-light">{address.country}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Método de pago */}
                        <div className="border-t border-[#e4e0db] pt-8">
                            <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">MÉTODO DE PAGO</p>
                            <h2 className="text-lg font-light text-[#2a2826] mb-5"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Selecciona cómo pagar
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {[
                                    { value: 'cash', label: 'Efectivo', sub: 'Paga al recibir tu pedido' },
                                    { value: 'card', label: 'Tarjeta', sub: 'Crédito o Débito' },
                                ].map(opt => (
                                    <label key={opt.value}
                                        className={`flex items-center gap-3 p-5 border cursor-pointer transition-colors ${
                                            paymentMethod === opt.value ? 'border-[#2a2826] bg-white' : 'border-[#e4e0db] bg-white hover:bg-[#f4f0ec]'
                                        }`}>
                                        <input type="radio" name="paymentMethod" value={opt.value}
                                            checked={paymentMethod === opt.value}
                                            onChange={() => { setPaymentMethod(opt.value); setCardErrors({}); }}
                                            className="accent-[#2a2826]" />
                                        <div>
                                            <p className="text-sm font-normal text-[#2a2826]">{opt.label}</p>
                                            <p className="text-[10px] text-[#7a7672] font-light mt-0.5">{opt.sub}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="p-5 bg-[#f4f0ec] border border-[#e4e0db] text-xs text-[#7a7672] font-light leading-relaxed">
                                    Pago en efectivo al momento de la entrega. Asegúrate de contar con el monto exacto.
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="p-6 bg-[#f4f0ec] border border-[#e4e0db] space-y-4">
                                    <p className="text-[10px] tracking-[.1em] text-[#b08070] font-light uppercase">Datos de la tarjeta</p>

                                    {/* Nombre */}
                                    <div>
                                        <input type="text" placeholder="Nombre en la tarjeta"
                                            value={card.cardholder_name}
                                            onChange={(e) => setCard({...card, cardholder_name: e.target.value})}
                                            className={`${inputCls} ${cardErrors.cardholder_name ? 'border-red-400' : 'border-[#e4e0db] focus:border-[#7a7672]'}`} />
                                        {cardErrors.cardholder_name && (
                                            <p className="text-[10px] text-red-500 mt-1">{cardErrors.cardholder_name}</p>
                                        )}
                                    </div>

                                    {/* Número */}
                                    <div className="relative">
                                        <input type="text" maxLength="19"
                                            placeholder="Número de tarjeta (xxxx-xxxx-xxxx-xxxx)"
                                            value={card.card_number}
                                            onChange={(e) => setCard({...card, card_number: formatCardNumber(e.target.value)})}
                                            className={`${inputCls} pr-16 ${cardErrors.card_number ? 'border-red-400' : 'border-[#e4e0db] focus:border-[#7a7672]'}`} />
                                        {getCardBrand(card.card_number) && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] tracking-wider text-[#b08070] uppercase font-light pointer-events-none">
                                                {getCardBrand(card.card_number)}
                                            </span>
                                        )}
                                        {cardErrors.card_number && (
                                            <p className="text-[10px] text-red-500 mt-1">{cardErrors.card_number}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Vencimiento */}
                                        <div>
                                            <input type="text" placeholder="Vencimiento (MM/YY)" maxLength="5"
                                                value={card.expiry_date}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                    setCard({...card, expiry_date: val});
                                                }}
                                                className={`${inputCls} ${cardErrors.expiry_date ? 'border-red-400' : 'border-[#e4e0db] focus:border-[#7a7672]'}`} />
                                            {cardErrors.expiry_date && (
                                                <p className="text-[10px] text-red-500 mt-1">{cardErrors.expiry_date}</p>
                                            )}
                                        </div>

                                        {/* CVV */}
                                        <div>
                                            <input type="password" maxLength="4" placeholder="CVV"
                                                value={card.cvv}
                                                onChange={(e) => setCard({...card, cvv: e.target.value.replace(/\D/g, '')})}
                                                className={`${inputCls} ${cardErrors.cvv ? 'border-red-400' : 'border-[#e4e0db] focus:border-[#7a7672]'}`} />
                                            {cardErrors.cvv && (
                                                <p className="text-[10px] text-red-500 mt-1">{cardErrors.cvv}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cupón */}
                        <div className="border-t border-[#e4e0db] pt-8">
                            <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">DESCUENTO</p>
                            <h2 className="text-lg font-light text-[#2a2826] mb-5"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Cupón de descuento
                            </h2>
                            <div className="flex gap-0">
                                <input type="text" placeholder="Código de cupón" value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className={`flex-1 ${inputCls} border-[#e4e0db] border-r-0 focus:border-[#7a7672] tracking-widest`} />
                                <button onClick={handleApplyCoupon}
                                    className="bg-[#2a2826] text-[#f4f0ec] px-6 py-3 text-[10px] tracking-[.14em] font-light hover:opacity-80 transition-opacity">
                                    APLICAR
                                </button>
                            </div>
                            {appliedCoupon && (
                                <p className="mt-3 text-[11px] text-[#3a6030] font-light tracking-wide">
                                    ✓ Cupón "{appliedCoupon.code}" aplicado
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#f4f0ec] p-8 sticky top-24">
                            <h2 className="text-xl font-light text-[#2a2826] mb-6"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Resumen del pedido
                            </h2>

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

                            <button onClick={handlePlaceOrder}
                                disabled={loading || !selectedAddress}
                                className="w-full bg-[#2a2826] text-[#f4f0ec] py-3 text-[11px] tracking-[.16em] font-light hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
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
