import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Mail, CheckCircle, AlertCircle, Sparkles, Send, Filter, BellRing } from 'lucide-react';
import { Coupon, Client, EmailLog } from '../types';
import { simulateSendEmail } from '../utils/helpers';

interface CouponAssignerProps {
  coupons: Coupon[];
  clients: Client[];
  onAssignCouponToClients: (couponId: string, clientIds: string[], emailLogs: EmailLog[]) => void;
  emailLogs: EmailLog[];
}

export default function CouponAssigner({
  coupons,
  clients,
  onAssignCouponToClients,
  emailLogs,
}: CouponAssignerProps) {
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Only active coupons are eligible for registration and campaigns
  const activeCoupons = coupons.filter(c => c.active);

  const selectedCoupon = coupons.find(c => c.id === selectedCouponId);

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesRegion = regionFilter === 'All' || client.region === regionFilter;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const uniqueRegions = Array.from(new Set(clients.map(c => c.region)));

  const handleClientToggle = (clientId: string) => {
    setSelectedClientIds(prev =>
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const handleSelectVisibleClients = () => {
    const visibleIds = filteredClients.map(c => c.id);
    const allSelected = visibleIds.every(id => selectedClientIds.includes(id));

    if (allSelected) {
      setSelectedClientIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedClientIds(prev => {
        const union = new Set([...prev, ...visibleIds]);
        return Array.from(union);
      });
    }
  };

  const handleAssign = () => {
    if (!selectedCouponId) return;
    if (selectedClientIds.length === 0) return;

    // Generate mock SMTP/Webservice emails
    const logs: EmailLog[] = [];
    const clientIdsToAssign: string[] = [];

    selectedClientIds.forEach(clientId => {
      const client = clients.find(c => c.id === clientId);
      if (client && selectedCoupon) {
        // Prevent duplicate assignment if already assigned
        if (!selectedCoupon.assignedClientIds.includes(clientId)) {
          const emailLog = simulateSendEmail(client, selectedCoupon);
          logs.push(emailLog);
          clientIdsToAssign.push(clientId);
        }
      }
    });

    if (clientIdsToAssign.length === 0 && selectedCoupon) {
      alert('Todos los clientes seleccionados ya tienen este cupón asignado.');
      return;
    }

    onAssignCouponToClients(selectedCouponId, clientIdsToAssign, logs);
    setSelectedClientIds([]);
  };
  return (
    <div className="space-y-8" id="coupon-assigner-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-slate-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase italic">
            <Users className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            Asignación de Cupones a Clientes
          </h2>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Como vendedor, quiero asociar cupones activos a clientes específicos para campañas personalizadas y enviar notificaciones automáticas por mail.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Assignment Controls */}
        <div className="lg:col-span-8 bg-white border-4 border-slate-900 rounded-[32px] p-6 space-y-6 text-slate-800" style={{ boxShadow: '8px 8px 0px 0px var(--brand-secondary)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            {/* Coupon Picker */}
            <div>
              <label htmlFor="coupon-select" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                1. Seleccionar Cupón Activo
              </label>
              <select
                id="coupon-select"
                value={selectedCouponId}
                onChange={e => {
                  setSelectedCouponId(e.target.value);
                  setSelectedClientIds([]);
                }}
                className="w-full text-sm border-2 border-slate-900 bg-slate-50 p-3 rounded-xl focus:outline-hidden focus:bg-white transition-all cursor-pointer font-black text-slate-900"
              >
                <option value="">-- Seleccionar campaña activa --</option>
                {activeCoupons.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} (${c.discountAmount} ARS Off - Exp. {c.validityEnd})
                  </option>
                ))}
              </select>
              {activeCoupons.length === 0 && (
                <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1 leading-normal">
                  <AlertCircle className="w-3.5 h-3.5" /> No hay cupones activos actualmente. Cree uno en la pestaña anterior.
                </p>
              )}
            </div>

            {/* Campaign Summary Widget if selected */}
            <div className="border-2 border-slate-900 rounded-2xl p-4 text-xs text-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center" style={{ backgroundColor: 'var(--brand-bg)' }}>
              {selectedCoupon ? (
                <div className="space-y-1.5 font-bold">
                  <div className="flex items-center justify-between font-black uppercase" style={{ color: 'var(--brand-violet)' }}>
                    <span>Campaña: {selectedCoupon.code}</span>
                    <span className="text-white rounded px-2 py-0.5 text-[9px] uppercase tracking-wider" style={{ backgroundColor: 'var(--brand-violet)' }}>Activo</span>
                  </div>
                  <p className="mt-1">• Descuento: <span className="font-black" style={{ color: 'var(--brand-primary)' }}>${selectedCoupon.discountAmount} ARS</span></p>
                  <p>• Validez: <span className="font-semibold">{selectedCoupon.validityStart}</span> al <span className="font-semibold">{selectedCoupon.validityEnd}</span></p>
                  <p>• Clientes ya asignados en esta campaña: <span className="font-black" style={{ color: 'var(--brand-secondary)' }}>{selectedCoupon.assignedClientIds.length}</span></p>
                </div>
              ) : (
                <div className="text-slate-500 font-bold italic text-center py-2 uppercase tracking-wide">
                  Seleccione un cupón para iniciar la campaña de correos personalizados.
                </div>
              )}
            </div>
          </div>

          {/* Client Filter Controls */}
          <div className="border-t-2 border-slate-200 pt-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                2. Seleccionar Clientes Destinatarios
              </label>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Buscar por nombre o mail..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="px-3.5 py-2 text-xs border-2 border-slate-900 rounded-xl bg-slate-50 font-bold focus:outline-hidden focus:bg-white text-slate-900"
                />

                {/* Region Filter */}
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <Filter className="w-4 h-4 text-slate-900" />
                  <select
                    value={regionFilter}
                    onChange={e => setRegionFilter(e.target.value)}
                    className="border-2 border-slate-900 bg-white px-2.5 py-1.5 rounded-xl text-xs font-black text-slate-900"
                  >
                    <option value="All">Todas las Zonas</option>
                    {uniqueRegions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Client Lists Panel */}
            <div className="border-4 border-slate-900 rounded-2xl overflow-hidden max-h-80 overflow-y-auto shadow-inner" style={{ backgroundColor: 'var(--brand-bg)' }}>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#1E1B4B] text-white font-extrabold sticky top-0 z-10 border-b-4 border-slate-900 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredClients.length > 0 && filteredClients.every(c => selectedClientIds.includes(c.id))}
                        onChange={handleSelectVisibleClients}
                        disabled={!selectedCouponId}
                        className="rounded border-2 border-slate-900 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                        style={{ accentColor: 'var(--brand-primary)' }}
                      />
                    </th>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Correo Electrónico</th>
                    <th className="p-3">Zona Geográfica</th>
                    <th className="p-3 text-center">Estado del Cupón</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200">
                  {filteredClients.map(client => {
                    const isAssigned = selectedCoupon?.assignedClientIds.includes(client.id) || false;
                    const isUsed = selectedCoupon?.usedByClientIds.includes(client.id) || false;
                    const isChecked = selectedClientIds.includes(client.id);

                    return (
                      <tr
                        key={client.id}
                        className={`hover:bg-slate-100 transition-all ${
                          isAssigned ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-800'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked || isAssigned}
                            disabled={!selectedCouponId || isAssigned}
                            onChange={() => handleClientToggle(client.id)}
                            className="rounded border-2 border-slate-900 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                            style={{ accentColor: 'var(--brand-primary)' }}
                          />
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {client.name}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-500">
                          {client.email}
                        </td>
                        <td className="p-3 text-slate-700 font-bold">
                          {client.region}
                        </td>
                        <td className="p-3 text-center">
                          {isUsed ? (
                            <span className="bg-emerald-100 text-emerald-850 border-2 border-emerald-600 px-3 py-1 rounded-full font-black text-[10px] uppercase">
                              Usado (Pago OK)
                            </span>
                          ) : isAssigned ? (
                            <span className="bg-indigo-100 text-indigo-900 border-2 border-indigo-500 px-3 py-1 rounded-full font-black text-[10px] uppercase">
                              Asignado (Mail OK)
                            </span>
                          ) : (
                            <span className="text-slate-450 font-bold ml-1 uppercase text-[10px]">Sin Campaña</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-bold italic bg-white uppercase">
                        No se encontraron clientes para los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action trigger */}
          <div className="flex items-center justify-between border-t-2 border-slate-200 pt-4">
            <div className="text-xs text-slate-500 font-bold">
              {selectedClientIds.length > 0 ? (
                <span>
                  Seleccionados: <strong className="text-indigo-600 font-black text-sm">{selectedClientIds.length}</strong> clientes nuevos para asignar.
                </span>
              ) : (
                <span>Seleccione un cupón y los destinatarios para iniciar.</span>
              )}
            </div>

            <button
              onClick={handleAssign}
              disabled={!selectedCouponId || selectedClientIds.length === 0}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                (!selectedCouponId || selectedClientIds.length === 0)
                  ? 'bg-slate-350 text-slate-500 border-2 border-slate-400 cursor-not-allowed'
                  : 'text-white border-b-4 border-black/30 active:translate-y-1 active:border-b-0'
              }`}
              style={(!selectedCouponId || selectedClientIds.length === 0) ? {} : { backgroundColor: 'var(--brand-secondary)' }}
            >
              <Send className="w-3.5 h-3.5" />
              Asociar Clientes y Enviar Correos
            </button>
          </div>
        </div>

        {/* Email Mailroom Monitor */}
        <div className="lg:col-span-4 bg-slate-900 border-4 border-slate-900 rounded-[32px] p-5 text-slate-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-xs font-mono font-black tracking-widest uppercase" style={{ color: 'var(--brand-accent)' }}>
                Log de Correos SMTP
              </h3>
            </div>
            <span className="bg-slate-950 text-emerald-400 border border-emerald-500 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-sm">
              LIVE STREAM
            </span>
          </div>

          {/* Emails list container */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 font-mono text-[11px] scrollbar-thin">
            {emailLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3 p-4">
                <BellRing className="w-7 h-7 text-slate-700" />
                <p className="font-bold text-slate-400 uppercase tracking-wider">Ningún correo saliente emitido aún.</p>
                <p className="text-[10px] text-slate-600 leading-normal">
                  Asocie un cupón activo a clientes para ver los despachos Web Service en tiempo real.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {emailLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-slate-950 border-l-4 border-emerald-500 p-3 rounded-r-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Para: {log.recipientEmail}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-emerald-300 font-bold truncate">
                      Asunto: {log.subject}
                    </div>
                    <div className="text-slate-400 line-clamp-3 bg-slate-900/40 p-2 rounded text-[10px] leading-relaxed whitespace-pre-wrap font-sans">
                      {log.body}
                    </div>
                    <div className="text-[9px] text-emerald-500 flex items-center gap-1.5 pt-0.5 font-black uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3 text-[#00E5FF]" /> SMTP: Sent (Status 200 OK)
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
