/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Tag, Calendar, ShoppingBag, Check, Trash2, ShieldCheck, Ticket } from 'lucide-react';
import { Product, Coupon } from '../types';

interface CouponCreatorProps {
  products: Product[];
  coupons: Coupon[];
  onAddCoupon: (newCoupon: Coupon) => void;
  onToggleCouponActive: (couponId: string) => void;
  onDeleteCoupon: (couponId: string) => void;
}

export default function CouponCreator({
  products,
  coupons,
  onAddCoupon,
  onToggleCouponActive,
  onDeleteCoupon,
}: CouponCreatorProps) {
  const [code, setCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number | ''>('');
  const [validityStart, setValidityStart] = useState('');
  const [validityEnd, setValidityEnd] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter products by type for easy view
  const simpleProducts = products.filter(p => p.type === 'simple');
  const kitProducts = products.filter(p => p.type === 'kit');

  const handleProductToggle = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validations
    if (!code.trim()) {
      setError('Por favor, ingrese un código de cupón.');
      return;
    }
    const sanitizedCode = code.trim().toUpperCase().replace(/\s+/g, '');
    if (coupons.some(c => c.code === sanitizedCode)) {
      setError(`Ya existe un cupón con el código "${sanitizedCode}".`);
      return;
    }

    if (!discountAmount || discountAmount <= 0) {
      setError('El monto de descuento debe ser mayor que cero.');
      return;
    }

    if (!validityStart) {
      setError('Por favor, seleccione la fecha de inicio del cupón.');
      return;
    }

    if (!validityEnd) {
      setError('Por favor, seleccione la fecha de expiración del cupón.');
      return;
    }

    if (validityEnd < validityStart) {
      setError('La fecha de vencimiento no puede ser anterior a la de inicio.');
      return;
    }

    const newCoupon: Coupon = {
      id: `coup-${Math.random().toString(36).substr(2, 9)}`,
      code: sanitizedCode,
      discountAmount: Number(discountAmount),
      validityStart,
      validityEnd,
      applicableProductIds: selectedProductIds,
      assignedClientIds: [],
      usedByClientIds: [],
      active: true,
    };

    onAddCoupon(newCoupon);
    setSuccess(`¡Cupón "${sanitizedCode}" generado con éxito! El descuento de $${discountAmount} ARS ya está listo para ser aplicado.`);

    // Reset Form
    setCode('');
    setDiscountAmount('');
    setValidityStart('');
    setValidityEnd('');
    setSelectedProductIds([]);

    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <div className="space-y-8" id="coupon-creator-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-slate-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase italic">
            <Ticket className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            Generación de Promociones
          </h2>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Como vendedor, quiero generar cupones de descuento para ofrecer promociones a mis clientes.
          </p>
        </div>
        <div className="border-2 border-slate-900 px-4 py-2 rounded-xl text-xs text-slate-950 font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1" style={{ backgroundColor: 'var(--brand-accent)' }}>
          <ShieldCheck className="w-3.5 h-3.5" />
          Monto Mínimo Validado Activo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-5 bg-white border-4 border-slate-900 rounded-[32px] p-6 text-slate-800" style={{ boxShadow: '8px 8px 0px 0px var(--brand-accent)' }}>
          <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-slate-200">
            <Plus className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            Crear Nuevo Cupón
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-500 text-red-750 text-xs p-3 rounded-xl font-bold flex items-start gap-2"
              >
                <span className="font-extrabold uppercase">Error:</span> {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs p-3 rounded-xl font-bold"
              >
                {success}
              </motion.div>
            )}

            {/* Code */}
            <div>
              <label htmlFor="coupon-code" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                Código del Cupón
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Tag className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} />
                </div>
                <input
                  id="coupon-code"
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="E.g. COLORFIESTA20, SHINE500"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-slate-900 bg-slate-50 focus:bg-white rounded-xl focus:outline-hidden font-bold font-mono transition-all lowercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:ring-0 text-slate-900 focus:lowercase focus:font-bold"
                />
              </div>
            </div>

            {/* Discount Amount */}
            <div>
              <label htmlFor="coupon-discount" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                Monto del Descuento ($ ARS)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-black text-sm" style={{ color: 'var(--brand-secondary)' }}>
                  $
                </span>
                <input
                  id="coupon-discount"
                  type="number"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Monto en pesos, ej: 1505"
                  className="w-full pl-8 pr-3 py-2.5 text-sm border-2 border-slate-900 bg-slate-50 focus:bg-white rounded-xl focus:outline-hidden focus:ring-0 transition-all font-black text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-1.5">
                Regla de negocio: El descuento solo se aplicará si el monto del pedido supera a este valor.
              </p>
            </div>

            {/* Validity Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="coupon-start" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                  Válido desde
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <input
                    id="coupon-start"
                    type="date"
                    value={validityStart}
                    onChange={e => setValidityStart(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 text-xs font-bold border-2 border-slate-900 bg-slate-50 focus:bg-white rounded-xl focus:outline-hidden focus:ring-0 transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="coupon-end" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                  Válido hasta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <input
                    id="coupon-end"
                    type="date"
                    value={validityEnd}
                    onChange={e => setValidityEnd(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 text-xs font-bold border-2 border-slate-900 bg-slate-50 focus:bg-white rounded-xl focus:outline-hidden focus:ring-0 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Scope (Product selection) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Productos abarcados
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[10px] font-black uppercase tracking-wider underline cursor-pointer"
                  style={{ color: 'var(--brand-violet)' }}
                >
                  {selectedProductIds.length === products.length ? 'Desmarcar todos' : 'Marcar todos'}
                </button>
              </div>

              <div className="border-2 border-slate-900 rounded-xl max-h-56 overflow-y-auto bg-slate-50 p-2.5 divide-y divide-slate-150 text-xs font-bold">
                {/* Simple products list */}
                <div className="pb-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-2 py-1 sticky top-0 bg-slate-50 z-10 border-b-2 border-slate-200">
                    Productos Simples
                  </h4>
                  {simpleProducts.map(p => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2.5 px-2 py-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => handleProductToggle(p.id)}
                        className="rounded border-2 border-slate-900 focus:ring-0"
                        style={{ accentColor: 'var(--brand-primary)' }}
                      />
                      <span className="text-slate-800 truncate">{p.name} - <span className="font-mono text-xs text-indigo-700">${p.price}</span></span>
                    </label>
                  ))}
                </div>

                {/* Kits list */}
                <div className="pt-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-2 py-1 sticky top-0 bg-slate-50 z-10 border-b-2 border-slate-200">
                    Kits de Productos
                  </h4>
                  {kitProducts.map(p => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2.5 px-2 py-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors text-slate-850"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => handleProductToggle(p.id)}
                        className="rounded border-2 border-slate-900 focus:ring-0"
                        style={{ accentColor: 'var(--brand-accent)' }}
                      />
                      <span className="truncate">{p.name} <span className="text-[9px] bg-teal-150 border-2 border-teal-600 font-black text-teal-850 px-1.5 py-0.5 rounded-full uppercase ml-1">Kit</span> - <span className="font-mono text-xs text-teal-700">${p.price}</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-1.5">
                {selectedProductIds.length === 0
                  ? '⚠️ Si no se seleccionan productos, aplicará para todo el catálogo.'
                  : `Aplica para los ${selectedProductIds.length} productos / kits seleccionados.`}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4.5 text-white font-black rounded-xl border-b-4 border-black/30 active:translate-y-1 active:border-b-0 cursor-pointer uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--brand-secondary)' }}
            >
              <Plus className="w-5 h-5" />
              Generar Cupón Activo
            </button>
          </form>
        </div>

        {/* Generated Coupons View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              Cupones Generados ({coupons.length})
            </h3>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">
              Panel del vendedor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {coupons.map((coupon) => {
                const coveredCount = coupon.applicableProductIds.length;
                const isAllProducts = coveredCount === 0 || coveredCount === products.length;
                return (
                  <motion.div
                    key={coupon.id}
                    layoutId={`coupon-card-${coupon.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`border-3 border-slate-900 rounded-2xl p-4 shadow-sm relative flex flex-col justify-between transition-all ${
                      coupon.active
                        ? 'bg-white hover:translate-y-[-2px]'
                        : 'bg-zinc-50 border-zinc-300 grayscale opacity-60 text-slate-400'
                    }`}
                    style={coupon.active ? { boxShadow: '4px 4px 0px 0px var(--brand-primary)' } : {}}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-xs bg-[#F0F0FF] border-2 border-slate-900 px-2.5 py-1 rounded-lg text-slate-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide">
                          {coupon.code}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleCouponActive(coupon.id)}
                            title={coupon.active ? 'Desactivar cupón' : 'Activar cupón'}
                            className="w-10 h-5 border-2 border-slate-900 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden cursor-pointer"
                            style={coupon.active ? { backgroundColor: 'var(--brand-primary)' } : { backgroundColor: '#CBD5E1' }}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${
                                coupon.active ? 'transform translate-x-5' : ''
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => onDeleteCoupon(coupon.id)}
                            title="Eliminar promocional"
                            className="p-1 px-2 border-2 border-slate-900 bg-white text-slate-700 hover:text-red-600 rounded-lg transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1 italic">
                          ${coupon.discountAmount}
                          <span className="text-[10px] font-black uppercase not-italic ml-1" style={{ color: 'var(--brand-secondary)' }}>ARS Off</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold mt-1 flex items-center gap-1.5 ms-0.5">
                          <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--brand-primary)' }} />
                          Vigente: {coupon.validityStart} al {coupon.validityEnd}
                        </p>
                      </div>

                      {/* Covered Products Indicator */}
                      <div className="mt-3.5 pt-2.5 border-t border-dashed border-slate-300">
                        <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">
                          Productos abarcados:
                        </div>
                        <div className="text-xs font-bold leading-relaxed truncate" title={isAllProducts ? 'Todo el catálogo' : undefined}>
                          {isAllProducts ? (
                            <span className="text-teal-900 bg-teal-50 border-2 border-teal-600 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase inline-block">Todo el catálogo</span>
                          ) : (
                            <span className="text-indigo-900 bg-indigo-50 border-2 border-indigo-300 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase inline-block truncate max-w-full">
                              {coveredCount} específicos ({products.filter(p => coupon.applicableProductIds.includes(p.id)).map(p => p.name.split(' - ')[0]).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-black uppercase">
                      <div>
                        Asignado a: <strong className="text-slate-800 font-black text-xs">{coupon.assignedClientIds.length}</strong>
                      </div>
                      <div>
                        Usados: <span className="font-black text-emerald-850 bg-emerald-100/70 border border-emerald-400 px-2 py-0.5 rounded-full text-[10px]">{coupon.usedByClientIds.length}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
