import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAddresses, createAddress, createOrder, applyCoupon, getSavedCards, deleteSavedCard } from '../services/api';
import Navbar from '../components/Navbar';

const formatCardNumber = (value) => {
    const clean = value.replace(/\D/g, '');
    const match = clean.match(/.{1,4}/g);
    return match ? match.slice(0, 4).join('-') : clean;
};

const getCardBrandName = (number) => {
    const clean = number.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean) || /^2(22[1-9]|2[3-9]|[3-6]|7[0-1]|720)/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
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

    const [savedCards, setSavedCards] = useState([]);
    const [selectedSavedCard, setSelectedSavedCard] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'card'
    const [newCard, setNewCard] = useState({
        cardholder_name: '',
        card_number: '',
        expiry_date: '',
        cvv: '',
    });

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
        loadSavedCards();
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

    const loadSavedCards = async () => {
        try {
            const response = await getSavedCards();
            const cardsList = response.data.data || response.data;
            setSavedCards(cardsList);

            if (cardsList.length > 0) {
                setSelectedSavedCard(cardsList[0].id);
            } else {
                setSelectedSavedCard('new');
            }
        } catch (error) {
            console.error('Error cargando tarjetas guardadas:', error);
        }
    };

    const handleDeleteCard = async (id, e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) return;
        try {
            await deleteSavedCard(id);
            loadSavedCards();
        } catch (error) {
            console.error('Error al eliminar la tarjeta:', error);
            alert('No se pudo eliminar la tarjeta');
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
        return Number(appliedCoupon.discount_value);
    };

    const getFinalTotal = () => {
        return getTotal() - calculateDiscount();
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Selecciona una dirección de envío');
            return;
        }

        // Validación de campos de tarjeta
        if (paymentMethod === 'card') {
            if (selectedSavedCard === 'new') {
                if (!newCard.cardholder_name.trim()) {
                    alert('Por favor ingresa el nombre del titular de la tarjeta.');
                    return;
                }
                const cleanNum = newCard.card_number.replace(/\D/g, '');
                if (cleanNum.length !== 16) {
                    alert('El número de tarjeta debe tener 16 dígitos.');
                    return;
                }
                if (!newCard.expiry_date.match(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)) {
                    alert('La fecha de vencimiento debe tener el formato MM/YY.');
                    return;
                }
                if (newCard.cvv.length < 3 || newCard.cvv.length > 4) {
                    alert('El CVV debe tener 3 o 4 dígitos.');
                    return;
                }
            } else if (!selectedSavedCard) {
                alert('Selecciona una tarjeta guardada o agrega una nueva.');
                return;
            }
        }

        setLoading(true);

        try {
            const orderData = {
                address_id:  selectedAddress,
                coupon_code: appliedCoupon ? appliedCoupon.code : null,
                payment_method: paymentMethod,
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity:   item.quantity,
                })),
            };

            if (paymentMethod === 'card') {
                if (selectedSavedCard !== 'new') {
                    orderData.saved_card_id = selectedSavedCard;
                } else {
                    orderData.cardholder_name = newCard.cardholder_name;
                    orderData.card_number = newCard.card_number;
                    orderData.expiry_date = newCard.expiry_date;
                    orderData.cvv = newCard.cvv;
                }
            }

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

                        {/* Método de Pago */}
                        <div className="border-t border-[#e4e0db] pt-8">
                            <p className="text-[9px] tracking-[.18em] text-[#b08070] mb-1">MÉTODO DE PAGO</p>
                            <h2
                                className="text-lg font-light text-[#2a2826] mb-5"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                            >
                                Selecciona cómo pagar
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <label
                                    className={`flex items-center gap-3 p-5 border cursor-pointer transition-colors ${
                                        paymentMethod === 'cash'
                                            ? 'border-[#2a2826] bg-white'
                                            : 'border-[#e4e0db] bg-white hover:bg-[#f4f0ec]'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={paymentMethod === 'cash'}
                                        onChange={() => setPaymentMethod('cash')}
                                        className="accent-[#2a2826]"
                                    />
                                    <div>
                                        <p className="text-sm font-normal text-[#2a2826]">Efectivo</p>
                                        <p className="text-[10px] text-[#7a7672] font-light mt-0.5">Paga al recibir tu pedido</p>
                                    </div>
                                </label>
                                <label
                                    className={`flex items-center gap-3 p-5 border cursor-pointer transition-colors ${
                                        paymentMethod === 'card'
                                            ? 'border-[#2a2826] bg-white'
                                            : 'border-[#e4e0db] bg-white hover:bg-[#f4f0ec]'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                        className="accent-[#2a2826]"
                                    />
                                    <div>
                                        <p className="text-sm font-normal text-[#2a2826]">Tarjeta</p>
                                        <p className="text-[10px] text-[#7a7672] font-light mt-0.5">Crédito o Débito</p>
                                    </div>
                                </label>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="p-5 bg-[#f4f0ec] border border-[#e4e0db] text-xs text-[#7a7672] font-light mb-6 leading-relaxed">
                                    Pago en efectivo al momento de la entrega. Asegúrate de contar con el monto exacto para facilitar la entrega con el transportista.
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="space-y-6 mb-6">
                                    {savedCards.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-[10px] tracking-[.1em] text-[#7a7672] font-light uppercase">Tus tarjetas guardadas</p>
                                            {savedCards.map((card) => (
                                                <label
                                                    key={card.id}
                                                    className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                                                        selectedSavedCard === card.id
                                                            ? 'border-[#2a2826] bg-white'
                                                            : 'border-[#e4e0db] bg-white hover:bg-[#f4f0ec]'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name="savedCard"
                                                            value={card.id}
                                                            checked={selectedSavedCard === card.id}
                                                            onChange={() => setSelectedSavedCard(card.id)}
                                                            className="accent-[#2a2826]"
                                                        />
                                                         <div className="text-xs">
                                                             <p className="font-normal text-[#2a2826] capitalize">
                                                                 💳 {card.brand || 'Tarjeta'} •••• {card.last_four}
                                                             </p>
                                                            <p className="text-[10px] text-[#7a7672] font-light mt-0.5">
                                                                {card.cardholder_name} · Exp: {String(card.expiry_month).padStart(2, '0')}/{String(card.expiry_year).slice(-2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDeleteCard(card.id, e)}
                                                        className="text-[10px] text-[#b08070] hover:text-[#8a3a2a] bg-transparent border-none cursor-pointer tracking-wider"
                                                    >
                                                        ELIMINAR
                                                    </button>
                                                </label>
                                            ))}
                                            <label
                                                className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                                                    selectedSavedCard === 'new'
                                                        ? 'border-[#2a2826] bg-white'
                                                        : 'border-[#e4e0db] bg-white hover:bg-[#f4f0ec]'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="savedCard"
                                                    value="new"
                                                    checked={selectedSavedCard === 'new'}
                                                    onChange={() => setSelectedSavedCard('new')}
                                                    className="accent-[#2a2826]"
                                                />
                                                <span className="text-xs text-[#2a2826] font-light">+ Usar otra tarjeta</span>
                                            </label>
                                        </div>
                                    )}

                                    {(savedCards.length === 0 || selectedSavedCard === 'new') && (
                                        <div className="p-6 bg-[#f4f0ec] border border-[#e4e0db] space-y-4">
                                            <p className="text-[10px] tracking-[.1em] text-[#b08070] font-light uppercase">Nueva Tarjeta</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre en la tarjeta"
                                                    value={newCard.cardholder_name}
                                                    onChange={(e) => setNewCard({...newCard, cardholder_name: e.target.value})}
                                                    className="col-span-2 px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                                    required
                                                />
                                                <div className="col-span-2 relative">
                                                    <input
                                                        type="text"
                                                        maxLength="19"
                                                        placeholder="Número de tarjeta (xxxx-xxxx-xxxx-xxxx)"
                                                        value={newCard.card_number}
                                                        onChange={(e) => {
                                                            const formatted = formatCardNumber(e.target.value);
                                                            setNewCard({...newCard, card_number: formatted});
                                                        }}
                                                        className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors pr-16"
                                                        required
                                                    />
                                                    {getCardBrandName(newCard.card_number) && (
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] tracking-wider text-[#b08070] uppercase font-light pointer-events-none">
                                                            {getCardBrandName(newCard.card_number)}
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Vencimiento (MM/YY)"
                                                    maxLength="5"
                                                    value={newCard.expiry_date}
                                                    onChange={(e) => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (val.length > 2) {
                                                            val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                        }
                                                        setNewCard({...newCard, expiry_date: val});
                                                    }}
                                                    className="px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                                    required
                                                />
                                                <input
                                                    type="password"
                                                    maxLength="4"
                                                    placeholder="CVV"
                                                    value={newCard.cvv}
                                                    onChange={(e) => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g, '')})}
                                                    className="px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}
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