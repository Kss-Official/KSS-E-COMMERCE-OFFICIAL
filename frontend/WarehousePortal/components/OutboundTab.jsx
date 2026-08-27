import React, { useState, useEffect } from 'react';
import { Search, ArrowUpFromLine, Truck, CheckCircle2, RefreshCw, Check, PackageCheck, Box } from 'lucide-react';
import {
  fetchWarehouseOutboundApi,
  fetchWarehouseOrderQueueApi,
  packOutboundShipmentApi,
  dispatchOutboundShipmentApi,
  createOutboundShipmentApi,
  updateOrderStatusApi
} from '../../src/services/api';

export default function OutboundTab() {
  const [items, setItems] = useState([]);
  const [packQueue, setPackQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadOutbound = async () => {
    setIsLoading(true);
    try {
      const [{ apiOutbound, localOrders }, orders] = await Promise.all([
        fetchWarehouseOutboundApi(),
        fetchWarehouseOrderQueueApi()
      ]);

      let combinedItems = Array.isArray(apiOutbound) ? [...apiOutbound] : [];

      // Include local placed orders in outbound list if not already present
      if (Array.isArray(localOrders)) {
        localOrders.forEach((lo) => {
          const idStr = `SHP-${lo.orderId || lo.id}`;
          if (!combinedItems.some((ci) => ci.shipment_id === idStr || ci.id === lo.orderId)) {
            const itemsList = lo.items || [];
            const firstItem = itemsList[0]?.name || itemsList[0]?.title || itemsList[0]?.product_title || 'Order Package';
            combinedItems.push({
              id: lo.orderId || lo.id,
              shipment_id: idStr,
              destination_hub: `${lo.address?.details?.split(',')[0] || lo.shipping_city || 'Central'} Hub`,
              item_title: `${firstItem}${itemsList.length > 1 ? ` (+${itemsList.length - 1} items)` : ''}`,
              sku: lo.orderId || `ORD-${lo.id}`,
              quantity: itemsList.reduce((acc, i) => acc + (parseInt(i.quantity, 10) || 1), 0),
              courier_partner: 'BuyZo Express Logistics',
              status: lo.status === 'SHIPPED' ? 'Dispatched' : 'Ready for Pickup',
              created_at: lo.orderDate || 'Today'
            });
          }
        });
      }

      setItems(combinedItems);

      // Real customer orders still sitting in the warehouse pack queue before dispatch.
      const isQueueStatus = (st) =>
        ['PENDING', 'CONFIRMED', 'PROCESSING', 'ORDER CONFIRMED', 'NEW'].includes(String(st || '').toUpperCase());

      const queue = (Array.isArray(orders) ? orders : [])
        .filter((o) => isQueueStatus(o.status))
        .map((o) => {
          const itemsList = o.items || [];
          const firstItem = itemsList[0]?.product_title || itemsList[0]?.name || itemsList[0]?.title || 'Order Item';
          const totalQty = itemsList.reduce((acc, i) => acc + (parseInt(i.quantity, 10) || 1), 0);
          return {
            key: o.id || o.order_number,
            orderDbId: o.id,
            orderNumber: o.order_number || o.orderId,
            destination: `${o.shipping_city || o.address?.details?.split(',')[0] || 'Central'} Hub`,
            item: `${firstItem}${itemsList.length > 1 ? ` +${itemsList.length - 1} more` : ''}`,
            qty: totalQty,
            date: o.formatted_date || o.orderDate || 'Recent'
          };
        });
      setPackQueue(queue);
    } catch (err) {
      console.error('Error loading warehouse outbound:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadOutbound();
  }, []);

  const handlePack = async (row) => {
    setBusyId(row.id);
    const res = await packOutboundShipmentApi(row.id);
    setBusyId(null);
    if (res?.status === 'success') {
      setItems((prev) => prev.map((i) => (i.id === row.id ? { ...i, ...res.data } : i)));
      notify(res.message || 'Shipment packed and ready for pickup.');
    } else {
      notify(res?.message || 'Could not pack this shipment.');
    }
  };

  const handleDispatch = async (row) => {
    setBusyId(row.id);
    const res = await dispatchOutboundShipmentApi(row.id);
    setBusyId(null);
    if (res?.status === 'success') {
      setItems((prev) => prev.map((i) => (i.id === row.id ? { ...i, ...res.data } : i)));
      notify(res.message || 'Shipment handed over to the courier.');
    } else {
      notify(res?.message || 'Could not dispatch this shipment.');
    }
  };

  // Creates a real OutboundShipment for a pending order and marks the order
  // SHIPPED so the customer's Orders page and Delivery portal both see it.
  const handleCreateShipment = async (order) => {
    setBusyId(order.key);
    const res = await createOutboundShipmentApi({
      destination_hub: order.destination,
      item_title: order.item,
      sku: order.orderNumber,
      quantity: order.qty,
      courier_partner: 'BuyZo Express Logistics',
      status: 'Packing In Progress'
    });

    if (res?.status === 'success') {
      if (order.orderDbId) await updateOrderStatusApi(order.orderDbId, 'SHIPPED');
      setItems((prev) => [res.data, ...prev]);
      setPackQueue((prev) => prev.filter((o) => o.key !== order.key));
      notify(`Shipment created for order ${order.orderNumber}.`);
    } else {
      notify(res?.message || 'Could not create this shipment.');
    }
    setBusyId(null);
  };

  const filtered = items.filter((i) => {
    const term = searchTerm.toLowerCase();
    return (
      (i.shipment_id || '').toLowerCase().includes(term) ||
      (i.destination_hub || '').toLowerCase().includes(term) ||
      (i.item_title || '').toLowerCase().includes(term) ||
      (i.courier_partner || '').toLowerCase().includes(term)
    );
  });

  const dispatchedCount = items.filter((i) => i.status === 'Dispatched').length;
  const statusChip = (status) => {
    if (status === 'Dispatched') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Ready for Pickup') return 'bg-blue-100 text-blue-800';
    return 'bg-amber-100 text-amber-800';
  };

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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Outbound Packing &amp; Shipments</h2>
          <p className="text-sm text-gray-500 font-medium">Process outgoing customer orders, packing slips, and courier manifest handover.</p>
        </div>
        <button
          onClick={loadOutbound}
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
            <ArrowUpFromLine className="w-4 h-4 text-blue-600" />
            <span>Total Shipments</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{items.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Dispatched</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{dispatchedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Box className="w-4 h-4 text-amber-600" />
            <span>Orders Awaiting Shipment</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{packQueue.length}</p>
        </div>
      </div>

      {/* Orders that still need a shipment record */}
      {packQueue.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center space-x-2">
            <PackageCheck className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-base text-gray-900">Orders Awaiting Shipment</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {packQueue.map((order) => (
              <div key={order.key} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{order.item}</p>
                  <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                    Order {order.orderNumber} &middot; {order.destination} &middot; {order.qty} unit(s)
                  </p>
                </div>
                <button
                  onClick={() => handleCreateShipment(order)}
                  disabled={busyId === order.key}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {busyId === order.key ? 'Creating...' : 'Create Shipment'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shipment ID, hub..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Shipment ID</th>
                <th className="py-3.5 px-6">Destination Hub</th>
                <th className="py-3.5 px-6">Item / SKU</th>
                <th className="py-3.5 px-6">Quantity</th>
                <th className="py-3.5 px-6">Courier Partner</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && items.length === 0 && (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center">
                    <ArrowUpFromLine className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">No outbound shipments</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? 'Nothing matched that search.' : 'Create a shipment from the order queue above.'}
                    </p>
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">{item.shipment_id}</td>
                  <td className="py-4 px-6 font-bold text-gray-900 text-xs">{item.destination_hub}</td>
                  <td className="py-4 px-6 text-gray-700 font-semibold text-xs">
                    <span className="line-clamp-1">{item.item_title}</span>
                    {item.sku && (
                      <span className="block text-[11px] font-mono text-gray-400 mt-0.5">{item.sku}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-extrabold text-gray-900">{item.quantity}</td>
                  <td className="py-4 px-6 text-gray-600 font-bold text-xs">{item.courier_partner}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${statusChip(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {item.status === 'Dispatched' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Handed Over
                      </span>
                    ) : item.status === 'Ready for Pickup' ? (
                      <button
                        onClick={() => handleDispatch(item)}
                        disabled={busyId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#063328] hover:bg-[#ff5100] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Truck className="w-3 h-3" />
                        <span>{busyId === item.id ? 'Dispatching...' : 'Dispatch'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePack(item)}
                        disabled={busyId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <PackageCheck className="w-3 h-3" />
                        <span>{busyId === item.id ? 'Packing...' : 'Mark Packed'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
