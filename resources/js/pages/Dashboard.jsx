import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSalesReport } from '../services/api';
import Navbar from '../components/Navbar';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const PERIODS = [
    { key: 'day',   label: 'HOY' },
    { key: 'week',  label: 'SEMANA' },
    { key: 'month', label: 'MES' },
    { key: 'year',  label: 'AÑO' },
];

const STATUS_LABELS = {
    pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-800' },
    paid:      { label: 'Pagado',     color: 'bg-blue-100 text-blue-800' },
    shipped:   { label: 'Enviado',    color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Entregado',  color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelado',  color: 'bg-red-100 text-red-800' },
};

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [period, setPeriod] = useState('month');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadReport = useCallback(async () => {
        try {
            const res = await getSalesReport(period);
            setData(res.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error cargando reporte:', error);
        }
        setLoading(false);
    }, [period]);

    // Cargar al montar y cuando cambia el período
    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        setLoading(true);
        loadReport();
    }, [period, user]);

    // Auto-refresh cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            loadReport();
        }, 30000);
        return () => clearInterval(interval);
    }, [loadReport]);

    // Formatear datos para la gráfica
    const chartData = data?.sales_by_day?.map(item => ({
        date: new Date(item.date + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
        ventas: parseFloat(item.sales),
        pedidos: item.orders,
    })) || [];

    return (
        <div className="min-h-screen bg-[#f9f7f5]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <p className="text-[9px] tracking-[.2em] text-[#b08070] mb-1">ADMINISTRACIÓN</p>
                        <h1 className="text-3xl font-light text-[#2a2826]"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                            Dashboard de Ventas
                        </h1>
                        <p className="text-[11px] text-[#7a7672] mt-1 font-light">
                            Responsable: <span className="text-[#2a2826]">{user?.name}</span>
                            {lastUpdated && (
                                <span className="ml-4">
                                    · Actualizado: {lastUpdated.toLocaleTimeString('es-MX')}
                                    <span className="ml-2 text-[#b08070]">(auto-refresh 30s)</span>
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Botón refresh manual */}
                    <button
                        onClick={loadReport}
                        className="border border-[#e4e0db] text-[#7a7672] px-5 py-2 text-[10px] tracking-[.12em] hover:bg-white transition-colors"
                    >
                        ↻ ACTUALIZAR
                    </button>
                </div>

                {/* Filtros de período */}
                <div className="flex gap-2 mb-8">
                    {PERIODS.map(p => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-6 py-2 text-[10px] tracking-[.14em] transition-all ${
                                period === p.key
                                    ? 'bg-[#2a2826] text-[#f4f0ec]'
                                    : 'border border-[#e4e0db] text-[#7a7672] hover:bg-white'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                    {data && (
                        <span className="ml-auto text-[10px] text-[#7a7672] self-center">
                            Desde {data.start_date}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-24">
                        <p className="text-[#7a7672] text-sm tracking-widest">CARGANDO...</p>
                    </div>
                ) : (
                    <>
                        {/* Tarjetas de métricas */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {/* Total ventas */}
                            <div className="bg-white border border-[#e4e0db] p-6">
                                <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-3">TOTAL VENTAS</p>
                                <p className="text-3xl font-light text-[#2a2826]">
                                    ${parseFloat(data?.total_sales || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Número de pedidos */}
                            <div className="bg-white border border-[#e4e0db] p-6">
                                <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-3">PEDIDOS</p>
                                <p className="text-3xl font-light text-[#2a2826]">
                                    {data?.total_orders || 0}
                                </p>
                            </div>

                            {/* Producto más vendido */}
                            <div className="bg-white border border-[#e4e0db] p-6">
                                <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-3">PRODUCTO TOP</p>
                                {data?.top_product ? (
                                    <>
                                        <p className="text-sm font-normal text-[#2a2826] leading-tight">
                                            {data.top_product.name}
                                        </p>
                                        <p className="text-[10px] text-[#7a7672] mt-1">
                                            {data.top_product.total_sold} unidades
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-[#7a7672]">Sin datos</p>
                                )}
                            </div>

                            {/* Alertas de stock */}
                            <div className={`border p-6 ${
                                data?.stock_alerts > 0
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-white border-[#e4e0db]'
                            }`}>
                                <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-3">ALERTAS STOCK</p>
                                <p className={`text-3xl font-light ${
                                    data?.stock_alerts > 0 ? 'text-orange-600' : 'text-[#2a2826]'
                                }`}>
                                    {data?.stock_alerts || 0}
                                </p>
                                {data?.stock_alerts > 0 && (
                                    <p className="text-[10px] text-orange-600 mt-1">
                                        ⚠ productos con stock bajo
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Gráfica de ventas por día */}
                        <div className="bg-white border border-[#e4e0db] p-6 mb-8">
                            <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-1">VISUALIZACIÓN</p>
                            <h2 className="text-xl font-light text-[#2a2826] mb-6"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Ventas por Día
                            </h2>

                            {chartData.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-[#7a7672] text-sm">No hay ventas en este período</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e0db" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: '#7a7672' }}
                                            axisLine={{ stroke: '#e4e0db' }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#7a7672' }}
                                            axisLine={{ stroke: '#e4e0db' }}
                                            tickFormatter={(v) => `$${v.toLocaleString()}`}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`$${parseFloat(value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Ventas']}
                                            contentStyle={{ fontSize: 11, border: '1px solid #e4e0db', borderRadius: 0 }}
                                        />
                                        <Bar dataKey="ventas" fill="#b08070" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Pedidos recientes */}
                        <div className="bg-white border border-[#e4e0db] p-6">
                            <p className="text-[9px] tracking-[.16em] text-[#b08070] mb-1">ACTIVIDAD</p>
                            <h2 className="text-xl font-light text-[#2a2826] mb-6"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Pedidos Recientes
                            </h2>

                            {data?.recent_orders?.length === 0 ? (
                                <p className="text-[#7a7672] text-sm text-center py-8">No hay pedidos en este período</p>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#e4e0db]">
                                            <th className="pb-3 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">#</th>
                                            <th className="pb-3 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">CLIENTE</th>
                                            <th className="pb-3 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">TOTAL</th>
                                            <th className="pb-3 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">ESTADO</th>
                                            <th className="pb-3 text-left text-[9px] tracking-[.14em] text-[#b08070] font-normal">FECHA</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e4e0db]">
                                        {data.recent_orders.map(order => (
                                            <tr key={order.id} className="hover:bg-[#f9f7f5] transition-colors">
                                                <td className="py-3 text-[11px] text-[#7a7672]">#{order.id}</td>
                                                <td className="py-3 text-[12px] text-[#2a2826]">{order.user}</td>
                                                <td className="py-3 text-[12px] text-[#2a2826]">
                                                    ${parseFloat(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`text-[9px] tracking-widest px-2 py-1 ${STATUS_LABELS[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                                                        {STATUS_LABELS[order.status]?.label || order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-[11px] text-[#7a7672]">{order.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
