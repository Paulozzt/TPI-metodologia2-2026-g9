/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, MapPin, Award, Landmark, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';
import { Order, Product, Client } from '../types';

interface SalesReportsProps {
  orders: Order[];
  products: Product[];
  clients: Client[];
}

export default function SalesReports({ orders, products, clients }: SalesReportsProps) {
  // Only calculate report values based on completed/paid sales
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'paid'), [orders]);

  // Total Performance Indicators
  const kpis = useMemo(() => {
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalPurchasedQty = completedOrders.reduce((sum, o) => {
      return sum + o.items.reduce((acc, item) => acc + item.quantity, 0);
    }, 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const activeClientsCount = new Set(completedOrders.map(o => o.clientId)).size;

    return {
      totalRevenue,
      totalPurchasedQty,
      averageOrderValue,
      activeClientsCount
    };
  }, [completedOrders]);

  // Report 1: Historically Most Sold Products
  const topProducts = useMemo(() => {
    const counts: Record<string, { qty: number; revenue: number; name: string }> = {};

    // Initialize all existing catalog products to show baseline
    products.forEach(p => {
      counts[p.id] = { qty: 0, revenue: 0, name: p.name };
    });

    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!counts[item.productId]) {
          counts[item.productId] = { qty: 0, revenue: 0, name: item.productName };
        }
        counts[item.productId].qty += item.quantity;
        counts[item.productId].revenue += item.quantity * item.unitPrice;
      });
    });

    return Object.entries(counts)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.qty - a.qty);
  }, [completedOrders, products]);

  // Report 2: Geographic Zones (Regions) with Most Orders
  const regionalSales = useMemo(() => {
    const regions: Record<string, { orderCount: number; revenue: number }> = {};

    completedOrders.forEach(order => {
      const region = order.region || 'CABA - Buenos Aires';
      if (!regions[region]) {
        regions[region] = { orderCount: 0, revenue: 0 };
      }
      regions[region].orderCount += 1;
      regions[region].revenue += order.total;
    });

    return Object.entries(regions)
      .map(([regionName, stats]) => ({ regionName, ...stats }))
      .sort((a, b) => b.orderCount - a.orderCount);
  }, [completedOrders]);

  // Report 3: Top Ten ("Top Ten") Customers with Highest Purchases
  const topTenClients = useMemo(() => {
    const clientsSpend: Record<string, { name: string; email: string; orderCount: number; totalSpent: number }> = {};

    // Initialize with all clients to ensure we have ranking candidates
    clients.forEach(c => {
      clientsSpend[c.id] = { name: c.name, email: c.email, orderCount: 0, totalSpent: 0 };
    });

    completedOrders.forEach(order => {
      if (!clientsSpend[order.clientId]) {
        clientsSpend[order.clientId] = {
          name: order.clientName,
          email: order.clientEmail,
          orderCount: 0,
          totalSpent: 0
        };
      }
      clientsSpend[order.clientId].orderCount += 1;
      clientsSpend[order.clientId].totalSpent += order.total;
    });

    return Object.entries(clientsSpend)
      .map(([id, stats]) => ({ id, ...stats }))
      .filter(item => item.orderCount > 0) // only show clients that bought something
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }, [completedOrders, clients]);

  return (
    <div className="space-y-8" id="reports-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-black italic tracking-wide uppercase text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            Reportes y Análisis de Ventas
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-bold leading-relaxed max-w-2xl">
            Como vendedor, quiero ver estadísticas y reportes de ventas consolidados para analizar el desempeño comercial e identificar patrones geográficos y clientes más valiosos.
          </p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-3 border-slate-900 rounded-2xl p-4.5 transition-all hover:translate-y-[-1px] text-slate-800" style={{ boxShadow: '4px 4px 0px 0px var(--brand-accent)' }}>
          <div className="text-[10px] text-slate-550 uppercase font-black tracking-wider">
            Facturación Total
          </div>
          <div className="text-lg font-mono font-black text-slate-900 mt-1 flex items-baseline gap-1">
            ${kpiCalculatedValue(kpis.totalRevenue)}
            <span className="text-[10px] font-black text-emerald-600 font-sans">ARS</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-1">
            {completedOrders.length} compras aprobadas
          </div>
        </div>

        <div className="bg-white border-3 border-slate-900 rounded-2xl p-4.5 transition-all hover:translate-y-[-1px] text-slate-800" style={{ boxShadow: '4px 4px 0px 0px var(--brand-primary)' }}>
          <div className="text-[10px] text-slate-550 uppercase font-black tracking-wider">
            Productos Vendidos
          </div>
          <div className="text-lg font-mono font-black text-slate-900 mt-1">
            {kisCount(kpis.totalPurchasedQty)}
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-1">
            Unidades de pintura y kits
          </div>
        </div>

        <div className="bg-white border-3 border-slate-900 rounded-2xl p-4.5 transition-all hover:translate-y-[-1px] text-slate-800" style={{ boxShadow: '4px 4px 0px 0px var(--brand-secondary)' }}>
          <div className="text-[10px] text-slate-550 uppercase font-black tracking-wider">
            Pedido Promedio (AOV)
          </div>
          <div className="text-lg font-mono font-black text-slate-900 mt-1">
            ${kpiCalculatedValue(Math.round(kpis.averageOrderValue))}
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-1">
            Ticket de compra habitual
          </div>
        </div>

        <div className="bg-white border-3 border-slate-900 rounded-2xl p-4.5 transition-all hover:translate-y-[-1px] text-slate-800" style={{ boxShadow: '4px 4px 0px 0px var(--brand-violet)' }}>
          <div className="text-[10px] text-slate-550 uppercase font-black tracking-wider">
            Clientes Activos (Frecuencia)
          </div>
          <div className="text-lg font-mono font-black text-slate-900 mt-1">
            {kisCount(kpis.activeClientsCount)}
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-1">
            Compradores únicos en el período
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Report 1: Most Sold Products - Vertical Rank */}
        <div className="lg:col-span-6 bg-white border-3 border-slate-900 rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="border-b-2 border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-xs uppercase font-black text-slate-900 tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
              1. Productos Más Vendidos
            </h3>
            <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 border-2 border-slate-900 px-2 py-0.5 rounded-lg">
              Demanda u.
            </span>
          </div>

          <div className="space-y-4">
            {topProducts.slice(0, 6).map((product, idx) => {
              const maxVal = topProducts[0]?.qty || 1;
              const ratio = product.qty / maxVal;
              const isKit = product.name.includes('Kit');

              return (
                <div key={product.id} className="space-y-1.5 list-items text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 truncate pr-2" title={product.name}>
                      <span className="text-[10px] font-black text-slate-900 border-2 border-slate-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand-accent)' }}>
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-slate-900 truncate">{product.name}</span>
                      {isKit && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border-2 border-emerald-500 px-1.5 py-0.5 rounded font-black shrink-0 uppercase tracking-wider">
                          KIT
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-xs font-black text-slate-900">
                      {product.qty} u. <span className="text-slate-500 font-bold">(${product.revenue.toLocaleString()})</span>
                    </span>
                  </div>
                  {/* Custom progress bar representing scale with neobrutalist styling */}
                  <div className="w-full bg-slate-100 h-3 border-2 border-slate-900 rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isKit ? 'var(--brand-secondary)' : 'var(--brand-primary)' }}
                    />
                  </div>
                </div>
              );
            })}
            {topProducts.length === 0 || topProducts.every(p => p.qty === 0) ? (
              <div className="py-8 text-center text-slate-400 italic">
                Aún no existen ventas realizadas para calcular estadísticas de productos.
              </div>
            ) : null}
          </div>
        </div>

        {/* Report 2: Geographic Zones Map Pin Order Frequency */}
        <div className="lg:col-span-6 bg-white border-3 border-slate-900 rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="border-b-2 border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-xs uppercase font-black text-slate-900 tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              2. Zonas con Más Pedidos
            </h3>
            <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 border-2 border-slate-900 px-2 py-0.5 rounded-lg">
              Demografía
            </span>
          </div>

          <div className="space-y-4">
            {regionalSales.map((sales, idx) => {
              const maxOrders = regionalSales[0]?.orderCount || 1;
              const ratio = sales.orderCount / maxOrders;

              return (
                <div key={sales.regionName} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-2 truncate">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-900 shrink-0" style={{ backgroundColor: 'var(--brand-accent)' }} />
                      <span className="font-extrabold text-slate-900 truncate">{sales.regionName}</span>
                    </span>
                    <span className="font-mono text-xs font-black text-slate-900 shrink-0">
                      {sales.orderCount} {sales.orderCount === 1 ? 'pedido' : 'pedidos'}{' '}
                      <span className="text-slate-500 font-bold">(${sales.revenue.toLocaleString()})</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 border-2 border-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--brand-violet)' }}
                    />
                  </div>
                </div>
              );
            })}
            {regionalSales.length === 0 ? (
              <div className="py-8 text-center text-slate-400 italic">
                No hay ventas aprobadas para zonificación geográfica.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Report 3: Top Ten Customer Ranking - Leaderboard */}
      <div className="bg-white border-3 border-slate-900 rounded-2xl p-6 space-y-5" style={{ boxShadow: '8px 8px 0px 0px var(--brand-primary)' }}>
        <div className="border-b-2 border-slate-200 pb-3 flex items-center justify-between">
          <h3 className="text-xs uppercase font-black text-slate-900 tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            3. Ranking Top Ten de Clientes (Mayores Compras)
          </h3>
          <span className="text-[10px] font-black text-amber-850 bg-amber-50 border-2 border-amber-500 px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-550 animate-spin" /> Adquirentes VIP
          </span>
        </div>

        {/* Podium visualization for the top 3 clients */}
        {topTenClients.length >= 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* 2nd Place */}
            {topTenClients[1] && (
              <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-4.5 text-center flex flex-col justify-between items-center relative order-2 md:order-1">
                <div className="absolute top-3 left-3 w-8 h-8 bg-slate-200 text-slate-900 rounded-full font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  2°
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-slate-900">{topTenClients[1].name}</div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold">{topTenClients[1].email}</div>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-slate-200 w-full">
                  <div className="text-base font-mono font-black" style={{ color: 'var(--brand-violet)' }}>${topTenClients[1].totalSpent.toLocaleString()} ARS</div>
                  <div className="text-[10px] text-slate-500 font-bold">{topTenClients[1].orderCount} compras confirmadas</div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topTenClients[0] && (
              <div className="bg-amber-50 border-3 border-slate-900 rounded-3xl p-5 text-center flex flex-col justify-between items-center relative order-1 md:order-2 transform md:-translate-y-2" style={{ boxShadow: '4px 4px 0px 0px var(--brand-secondary)' }}>
                <div className="absolute top-3 right-3">
                  <Award className="w-6 h-6 text-amber-500 animate-bounce" />
                </div>
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white border-2 border-slate-900 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  CAMPEÓN DE COMPRAS
                </div>
                <div className="space-y-1.5 mt-2">
                  <div className="font-extrabold text-base text-slate-950">{topTenClients[0].name}</div>
                  <div className="text-[11px] text-slate-500 font-mono font-bold leading-normal">{topTenClients[0].email}</div>
                </div>
                <div className="mt-5 pt-3.5 border-t-2 border-slate-300 w-full">
                  <div className="text-xl font-mono font-black text-amber-800">${topTenClients[0].totalSpent.toLocaleString()} ARS</div>
                  <div className="text-[11px] text-amber-955 font-black">{topTenClients[0].orderCount} compras confirmadas</div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topTenClients[2] && (
              <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-4.5 text-center flex flex-col justify-between items-center relative order-3">
                <div className="absolute top-3 left-3 w-8 h-8 bg-amber-100 text-amber-900 rounded-full font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  3°
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-slate-900">{topTenClients[2].name}</div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold">{topTenClients[2].email}</div>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-slate-200/60 w-full">
                  <div className="text-base font-mono font-black py-0.5" style={{ color: 'var(--brand-violet)' }}>${topTenClients[2].totalSpent.toLocaleString()} ARS</div>
                  <div className="text-[10px] text-slate-500 font-bold">{topTenClients[2].orderCount} compras confirmadas</div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Full Top Ten list */}
        <div className="border-3 border-slate-900 rounded-2xl overflow-hidden bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1E1B4B] text-white font-black border-b-3 border-slate-900 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="p-3.5 w-16 text-center border-r-2 border-slate-900">Rango</th>
                <th className="p-3.5 border-r-2 border-slate-900">Cliente</th>
                <th className="p-3.5 border-r-2 border-slate-900">Email</th>
                <th className="p-3.5 text-center border-r-2 border-slate-900">Pedidos</th>
                <th className="p-3.5 text-right">Monto Invertido ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-900 bg-white">
              {topTenClients.map((client, index) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors font-bold text-slate-800">
                  <td className="p-3.5 text-center font-black text-slate-900 border-r-2 border-slate-900 bg-slate-50">
                    {index + 1}°
                  </td>
                  <td className="p-3.5 font-extrabold text-slate-900 border-r-2 border-slate-900">
                    {client.name}
                  </td>
                  <td className="p-3.5 font-mono text-slate-550 border-r-2 border-slate-900 text-[10px]">
                    {client.email}
                  </td>
                  <td className="p-3.5 text-center font-black text-slate-850 border-r-2 border-slate-900">
                    {client.orderCount}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-emerald-800 text-[12.5px] bg-[#F9FFF9]/30">
                    ${client.totalSpent.toLocaleString()}
                  </td>
                </tr>
              ))}
              {topTenClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                    <div className="flex flex-col items-center gap-1.5 py-4">
                      <AlertCircle className="w-6 h-6 text-slate-400" />
                      <span className="font-bold text-xs uppercase tracking-wide">Aún no hay compras confirmadas para generar el ranking de clientes.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Utility formatting sub routines
function kpiCalculatedValue(num: number): string {
  return num.toLocaleString();
}

function kisCount(num: number): string {
  return num ? `${num} u.` : '0 u.';
}
