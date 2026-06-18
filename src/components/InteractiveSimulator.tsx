import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  User,
  ShoppingBag,
  CreditCard,
  Building,
  Mail,
  Truck,
  AlertTriangle,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Ticket,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Product, Client, Coupon, Order, OrderItem } from '../types';
import { validateCoupon } from '../utils/helpers';

interface InteractiveSimulatorProps {
  products: Product[];
  clients: Client[];
  coupons: Coupon[];
  onOrderCreated: (order: Order) => void;
  onOrderPaid: (orderId: string) => void;
  onUpdateStocks: (items: { productId: string; quantity: number }[]) => void;
  orders: Order[];
}

export default function InteractiveSimulator({
  products,
  clients,
  coupons,
  onOrderCreated,
  onOrderPaid,
  onUpdateStocks,
  orders,
}: InteractiveSimulatorProps) {
  // Role toggles
  const [isAdminView, setIsAdminView] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'contra_entrega' | 'tarjeta' | 'mercado_pago'>('mercado_pago');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  // Handle client select
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setDeliveryAddress(client.address);
    } else {
      setDeliveryAddress('');
    }
    // Reset coupon application on customer change
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
    setCouponCodeInput('');
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Producto temporalmente sin stock.');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`No puedes agregar más de este producto. Stock máximo disponible en almacén: ${product.stock}`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    // Clear applied coupon when cart changes to force validation refresh
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Update item quantity in cart
  const handleUpdateCartQty = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > product.stock) {
            alert(`Stock insuficiente. Solo quedan ${product.stock} unidades de este producto.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });

    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    setAppliedCoupon(null);

    if (!selectedClientId) {
      setCouponError('Debe seleccionar qué cliente está comprando antes de aplicar un cupón.');
      return;
    }

    if (!couponCodeInput.trim()) {
      setCouponError('Por favor ingrese un código de cupón.');
      return;
    }

    if (cart.length === 0) {
      setCouponError('El carro de compras está vacío.');
      return;
    }

    const codeToSearch = couponCodeInput.trim().toUpperCase();
    const coupon = coupons.find(c => c.code === codeToSearch);

    if (!coupon) {
      setCouponError(`El código de cupón "${codeToSearch}" no es válido o no existe.`);
      return;
    }

    // Validate using helper rules
    const validation = validateCoupon(coupon, cart, selectedClient);

    if (!validation.isValid) {
      setCouponError(validation.reason || 'Cupón inválido.');
      return;
    }

    // Success
    setAppliedCoupon(coupon);
    setCouponSuccess(`✓ ¡Cupón "${coupon.code}" aplicado con éxito! Descuento de $${coupon.discountAmount} ARS.`);
  };

  // Confirm order (produces tracking and a pending_payment order)
  const handleConfirmOrder = () => {
    if (!selectedClient) {
      alert('Por favor, elija un cliente.');
      return;
    }
    if (cart.length === 0) {
      alert('El carro está vacío.');
      return;
    }
    if (!deliveryAddress.trim()) {
      alert('Por favor ingrese el domicilio de envío.');
      return;
    }

    // Generate simulated routing tracking
    const trackingNo = `BP-TRK-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderItemValues: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));

    const newOrder: Order = {
      id: `order-${Math.random().toString(36).substr(2, 9)}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientEmail: selectedClient.email,
      date: new Date().toISOString().substring(0, 10),
      items: orderItemValues,
      subtotal: cartSubtotal,
      couponCode: appliedCoupon?.code,
      discountApplied: discountAmount,
      total: cartTotal,
      status: 'pending_payment', // pending payment confirmation triggers cupón use!
      deliveryAddress,
      region: selectedClient.region,
      trackingNumber: trackingNo,
    };

    // Trigger order creation callback which also reduces products stock
    onOrderCreated(newOrder);

    // Reset shopping state
    setCart([]);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponSuccess(null);
    setCouponError(null);
    
    // Switch to orders view to simulate payment!
    setActiveTab('orders');
  };

  return (
    <div className="space-y-6" id="simulator-container-box">
      {/* Simulation Banner Head */}
      <div className="border-4 border-slate-900 rounded-[32px] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: 'var(--brand-violet)', boxShadow: '8px 8px 0px 0px var(--brand-accent)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-pulse" style={{ backgroundColor: 'var(--brand-primary)' }}>
              Sandbox Interactivo
            </span>
          </div>
          <h2 className="text-xl font-black italic tracking-wide uppercase mt-1">
            Laboratorio de Compras y Validación de Reglas
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-medium">
            Simule el comportamiento de un <strong>Cliente</strong> realizando un pedido, aplicando cupones de descuento (validando las reglas de negocio en tiempo real) y confirmando el pago para que el cupón pase a su estado final <strong>&quot;Usado&quot;</strong>.
          </p>
        </div>

        {/* Administrator stock switch */}
        <div className="bg-slate-950 border-2 border-slate-800 p-3 rounded-xl flex items-center justify-between gap-4 self-start md:self-auto min-w-[210px]">
          <div className="flex items-center gap-2">
            {isAdminView ? <Eye className="w-4 h-4 text-[#00E5FF]" /> : <Lock className="w-4 h-4 text-slate-400" />}
            <span className="text-xs font-black uppercase tracking-wider">Stock (Vista Admin)</span>
          </div>
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="w-12 h-6 border-2 border-slate-950 rounded-full p-0.5 transition-colors duration-200 outline-hidden flex items-center cursor-pointer"
            style={{ backgroundColor: isAdminView ? 'var(--brand-accent)' : 'rgb(51, 65, 85)' }}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${
                isAdminView ? 'transform translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Simulator Nav */}
      <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-0.5">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 cursor-pointer ${
            activeTab === 'catalog'
              ? 'italic'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={activeTab === 'catalog' ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
        >
          <ShoppingCart className="w-4 h-4" />
          1. Catálogo e Inicio de Pedido
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2.5 cursor-pointer ${
            activeTab === 'orders'
              ? 'italic'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={activeTab === 'orders' ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
        >
          <CreditCard className="w-4 h-4" />
          2. Pedidos y Confirmación de Pago
          {orders.filter(o => o.status === 'pending_payment').length > 0 && (
            <span className="text-slate-950 border-2 border-slate-900 rounded-full text-[9px] w-5 h-5 flex items-center justify-center font-black animate-bounce shadow-sm" style={{ backgroundColor: 'var(--brand-secondary)' }}>
              {orders.filter(o => o.status === 'pending_payment').length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'catalog' ? (
          <motion.div
            key="sandbox-catalog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Catalog Grid */}
            <div className="lg:col-span-8 space-y-6">
              {/* Client Picker */}
              <div className="bg-white border-4 border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ boxShadow: '4px 4px 0px 0px var(--brand-accent)' }}>
                <div className="flex items-center gap-2 text-slate-950 font-black uppercase tracking-wider text-xs shrink-0 max-w-sm">
                  <User className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  Elegir Cliente Simulador:
                </div>
                <select
                  value={selectedClientId}
                  onChange={e => handleClientChange(e.target.value)}
                  className="flex-1 text-xs border-2 border-slate-900 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="">-- Seleccionar Persona --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) - {c.region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Catalog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                  const isKit = product.type === 'kit';
                  const isStockWarning = product.stock <= product.minStock;

                  return (
                    <div
                      key={product.id}
                      className={`bg-white border-3 border-slate-900 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                        isStockWarning && isAdminView
                          ? 'bg-red-50/30 border-red-500'
                          : 'hover:translate-y-[-2px]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border-2 border-slate-900 ${
                              isKit
                                ? 'bg-teal-50 text-teal-850'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {isKit ? 'Kit Compuesto' : 'Maquillaje'}
                          </span>

                          {/* Admin Only Stock Visibility Rule */}
                          {isAdminView ? (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span
                                className={`font-mono font-black border-2 border-slate-900 px-1.5 py-0.5 rounded ${
                                  isStockWarning ? 'bg-red-100 text-red-750' : 'bg-slate-50 text-slate-700'
                                }`}
                              >
                                {product.stock === 0 ? 'Sin Stock' : `${product.stock} u.`}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[10px] uppercase font-black tracking-wider font-mono flex items-center gap-0.5">
                              {product.stock > 0 ? (
                                <span className="text-emerald-700">Disponible</span>
                              ) : (
                                <span className="text-red-650">Sin Stock</span>
                              )}
                            </div>
                          )}
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-xs line-clamp-2 mt-1 min-h-[32px] tracking-tight">
                          {product.name}
                        </h4>

                        {/* If Kit, show elements composition */}
                        {isKit && product.components && (
                          <div className="mt-3.5 p-2 border-2 border-slate-900 rounded-xl text-[10px] text-slate-750 space-y-1 font-bold" style={{ backgroundColor: 'var(--brand-bg)' }}>
                            <span className="font-black text-[9px] uppercase block tracking-widest border-b border-slate-200 pb-0.5 mb-1" style={{ color: 'var(--brand-violet)' }}>Compuesto por:</span>
                            {product.components.map((comp, ci) => (
                              <div key={ci} className="truncate">• {comp.quantity}x {comp.name.split(' - ')[0]}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stock Alert Warning indicator */}
                      {isStockWarning && isAdminView && (
                        <div className="mt-3 bg-red-50 text-red-800 text-[9px] p-2 rounded-xl flex items-center gap-1 font-black border-2 border-red-500 uppercase tracking-wide">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-650 shrink-0" />
                          <span>¡S.O.S! Stock Mínimo ({product.stock})</span>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t-2 border-slate-200 flex items-center justify-between">
                        <span className="font-mono text-sm font-black text-slate-900">
                          ${product.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white border-b-2 border-black/30 active:translate-y-0.5 active:border-b-0 rounded-lg hover:shadow-xs transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:cursor-not-allowed"
                          style={product.stock <= 0 ? {} : { backgroundColor: 'var(--brand-secondary)' }}
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shopping Cart & Form Submission */}
            <div className="lg:col-span-4 bg-white border-4 border-slate-900 rounded-[32px] p-5 space-y-4 flex flex-col justify-between" style={{ boxShadow: '8px 8px 0px 0px var(--brand-primary)' }}>
              <div>
                <h3 className="text-xs uppercase font-black text-slate-800 tracking-wider flex items-center gap-1.5 pb-2.5 border-b-2 border-slate-200 mb-3">
                  <ShoppingCart className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  Carro de Compras
                </h3>

                {/* Empty Cart */}
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-bold text-xs italic uppercase tracking-wide leading-relaxed">
                    El carro está vacío.<br />Agrega pinturas o kits.
                  </div>
                ) : (
                  /* Cart Items */
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl">
                        <div className="truncate flex-1 font-bold">
                          <div className="text-slate-900 truncate" title={item.product.name}>
                            {item.product.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ${item.product.price} c/u
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border-2 border-slate-900 rounded-xl bg-white p-0.5">
                            <button
                              onClick={() => handleUpdateCartQty(item.product.id, -1)}
                              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1 text-xs font-black text-slate-900 min-w-5 text-center font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQty(item.product.id, 1)}
                              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleUpdateCartQty(item.product.id, -item.quantity)}
                            className="p-1.5 border-2 border-slate-200 bg-white hover:bg-slate-100 hover:border-red-500 rounded-xl cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Coupons section */}
                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-slate-200 space-y-2">
                    <label htmlFor="p-coupon" className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">
                      ¿Tenés un Cupón de Descuento?
                    </label>

                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        id="p-coupon"
                        type="text"
                        placeholder="Ingresar código..."
                        value={couponCodeInput}
                        onChange={e => setCouponCodeInput(e.target.value)}
                        className="flex-1 text-xs border-2 border-slate-900 bg-slate-50 p-2.5 rounded-xl focus:outline-hidden font-mono uppercase font-black focus:bg-white transition-all focus:ring-0 text-slate-900"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm hover:bg-slate-850"
                      >
                        Aplicar
                      </button>
                    </form>

                    {/* Coupon Messages */}
                    {couponError && (
                      <div className="text-[10px] text-red-800 bg-red-50 border-2 border-red-500 p-2.5 rounded-xl flex items-start gap-1 font-bold leading-normal">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-650" />
                        <span>{couponError}</span>
                      </div>
                    )}

                    {couponSuccess && (
                      <div className="text-[10px] text-emerald-850 bg-emerald-50 border-2 border-emerald-500 p-2.5 rounded-xl flex items-start gap-1.5 font-bold leading-normal">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                        <span>{couponSuccess}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checkout Form Actions */}
              {cart.length > 0 && selectCheckOutParameters(selectedClient, deliveryAddress, setDeliveryAddress, paymentMethod, setPaymentMethod, cartSubtotal, discountAmount, cartTotal, handleConfirmOrder)}
            </div>
          </motion.div>
        ) : (
          /* Simulated Pending Orders List */
          <motion.div
            key="sandbox-orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200 text-xs text-slate-500 font-bold uppercase">
              <h3 className="font-black text-slate-800 uppercase tracking-wider">
                Pedidos en Curso ({orders.filter(o => o.status === 'pending_payment').length} Pendientes de Pago)
              </h3>
              <span>Confirmar pago marca cupones como &quot;Usado&quot;</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((order) => {
                const isPaid = order.status === 'paid';
                return (
                  <div
                    key={order.id}
                    className="border-3 border-slate-900 rounded-2xl p-5 bg-white transition-all flex flex-col justify-between"
                    style={isPaid ? { boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' } : { boxShadow: '6px 6px 0px 0px var(--brand-violet)' }}
                  >
                    <div className="space-y-4">
                      {/* Order Head */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-[9px] border border-slate-200 px-2.5 py-0.5 rounded text-slate-600 block mb-1 font-black" style={{ backgroundColor: 'var(--brand-bg)' }}>
                            Ref: {order.id.toUpperCase()}
                          </span>
                          <h4 className="font-black text-sm text-slate-900 tracking-tight">{order.clientName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{order.clientEmail}</p>
                        </div>

                        <div className="text-right">
                          {isPaid ? (
                            <span className="bg-emerald-100 text-emerald-850 border-2 border-emerald-600 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pagado OK
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-850 border-2 border-amber-500 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase animate-pulse inline-block">
                              Esperando Pago
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-bold block mt-1">
                            {order.date}
                          </span>
                        </div>
                      </div>

                      {/* Products details */}
                      <div className="border-2 border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-700 space-y-1.5 font-bold" style={{ backgroundColor: 'var(--brand-bg)' }}>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.quantity}u. × {item.productName.split(' - ')[0]}</span>
                            <span className="font-mono text-[10px] text-slate-900">${(item.quantity * item.unitPrice).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t-2 border-dashed border-slate-200 mt-2 space-y-1">
                          <div className="flex justify-between text-slate-500 font-semibold text-[10px]">
                            <span>Subtotal:</span>
                            <span className="font-mono">${order.subtotal.toLocaleString()}</span>
                          </div>
                          {order.couponCode && (
                            <div className="flex justify-between text-emerald-700 font-black text-[10px]">
                              <span className="flex items-center gap-0.5"><Ticket className="w-3 h-3" /> Cupón ({order.couponCode}):</span>
                              <span className="font-mono">-${order.discountApplied.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-black text-slate-900 text-xs pt-1">
                            <span>Importe Pago:</span>
                            <span className="font-mono text-xs">${order.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery / Shipping details */}
                      <div className="text-[11px] text-slate-600 space-y-1 pt-1 ml-0.5 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                          <span>Zona: <strong className="text-slate-800">{order.region}</strong></span>
                        </div>
                        <div className="pl-5 truncate text-slate-500">Envío: {order.deliveryAddress}</div>
                        {order.trackingNumber && (
                          <div className="pl-5 font-mono text-[9px] font-black" style={{ color: 'var(--brand-violet)' }}>
                            Tracking No: {order.trackingNumber} (Correo OK)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment confirmed action */}
                    {!isPaid && (
                      <button
                        onClick={() => onOrderPaid(order.id)}
                        className="w-full text-slate-950 rounded-xl py-3 px-3 text-xs font-black uppercase tracking-wide cursor-pointer border-b-4 border-cyan-700 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-1.5 mt-4 transition-all"
                        style={{ backgroundColor: 'var(--brand-accent)' }}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Simular Pago (Confirmar Mercado Pago)
                      </button>
                    )}
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="col-span-2 py-16 text-center text-slate-500 font-bold border-4 border-slate-900 rounded-[32px] bg-white uppercase">
                  No hay pedidos pendientes ni registrados en la simulación.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function selectCheckOutParameters(
  selectedClient: Client | null,
  deliveryAddress: string,
  setDeliveryAddress: (str: string) => void,
  paymentMethod: 'contra_entrega' | 'tarjeta' | 'mercado_pago',
  setPaymentMethod: (opt: 'contra_entrega' | 'tarjeta' | 'mercado_pago') => void,
  cartSubtotal: number,
  discountAmount: number,
  cartTotal: number,
  onConfirm: () => void
): React.ReactNode {
  return (
    <div className="mt-4 pt-4 border-t-2 border-slate-200 space-y-4">
      {/* Target parameters */}
      <div className="space-y-3.5 text-xs">
        {/* Delivery input */}
        <div>
          <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1.5 ml-0.5">
            Domicilio de Envío
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Truck className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Calle y altura, Piso, Dpto..."
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs border-2 border-slate-900 bg-slate-50 focus:bg-white rounded-xl focus:outline-hidden font-bold"
            />
          </div>
        </div>

        {/* Method */}
        <div>
          <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1.5 ml-0.5">
            Forma de Pago
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('contra_entrega')}
              className="p-2.5 border-2 border-slate-950 rounded-xl font-black flex flex-col items-center justify-center gap-1 cursor-pointer text-center text-[10px] uppercase transition-all tracking-wide text-slate-700"
              style={paymentMethod === 'contra_entrega' ? { backgroundColor: 'var(--brand-secondary)', color: 'white', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' } : { backgroundColor: 'var(--brand-bg)' }}
            >
              <Building className="w-4 h-4" />
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('tarjeta')}
              className="p-2.5 border-2 border-slate-950 rounded-xl font-black flex flex-col items-center justify-center gap-1 cursor-pointer text-center text-[10px] uppercase transition-all tracking-wide text-slate-700"
              style={paymentMethod === 'tarjeta' ? { backgroundColor: 'var(--brand-secondary)', color: 'white', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' } : { backgroundColor: 'var(--brand-bg)' }}
            >
              <CreditCard className="w-4 h-4" />
              Tarjeta
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('mercado_pago')}
              className="p-2.5 border-2 border-slate-950 rounded-xl font-black flex flex-col items-center justify-center gap-1 cursor-pointer text-center text-[10px] uppercase transition-all tracking-wide text-slate-700"
              style={paymentMethod === 'mercado_pago' ? { backgroundColor: 'var(--brand-secondary)', color: 'white', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' } : { backgroundColor: 'var(--brand-bg)' }}
            >
              <ShoppingBag className="w-4 h-4" />
              MercadoP.
            </button>
          </div>
        </div>
      </div>

      {/* Bill summary breakdown */}
      <div className="rounded-xl p-3 text-xs text-slate-800 space-y-1.5 font-bold border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-mono text-slate-950">${cartSubtotal.toLocaleString()}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-800 font-extrabold">
            <span>Descuento aplicado:</span>
            <span className="font-mono">-${discountAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-slate-900 border-t-2 border-slate-350 pt-2 text-sm leading-normal">
          <span>Total compra:</span>
          <span className="font-mono text-slate-950">${cartTotal.toLocaleString()} ARS</span>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={!selectedClient}
        className="w-full text-white font-black py-4 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border-b-4 border-black/20 active:translate-y-1 active:border-b-0 transition-all uppercase tracking-wider shadow-sm disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-450 disabled:border-2"
        style={!selectedClient ? {} : { backgroundColor: 'var(--brand-primary)' }}
      >
        <CheckCircle2 className="w-4 h-4" />
        {selectedClient ? `Generar Pedido para ${selectedClient.name.split(' ')[0]}` : 'Seleccione un Cliente Arriba'}
      </button>
    </div>
  );
}
