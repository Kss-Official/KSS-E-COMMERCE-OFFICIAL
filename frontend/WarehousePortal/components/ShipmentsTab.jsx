import React, { useState, useEffect, useMemo } from 'react';
import { Truck, Search, CheckCircle2, PackageCheck, Building2, ShieldCheck, ArrowUpFromLine, Check, Package } from 'lucide-react';
import {
  fetchWarehouseOutboundApi,
  packOutboundShipmentApi,
  dispatchOutboundShipmentApi
} from '../../src/services/api';

export default function ShipmentsTab() {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'AWAITING', 'DISPATCHED'

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadShipments = async () => {
    setIsLoading(true);
    const { apiOutbound } = await fetchWarehouseOutboundApi();
    setShipments(Array.isArray(apiOutbound) ? apiOutbound : []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const applyAction = async (row, kind) => {
    setBusyId(row.id);
    const res =
      kind === 'pack' ? await packOutboundShipmentApi(row.id) : await dispatchOutboundShipmentApi(row.id);
    setBusyId(null);

    if (res?.status === 'success') {
      setShipments((prev) => prev.map((s) => (s.id === row.id ? { ...s, ...res.data } : s)));
      notify(res.message || 'Shipment updated.');
    } else {
      notify(res?.message || 'Could not update this shipment.');
    }
  };

  const filtered = shipments.filter((s) => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'AWAITING' && s.status !== 'Dispatched') ||
      (statusFilter === 'DISPATCHED' && s.status === 'Dispatched');

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (s.shipment_id || '').toLowerCase().includes(term) ||
      (s.courier_partner || '').toLowerCase().includes(term) ||
      (s.destination_hub || '').toLowerCase().includes(term) ||
      (s.item_title || '').toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  // Courier manifest — one card per logistics partner.
  const manifests = useMemo(() => {
    const byCourier = new Map();
    filtered.forEach((s) => {
      const key = s.courier_partner || 'Unassigned Courier';
      if (!byCourier.has(key)) {
        byCourier.set(key, { courier: key, rows: [], units: 0, dispatched: 0 });
      }
      const bucket = byCourier.get(key);
      bucket.rows.push(s);
      bucket.units += Number(s.quantity || 0);
      if (s.status === 'Dispatched') bucket.dispatched += 1;
    });
    return [...byCourier.values()].sort((a, b) => b.rows.length - a.rows.length);
  }, [filtered]);

  const totalUnits = shipments.reduce((acc, s) => acc + Number(s.quantity || 0), 0);
  const awaitingPickup = shipments.filter((s) => s.status !== 'Dispatched').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold z-50 flex items-center space-x-2">
          <Check className="w-4 h-4 text-blue-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Courier Manifests &amp; Handover Sheets</h2>
          <p className="text-sm text-gray-500 font-medium">Grouped by logistics partner, with real-time dispatch progress and handover verification.</p>
        </div>
      </div>

      {/* Interactive Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Total Manifest Shipments</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{shipments.length}</p>
        </button>

        <button
          onClick={() => setStatusFilter('ALL')}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Total Units in Manifests</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{totalUnits.toLocaleString('en-IN')}</p>
        </button>

        <button
          onClick={() => setStatusFilter('AWAITING')}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            statusFilter === 'AWAITING' ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Awaiting Courier Handover</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{awaitingPickup}</p>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courier, shipment ID, hub..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>
      </div>

      {isLoading && shipments.length === 0 && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs animate-pulse space-y-3">
              <div className="h-4 w-1/4 bg-gray-100 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && manifests.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-xs text-center">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900">No shipments to hand over</h4>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {searchTerm ? 'Nothing matched that search.' : 'Create shipments from the Outbound tab to build a manifest.'}
          </p>
        </div>
      )}

      {manifests.map((manifest) => {
        const percentDispatched = manifest.rows.length > 0 ? Math.round((manifest.dispatched / manifest.rows.length) * 100) : 0;
        return (
          <div key={manifest.courier} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Courier Manifest Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-xl bg-white/10 text-blue-300 backdrop-blur-xs">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight text-white">{manifest.courier}</h3>
                  <p className="text-xs font-semibold text-gray-300 mt-0.5">
                    {manifest.rows.length} Shipment Manifest(s) &middot; {manifest.units.toLocaleString('en-IN')} Total Units
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span className="text-gray-300">Dispatch Progress:</span>
                  <span className="text-emerald-400 font-black text-sm">{manifest.dispatched} / {manifest.rows.length}</span>
                  <span className="text-gray-400 text-[11px]">({percentDispatched}%)</span>
                </div>
                <div className="w-36 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentDispatched}%` }}></div>
                </div>
              </div>
            </div>

            {/* Shipment Rows List */}
            <div className="divide-y divide-gray-100">
              {manifest.rows.map((row) => {
                const isDispatched = row.status === 'Dispatched';
                const isReady = row.status === 'Ready for Pickup';

                return (
                  <div key={row.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/20 transition-colors">
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isDispatched ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-gray-900 leading-snug">{row.item_title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                          <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-md font-mono font-bold border border-gray-200">
                            {row.shipment_id}
                          </span>
                          <span>&middot;</span>
                          <span className="text-gray-700">Hub: <strong>{row.destination_hub}</strong></span>
                          <span>&middot;</span>
                          <span className="text-gray-700">Quantity: <strong>{row.quantity} units</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                          isDispatched
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isReady
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {row.status}
                      </span>

                      {isDispatched ? (
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Handed Over</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => applyAction(row, isReady ? 'dispatch' : 'pack')}
                          disabled={busyId === row.id}
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-md cursor-pointer transition-all ${
                            isReady
                              ? 'bg-[#ff5100] hover:bg-[#e64900] shadow-orange-500/20'
                              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                          } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>
                            {busyId === row.id
                              ? 'Updating...'
                              : isReady
                                ? 'Hand Over to Courier'
                                : 'Mark Packed & Ready'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
