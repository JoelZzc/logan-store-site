import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, requestReturn } from '../services/api';
import Navbar from '../components/Navbar';

const STATUS_LABELS = {
    pending:   { label: 'Pendiente',  color: 'bg-[#f5e8e0] text-[#b08070]' },
    paid:      { label: 'Pagado',     color: 'bg-[#e8f0f8] text-[#1a5070]' },
    shipped:   { label: 'Enviado',    color: 'bg-[#e8eaf8] text-[#3a3a90]' },
    delivered: { label: 'Entregado',  color: 'bg-[#e8f0e4] text-[#3a6030]' },
    cancelled: { label: 'Cancelado',  color: 'bg-[#fde0d8] text-[#8a3a2a]' },
};

export default function Orders() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returnOrderId, setReturnOrderId] = useState(null);
    const [returnReason, setReturnReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        loadOrders();
    }, [user]);

    const loadOrders = async () => {
        try {
            const res = await getOrders();
            console.log('Orders response:', res.data);
            setOrders(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (error) {
            console.error('Error cargando pedidos:', error);
        }
        setLoading(false);
    };

    const handleRequestReturn = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await requestReturn(returnOrderId, { reason: returnReason });
            alert('Solicitud de devolución enviada correctamente');
            setReturnOrderId(null);
            setReturnReason('');
            loadOrders();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al solicitar devolución');
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#f9f7f5]">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-10">
                <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">MI CUENTA</p>
                <h1 className="text-3xl font-light text-[#2a2826] mb-8"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    Mis Pedidos
                </h1>

                {loading ? (
                    <p className="text-[#7a7672] text-sm tracking-widest text-center py-16">CARGANDO...</p>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-[#7a7672] text-sm mb-4">No tienes pedidos aún</p>
                        <button onClick={() => navigate('/products')}
                            className="bg-[#2a2826] text-[#f4f0ec] px-6 py-3 text-[10px] tracking-[.14em] hover:opacity-80 transition-opacity">
                            VER PRODUCTOS
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white border border-[#e4e0db]">
                                {/* Header del pedido */}
                                <div className="flex justify-between items-center px-6 py-4 border-b border-[#e4e0db]">
                                    <div className="flex items-center gap-6">
                                        <span className="text-[11px] text-[#7a7672]">#{order.id}</span>
                                        <span className="text-[11px] text-[#7a7672]">
                                            {new Date(order.created_at).toLocaleDateString('es-MX')}
                                        </span>
                                        <span className={`text-[9px] tracking-widest px-3 py-1 ${STATUS_LABELS[order.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                            {STATUS_LABELS[order.status]?.label || order.status}
                                        </span>
                                    </div>
                                    <span className="text-[14px] font-light text-[#2a2826]">
                                        ${parseFloat(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Productos */}
                                <div className="px-6 py-4">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between text-[12px] text-[#7a7672] font-light py-1">
                                            <span>{item.product?.name || 'Producto'} × {item.quantity}</span>
                                            <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Dirección y envío */}
                                {(order.address || order.shipment) && (
                                    <div className="px-6 py-3 bg-[#f9f7f5] border-t border-[#e4e0db] text-[11px] text-[#7a7672] font-light flex gap-8">
                                        {order.address && (
                                            <span>📍 {order.address.street}, {order.address.city}</span>
                                        )}
                                        {order.shipment && (
                                            <span>📦 {order.shipment.carrier}
                                                {order.shipment.tracking_number && ` · ${order.shipment.tracking_number}`}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Devolución */}
                                <div className="px-6 py-3 border-t border-[#e4e0db] flex justify-between items-center">
                                    {order.order_return ? (
                                        <div className="text-[11px] text-[#7a7672] font-light">
                                            Devolución: <span className={`px-2 py-0.5 text-[9px] tracking-widest ${
                                                order.order_return.status === 'approved' ? 'bg-[#e8f0e4] text-[#3a6030]' :
                                                order.order_return.status === 'rejected' ? 'bg-[#fde0d8] text-[#8a3a2a]' :
                                                'bg-[#f5e8e0] text-[#b08070]'
                                            }`}>
                                                {order.order_return.status === 'requested' ? 'SOLICITADA' :
                                                 order.order_return.status === 'approved' ? 'APROBADA' : 'RECHAZADA'}
                                            </span>
                                            {order.order_return.admin_notes && (
                                                <span className="ml-3 italic">"{order.order_return.admin_notes}"</span>
                                            )}
                                        </div>
                                    ) : (
                                        ['delivered', 'paid', 'shipped'].includes(order.status) ? (
                                            <button
                                                onClick={() => setReturnOrderId(order.id)}
                                                className="text-[10px] tracking-[.1em] text-[#7a7672] hover:text-[#2a2826] transition-colors border border-[#e4e0db] px-4 py-2 hover:border-[#2a2826]"
                                            >
                                                SOLICITAR DEVOLUCIÓN
                                            </button>
                                        ) : <span />
                                    )}
                                </div>

                                {/* Formulario de devolución */}
                                {returnOrderId === order.id && (
                                    <form onSubmit={handleRequestReturn} className="px-6 py-4 bg-[#f4f0ec] border-t border-[#e4e0db]">
                                        <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-3">MOTIVO DE DEVOLUCIÓN</p>
                                        <textarea
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            placeholder="Describe el motivo de tu devolución (mínimo 10 caracteres)..."
                                            className="w-full px-4 py-3 border border-[#e4e0db] text-[12px] text-[#2a2826] font-light bg-white focus:outline-none focus:border-[#7a7672] resize-none"
                                            rows="3"
                                            required
                                            minLength={10}
                                        />
                                        <div className="flex gap-3 mt-3">
                                            <button type="submit" disabled={submitting}
                                                className="bg-[#2a2826] text-[#f4f0ec] px-6 py-2 text-[10px] tracking-[.12em] hover:opacity-80 transition-opacity disabled:opacity-50">
                                                {submitting ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
                                            </button>
                                            <button type="button" onClick={() => { setReturnOrderId(null); setReturnReason(''); }}
                                                className="border border-[#e4e0db] text-[#7a7672] px-6 py-2 text-[10px] tracking-[.12em] hover:bg-white transition-colors">
                                                CANCELAR
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
