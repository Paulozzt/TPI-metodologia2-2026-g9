import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Ticket,
  Users,
  LineChart,
  ShoppingCart,
  Palette,
  Package,
  Wrench,
  AlertTriangle,
  FolderMinus,
  Briefcase,
  Layers,
  Inbox
} from 'lucide-react';

import { Product, Client, Coupon, Order, EmailLog } from './types';
import { INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_COUPONS, INITIAL_ORDERS } from './data/mockData';

// Component imports
import CouponCreator from './components/CouponCreator';
import CouponAssigner from './components/CouponAssigner';
import SalesReports from './components/SalesReports';
import InteractiveSimulator from './components/InteractiveSimulator';

const PALETTES = [
  {
    id: 'neo-pop',
    name: '🎨 Fucsia Pop (Original)',
    primary: '#FF3DBC',
    secondary: '#FF8E3C',
    accent: '#00E5FF',
    violet: '#6366F1',
    bg: '#F9F4FF',
  },
  {
    id: 'retro-sunset',
    name: '🌅 Ocaso Retro (Cálida)',
    primary: '#E63946',
    secondary: '#F4A261',
    accent: '#2A9D8F',
    violet: '#1D3557',
    bg: '#FFFBF4',
  },
  {
    id: 'cyber-mint',
    name: '🧪 Menta Ácida (Cyber)',
    primary: '#2EC4B6',
    secondary: '#FF9F1C',
    accent: '#E71D36',
    violet: '#70E000',
    bg: '#F0FAF5',
  },
  {
    id: 'industrial-acero',
    name: '🔌 Acero Eléctrico (Monocroma)',
    primary: '#111827',
    secondary: '#FFC300',
    accent: '#2563EB',
    violet: '#4B5563',
    bg: '#EDF2F7',
  },
  {
    id: 'frambuesa-helado',
    name: '🍦 Frambuesa Pastel (Kawaii)',
    primary: '#FF7597',
    secondary: '#C77DFF',
    accent: '#4CC9F0',
    violet: '#3F37C9',
    bg: '#F4F9FF',
  }
];

export default function App() {
  const [currentPaletteId, setCurrentPaletteId] = useState(() => {
    return localStorage.getItem('bp_palette_id') || 'neo-pop';
  });

  React.useEffect(() => {
    const selected = PALETTES.find(p => p.id === currentPaletteId) || PALETTES[0];
    localStorage.setItem('bp_palette_id', selected.id);
    document.documentElement.style.setProperty('--brand-primary', selected.primary);
    document.documentElement.style.setProperty('--brand-secondary', selected.secondary);
    document.documentElement.style.setProperty('--brand-accent', selected.accent);
    document.documentElement.style.setProperty('--brand-violet', selected.violet);
    document.documentElement.style.setProperty('--brand-bg', selected.bg);
  }, [currentPaletteId]);

  // Shared States (InMemory db loaded with mock data)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // High-Level Navigation Tab: 'vendedor' | 'cliente'
  const [activePortal, setActivePortal] = useState<'vendedor' | 'cliente'>('vendedor');

  // Vendedor Sub-tabs: 'promotions' | 'assignments' | 'reports' | 'inventory'
  const [sellerSubTab, setSellerSubTab] = useState<'promotions' | 'assignments' | 'reports' | 'inventory'>('promotions');

  // New Client State Form Modal or inputs (simulates domain customer registration)
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientRegion, setNewClientRegion] = useState('CABA - Buenos Aires');
  const [newClientAddress, setNewClientAddress] = useState('');

  // Stock editor State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [customMinStock, setCustomMinStock] = useState<number | ''>('');

  // 1. Coupon handling
  const handleAddCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const handleToggleCouponActive = (couponId: string) => {
    setCoupons(prev =>
      prev.map(c => (c.id === couponId ? { ...c, active: !c.active } : c))
    );
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  // 2. Coupon Assignment
  const handleAssignCouponToClients = (couponId: string, clientIds: string[], newEmailLogs: EmailLog[]) => {
    setCoupons(prev =>
      prev.map(coupon => {
        if (coupon.id === couponId) {
          // Add newly assigned clients to list ensuring no duplicates
          const united = Array.from(new Set([...coupon.assignedClientIds, ...clientIds]));
          return {
            ...coupon,
            assignedClientIds: united,
          };
        }
        return coupon;
      })
    );

    // Append mock SMTP email notification events
    setEmailLogs(prev => [...newEmailLogs, ...prev]);
  };

  // 3. Simulated Transaction Order flow
  const handleOrderCreated = (newOrder: Order) => {
    // Add the order
    setOrders(prev => [newOrder, ...prev]);

    // Update stocks of products purchased automatically
    newOrder.items.forEach(item => {
      setProducts(prevProducts =>
        prevProducts.map(prod => {
          if (prod.id === item.productId) {
            return {
              ...prod,
              stock: Math.max(0, prod.stock - item.quantity),
            };
          }
          return prod;
        })
      );
    });
  };

  // Mark order paid -> triggers coupons marking as used
  const handleOrderPaid = (orderId: string) => {
    setOrders(prevOrders => {
      const targetOrder = prevOrders.find(o => o.id === orderId);
      if (!targetOrder) return prevOrders;

      // Mark Coupon as used if applied to this order
      if (targetOrder.couponCode) {
        setCoupons(prevCoupons =>
          prevCoupons.map(coupon => {
            if (coupon.code === targetOrder.couponCode) {
              const usedSet = Array.from(new Set([...coupon.usedByClientIds, targetOrder.clientId]));
              return {
                ...coupon,
                usedByClientIds: usedSet,
              };
            }
            return coupon;
          })
        );
      }

      return prevOrders.map(o => (o.id === orderId ? { ...o, status: 'paid' as const } : o));
    });
  };

  // Custom threshold stock min configuration editor action (Domain helper)
  const handleSaveMinStock = (productId: string) => {
    if (customMinStock === '' || customMinStock < 0) return;
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, minStock: Number(customMinStock) } : p))
    );
    setEditingProductId(null);
    setCustomMinStock('');
  };

  // Create custom mockup client demo trigger
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail || !newClientAddress) {
      alert('Por favor complete todos los datos.');
      return;
    }
    const newCli: Client = {
      id: `c-${Math.random().toString(36).substr(2, 9)}`,
      name: newClientName,
      email: newClientEmail,
      region: newClientRegion,
      address: newClientAddress,
    };
    setClients(prev => [...prev, newCli]);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientAddress('');
    setShowClientModal(false);
  };

  // Calc items below minimum stock to display high-fidelity alarm badges
  const underStockProductsCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen bg-[#F9F4FF] text-slate-800 font-sans antialiased pb-12 flex flex-col" style={{ backgroundColor: 'var(--brand-bg)' }}>
      
      {/* Visual Header / Brand Layout */}
      <header className="bg-white border-b-4 sticky top-0 z-40 shadow-sm" style={{ borderBottomColor: 'var(--brand-primary)' }} id="app-header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to top right, var(--brand-primary), var(--brand-secondary))' }}>
              <span className="text-white font-black">BP</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 underline decoration-4 underline-offset-4" style={{ decorationColor: 'var(--brand-accent)' }}>
              BODY PAINT <span style={{ color: 'var(--brand-primary)' }}>STORE</span>
            </h1>
          </div>

          {/* Navigation & Theme Toolbar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            {/* Palette Switcher */}
            <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-900 px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-wider">
              <Palette className="w-4 h-4 shrink-0" style={{ color: 'var(--brand-primary)' }} />
              <span className="text-[10px] text-slate-600">Paleta:</span>
              <select
                value={currentPaletteId}
                onChange={e => setCurrentPaletteId(e.target.value)}
                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 cursor-pointer text-slate-950 font-black text-xs p-0 m-0"
              >
                {PALETTES.map(p => (
                  <option key={p.id} value={p.id} className="font-bold text-slate-800 bg-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* High-Level Simulation Navigation Roles Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePortal('vendedor')}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border-2 flex items-center gap-1.5 cursor-pointer ${
                  activePortal === 'vendedor'
                    ? 'text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-[#F0F0FF] text-slate-700 border-slate-200'
                }`}
                style={activePortal === 'vendedor' ? { backgroundColor: 'var(--brand-violet)' } : {}}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Portal Vendedor
              </button>
              <button
                onClick={() => setActivePortal('cliente')}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border-2 flex items-center gap-1.5 cursor-pointer ${
                  activePortal === 'cliente'
                    ? 'text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-[#F0F0FF] text-slate-700 border-slate-200'
                }`}
                style={activePortal === 'cliente' ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Simulador Cliente
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full py-8">
        
        {/* Portal 1: Seller Dashboard */}
        {activePortal === 'vendedor' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Bar with critical details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* Promotion status kpi */}
              <div className="bg-white border-4 border-slate-900 rounded-2xl p-4 flex items-center gap-3.5" style={{ boxShadow: '4px 4px 0px 0px var(--brand-accent)' }}>
                <div className="p-3 bg-slate-50 border-2 rounded-xl shrink-0" style={{ borderColor: 'var(--brand-violet)', color: 'var(--brand-violet)' }}>
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-slate-400">Cupones de Descuento</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {coupons.length} <span className="text-[11px] font-bold text-slate-500">({coupons.filter(c => c.active).length} activos)</span>
                  </div>
                </div>
              </div>

              {/* User Segment status kpi */}
              <div className="bg-white border-4 border-slate-900 rounded-2xl p-4 flex items-center gap-3.5" style={{ boxShadow: '4px 4px 0px 0px var(--brand-primary)' }}>
                <div className="p-3 bg-slate-50 border-2 rounded-xl shrink-0" style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-slate-400">Clientes Registrados</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {clients.length} <span className="text-[11px] font-black underline cursor-pointer" style={{ color: 'var(--brand-primary)' }} onClick={() => setShowClientModal(true)}>+ Añadir</span>
                  </div>
                </div>
              </div>

              {/* Stock health alarm kpi */}
              <div className={`border-4 rounded-2xl p-4 transition-all flex items-center gap-3.5 bg-white border-slate-900 ${
                underStockProductsCount > 0 ? 'animate-pulse' : ''
              }`} style={{ boxShadow: underStockProductsCount > 0 ? '4px 4px 0px 0px #EF4444' : '4px 4px 0px 0px var(--brand-accent)' }}>
                <div className={`p-3 rounded-xl shrink-0 border-2 ${
                  underStockProductsCount > 0 
                    ? 'bg-red-50 border-red-500 text-red-700' 
                    : 'bg-slate-50 border-slate-300 text-slate-600'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-slate-400">Alerta Stock Bajo</div>
                  <div className={`text-base font-black mt-0.5 ${
                    underStockProductsCount > 0 ? 'text-red-650' : 'text-slate-900'
                  }`}>
                    {underStockProductsCount} {underStockProductsCount === 1 ? 'producto' : 'productos'}
                  </div>
                </div>
              </div>

              {/* Active campaigns stats kpi */}
              <div className="bg-white border-4 border-slate-900 rounded-2xl p-4 flex items-center gap-3.5" style={{ boxShadow: '4px 4px 0px 0px var(--brand-secondary)' }}>
                <div className="p-3 bg-slate-50 border-2 rounded-xl shrink-0" style={{ borderColor: 'var(--brand-secondary)', color: 'var(--brand-secondary)' }}>
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-slate-400">Notificaciones Enviadas</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {emailLogs.length} <span className="text-[11px] font-bold text-slate-500">Mails (SMTP)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller sub tab controls */}
            <div className="flex flex-wrap items-center gap-3 border-b-2 border-slate-900 pb-4">
              <button
                onClick={() => setSellerSubTab('promotions')}
                className={`px-4.5 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-xl cursor-pointer border-3 border-slate-900 ${
                  sellerSubTab === 'promotions'
                    ? 'text-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none'
                    : 'text-slate-700 bg-white hover:bg-slate-50'
                }`}
                style={sellerSubTab === 'promotions' ? { backgroundColor: 'var(--brand-accent)' } : {}}
              >
                🎟️ Generar Cupones
              </button>
              <button
                onClick={() => setSellerSubTab('assignments')}
                className={`px-4.5 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-xl cursor-pointer border-3 border-slate-900 ${
                  sellerSubTab === 'assignments'
                    ? 'text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none'
                    : 'text-slate-700 bg-white hover:bg-slate-50'
                }`}
                style={sellerSubTab === 'assignments' ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                👥 Asignación a Clientes
              </button>
              <button
                onClick={() => setSellerSubTab('reports')}
                className={`px-4.5 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-xl cursor-pointer border-3 border-slate-900 ${
                  sellerSubTab === 'reports'
                    ? 'text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none'
                    : 'text-slate-700 bg-white hover:bg-slate-50'
                }`}
                style={sellerSubTab === 'reports' ? { backgroundColor: 'var(--brand-violet)' } : {}}
              >
                📊 Reportes de Ventas
              </button>
              <button
                onClick={() => setSellerSubTab('inventory')}
                className={`px-4.5 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-xl cursor-pointer border-3 border-slate-900 ${
                  sellerSubTab === 'inventory'
                    ? 'text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none'
                    : 'text-slate-700 bg-white hover:bg-slate-50'
                }`}
                style={sellerSubTab === 'inventory' ? { backgroundColor: 'var(--brand-secondary)' } : {}}
              >
                📦 Gral: Almacén de Stock
              </button>
            </div>

            {/* Sub-tab viewport panels */}
            <div className="bg-transparent">
              {sellerSubTab === 'promotions' && (
                <CouponCreator
                  products={products}
                  coupons={coupons}
                  onAddCoupon={handleAddCoupon}
                  onToggleCouponActive={handleToggleCouponActive}
                  onDeleteCoupon={handleDeleteCoupon}
                />
              )}

              {sellerSubTab === 'assignments' && (
                <CouponAssigner
                  coupons={coupons}
                  clients={clients}
                  onAssignCouponToClients={handleAssignCouponToClients}
                  emailLogs={emailLogs}
                />
              )}

              {sellerSubTab === 'reports' && (
                <SalesReports
                  orders={orders}
                  products={products}
                  clients={clients}
                />
              )}

              {sellerSubTab === 'inventory' && (
                <div className="bg-white border-4 border-slate-900 rounded-[32px] p-6 space-y-4" style={{ boxShadow: '8px 8px 0px 0px var(--brand-secondary)' }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-slate-900">
                    <div>
                      <h3 className="text-lg font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                        <Package className="w-5 h-5" style={{ color: 'var(--brand-secondary)' }} />
                        Control de Inventario de Productos
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Administre stocks físicos y reconfigure los umbrales de <strong>Stock Mínimo</strong>. Los productos bajo este límite se resaltarán con alarmas.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const amt = prompt('Ingrese cantidad de stock para añadir de forma masiva a todo el catálogo:');
                        if (amt) {
                          setProducts(prev => prev.map(p => ({ ...p, stock: p.stock + Number(amt) })));
                        }
                      }}
                      className="px-4 py-2 border-2 border-slate-900 bg-white text-slate-950 font-black rounded-xl text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                      Carga Masiva de Stock
                    </button>
                  </div>

                  {/* Stock table */}
                  <div className="border-4 border-slate-900 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--brand-bg)' }}>
                    <div className="block overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#1E1B4B] text-white font-extrabold border-b-4 border-slate-900">
                          <tr>
                            <th className="p-3 uppercase tracking-wider">Especie / Nombre</th>
                            <th className="p-3 uppercase tracking-wider">Categoría</th>
                            <th className="p-3 text-center uppercase tracking-wider">Tipo</th>
                            <th className="p-3 text-center uppercase tracking-wider">Stock Disponible</th>
                            <th className="p-3 text-center uppercase tracking-wider">Stock Mínimo</th>
                            <th className="p-3 text-right uppercase tracking-wider">Monto Precio ($)</th>
                            <th className="p-3 text-center w-28 uppercase tracking-wider">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-900 bg-white">
                          {products.map(p => {
                            const isUnder = p.stock <= p.minStock;
                            return (
                              <tr
                                key={p.id}
                                className={`hover:bg-[#F9F4FF]/50 transition-colors ${
                                  isUnder ? 'bg-red-50 text-red-950 font-bold' : ''
                                }`}
                              >
                                <td className="p-3 font-bold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    {isUnder && (
                                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 className-animated-bounce" title="Alerta: Bajo Stock mínimo" />
                                    )}
                                    <span>{p.name}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-600 font-bold">{p.category}</td>
                                <td className="p-3 text-center">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 ${
                                    p.type === 'kit'
                                      ? 'bg-teal-100 text-teal-850 border-teal-800'
                                      : 'bg-slate-100 text-slate-800 border-slate-400'
                                  }`}>
                                    {p.type === 'kit' ? 'Kit' : 'Simple'}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-black text-sm">
                                  <span className={isUnder ? 'text-red-600' : 'text-slate-900'}>
                                    {p.stock} u.
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold">
                                  {editingProductId === p.id ? (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <input
                                        type="number"
                                        value={customMinStock}
                                        onChange={e => setCustomMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="border-2 border-slate-900 p-1 w-16 text-center rounded-lg text-xs font-bold"
                                      />
                                      <button
                                        onClick={() => handleSaveMinStock(p.id)}
                                        className="bg-[#00E5FF] text-slate-900 border-2 border-slate-900 rounded-lg px-2 py-0.5 font-black hover:brightness-110 active:translate-y-0.5 cursor-pointer text-[10px]"
                                      >
                                        Ok
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-800">{p.minStock} u.</span>
                                  )}
                                </td>
                                <td className="p-3 text-right font-mono font-black text-sm text-slate-900">${p.price}</td>
                                <td className="p-3 text-center">
                                  {editingProductId === p.id ? (
                                    <button
                                      onClick={() => setEditingProductId(null)}
                                      className="text-[10px] text-red-600 bg-transparent py-1 font-black uppercase tracking-wider hover:underline"
                                    >
                                      Cancelar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingProductId(p.id);
                                        setCustomMinStock(p.minStock);
                                      }}
                                      className="text-[10px] text-slate-950 bg-[#00E5FF] hover:brightness-110 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
                                    >
                                      Configurar
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portal 2: Client Simulation sandbox view */}
        {activePortal === 'cliente' && (
          <InteractiveSimulator
            products={products}
            clients={clients}
            coupons={coupons}
            orders={orders}
            onOrderCreated={handleOrderCreated}
            onOrderPaid={handleOrderPaid}
            onUpdateStocks={() => {}}
          />
        )}
      </main>

      {/* Footer Status Bar representing the theme's structure */}
      <footer className="h-10 bg-slate-900 px-8 flex items-center justify-between text-[10px] font-black tracking-widest text-white/40 mt-auto">
        <div>BODY PAINT CRM v2.0 - SCRUM ITERATION 04</div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> SISTEMA ONLINE
          </span>
          <span className="hidden sm:inline">MERCADO PAGO: CONECTADO</span>
        </div>
      </footer>

      {/* Customer creation Slideover Modal (Nice simulation touch for testing customized assignments) */}
      <AnimatePresence>
        {showClientModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 max-w-md w-full border-4 border-slate-900 space-y-4"
              style={{ boxShadow: '12px 12px 0px 0px var(--brand-primary)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                  Registrar Cliente Adicional
                </h3>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="px-2 py-1 text-slate-800 hover:bg-slate-100 rounded-lg font-black border-2 border-slate-900 cursor-pointer"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="cli-name" className="block font-black text-slate-500 mb-1 uppercase tracking-wider ml-1">Nombre Completo</label>
                  <input
                    id="cli-name"
                    type="text"
                    required
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="E.g. Laura Maidana"
                    className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 rounded-xl font-bold focus:outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="cli-mail" className="block font-black text-slate-500 mb-1 uppercase tracking-wider ml-1">Correo Electrónico (Para SMTP)</label>
                  <input
                    id="cli-mail"
                    type="email"
                    required
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    placeholder="E.g. laura@yahoo.com"
                    className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 rounded-xl font-mono focus:outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="cli-region" className="block font-black text-slate-500 mb-1 uppercase tracking-wider ml-1">Región de Envío</label>
                  <select
                    id="cli-region"
                    value={newClientRegion}
                    onChange={e => setNewClientRegion(e.target.value)}
                    className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 rounded-xl font-bold focus:outline-hidden cursor-pointer"
                  >
                    <option value="CABA - Buenos Aires">CABA - Buenos Aires</option>
                    <option value="Zona Norte - San Isidro">Zona Norte - San Isidro</option>
                    <option value="Zona Oeste - Ramos Mejía">Zona Oeste - Ramos Mejía</option>
                    <option value="Zona Sur - Lanús">Zona Sur - Lanús</option>
                    <option value="Córdoba Capital">Córdoba Capital</option>
                    <option value="Santa Fe (Rosario)">Santa Fe (Rosario)</option>
                    <option value="Mendoza (Capital)">Mendoza (Capital)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cli-address" className="block font-black text-slate-500 mb-1 uppercase tracking-wider ml-1">Dirección Física</label>
                  <input
                    id="cli-address"
                    type="text"
                    required
                    value={newClientAddress}
                    onChange={e => setNewClientAddress(e.target.value)}
                    placeholder="E.g. San Martín 1230"
                    className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 rounded-xl font-bold focus:outline-hidden focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-white font-black rounded-xl border-b-4 border-black/30 active:translate-y-1 active:border-b-0 cursor-pointer uppercase tracking-wider text-xs"
                  style={{ backgroundColor: 'var(--brand-secondary)' }}
                >
                  Confirmar Registro
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
