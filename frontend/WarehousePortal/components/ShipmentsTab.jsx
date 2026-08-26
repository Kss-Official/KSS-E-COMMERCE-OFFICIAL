import React, { useState, useEffect, useMemo } from 'react';
import { Truck, RefreshCw, Check, Search, CheckCircle2, PackageCheck, Building2 } from 'lucide-react';
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
    const term = searchTerm.toLowerCase();
    return (
      (s.shipment_id || '').toLowerCase().includes(term) ||
      (s.courier_partner || '').toLowerCase().includes(term) ||
      (s.destination_hub || '').toLowerCase().includes(term) ||
      (s.item_title || '').toLowerCase().includes(term)
    );
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

  const statusChip = (status) => {
    if (status === 'Dispatched') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Ready for Pickup') return 'bg-blue-100 text-blue-800';
    return 'bg-amber-100 text-amber-800';
  };

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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Courier Manifests &amp; Shipments</h2>
          <p className="text-sm text-gray-500 font-medium">Handover sheets grouped by logistics partner, with live dispatch status.</p>
        </div>
        <button
          onClick={loadShipments}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Live counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Total Shipments</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{shipments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Units in Manifests</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{totalUnits.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Awaiting Handover</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{awaitingPickup}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
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

      {manifests.map((manifest) => (
        <div key={manifest.courier} className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">{manifest.courier}</h3>
                <p className="text-[11px] font-semibold text-gray-400">
                  {manifest.rows.length} shipment(s) &middot; {manifest.units.toLocaleString('en-IN')} units
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-500">
              Dispatched: <span className="text-emerald-700">{manifest.dispatched}</span> / {manifest.rows.length}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {manifest.rows.map((row) => (
              <div key={row.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{row.item_title}</p>
                  <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                    <span className="font-mono text-blue-900">{row.shipment_id}</span> &middot; {row.destination_hub} &middot; {row.quantity} unit(s)
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${statusChip(row.status)}`}>
                    {row.status}
                  </span>
                  {row.status === 'Dispatched' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Handed Over
                    </span>
                  ) : (
                    <button
                      onClick={() => applyAction(row, row.status === 'Ready for Pickup' ? 'dispatch' : 'pack')}
                      disabled={busyId === row.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <PackageCheck className="w-3 h-3" />
                      <span>
                        {busyId === row.id
                          ? 'Updating...'
                          : row.status === 'Ready for Pickup'
                            ? 'Hand Over'
                            : 'Mark Packed'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
