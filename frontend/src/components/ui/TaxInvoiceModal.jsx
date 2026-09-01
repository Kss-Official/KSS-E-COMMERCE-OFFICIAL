import React, { useRef } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  User,
  ShoppingBag,
  CreditCard,
  Check,
  Headphones,
  RotateCcw,
  Gift,
  Share2,
  Globe,
  MessageCircle
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { getProductImage } from '../../utils/productAssets';

export default function TaxInvoiceModal({ isOpen, onClose, orderData }) {
  const invoiceRef = useRef(null);

  if (!isOpen || !orderData) return null;

  // Extract / calculate dynamic order properties with safe defaults
  const orderId = orderData.orderId || orderData.order_number || orderData.id || '#BZ61439954';
  const cleanNum = String(orderId).replace('#', '');
  const invoiceNo = orderData.invoiceNo || `#BZ${cleanNum.slice(-8) || '61439954'}`;
  const invoiceDate = orderData.orderDate || orderData.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const paymentMethod = (orderData.paymentMethod || orderData.payment_method || 'UPI').toUpperCase();
  const transactionId = orderData.transactionId || orderData.txn_id || `TXN${cleanNum.slice(-10).toUpperCase() || '8F29A91X2G'}`;
  
  // Customer & Shipping Address
  const customerName = orderData.address?.name || orderData.shipping_name || orderData.customerName || 'Prahlad';
  const customerAddress = orderData.address?.details || orderData.shipping_address || '232, Bengaluru, Karnataka 560044, India';
  const customerPhone = orderData.address?.phone || orderData.shipping_phone || '8527949523';
  const customerEmail = orderData.address?.email || orderData.email || `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

  // Items List
  const rawItems = Array.isArray(orderData.items) && orderData.items.length > 0 ? orderData.items : [
    { name: 'Noise ColorFit Pro 5', variant: 'Smartwatch (Black)', sku: 'NC-PRO5-BLK', quantity: 1, price: 3499, discount: 500, tax: 0, image: getProductImage('Noise ColorFit Pro 5') },
    { name: 'Sony WH-CH510', variant: 'Wireless Headphones (Black)', sku: 'SONY-WHCH510', quantity: 1, price: 2499, discount: 0, tax: 0, image: getProductImage('Sony Headphones') },
    { name: 'Atomic Habits', variant: 'by James Clear (Paperback)', sku: 'BOOK-AH-01', quantity: 2, price: 399, discount: 0, tax: 0, image: getProductImage('Atomic Habits') }
  ];

  // Price calculations
  const parsedTotal = parseFloat(String(orderData.totalPaid || orderData.total_amount || 0).replace(/,/g, ''));
  
  const items = rawItems.map((item, idx) => {
    const qty = Number(item.quantity || item.qty || 1);
    const unitPrice = parseFloat(String(item.unitPrice || item.price || 0).replace(/,/g, ''));
    const discount = parseFloat(String(item.discount || 0).replace(/,/g, ''));
    const lineTotal = unitPrice * qty - discount;
    const itemSku = item.sku || `SKU-BUYZO-${idx + 101}`;
    const variant = item.variant || item.selectedColor || item.selected_color || 'Standard';
    const imgUrl = item.image || getProductImage(item.name);

    return {
      num: idx + 1,
      name: item.name,
      variant,
      sku: itemSku,
      quantity: qty,
      unitPrice,
      discount,
      tax: Math.round(lineTotal * 0.18),
      lineTotal,
      image: imgUrl
    };
  });

  const itemTotal = items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
  const totalDiscount = items.reduce((acc, it) => acc + it.discount, 0);
  const subtotal = itemTotal - totalDiscount;
  const totalTax = Math.round(subtotal * 0.18);
  const finalTotal = parsedTotal > 0 ? parsedTotal : subtotal;

  // Delivery status timeline mapping
  const currentDeliveryStatus = orderData.deliveryStatus || orderData.status || 'Delivered';

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      window.print();
      return;
    }

    // Collect existing styles and links to preserve full Tailwind styling
    let stylesHtml = '';
    try {
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((sheet) => {
        if (sheet.href) {
          stylesHtml += `<link rel="stylesheet" href="${sheet.href}">`;
        } else {
          try {
            const rules = Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
            stylesHtml += `<style>${rules}</style>`;
          } catch (e) {}
        }
      });
    } catch (e) {}

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>BuyZo Tax Invoice - ${orderId}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          ${stylesHtml}
          <style>
            @media print {
              body { background: white !important; margin: 0 !important; padding: 0 !important; }
              .no-print, .print\\:hidden { display: none !important; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body className="bg-white p-6 font-sans text-gray-900">
          <div style="max-width: 900px; margin: 0 auto;">
            ${printContent.innerHTML}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }, 400);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const verificationUrl = `https://buyzo.com/verify-invoice?id=${cleanNum}`;
  const qrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:block">
      {/* Container Box */}
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 my-auto print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-emerald-950 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">BuyZo Official Tax Invoice &amp; Payment Receipt</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INVOICE CONTENT DOCUMENT (A4 printable canvas) */}
        <div ref={invoiceRef} className="p-6 sm:p-10 font-sans text-gray-900 bg-white space-y-6 print:p-4">
          
          {/* ================= 1. HEADER ================= */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-gray-200 gap-4">
            {/* LEFT: Logo & Company Legal */}
            <div>
              <div className="flex items-center space-x-2">
                <img src={logoImg} alt="BuyZo" className="h-9 w-auto object-contain" />
              </div>
              <p className="text-[11px] font-extrabold text-brand-800 tracking-wider uppercase mt-1">BuyZo E-Commerce Pvt. Ltd.</p>
              <div className="text-[11px] text-gray-500 font-semibold space-x-3 mt-0.5">
                <span>GSTIN: <strong>07AACB1234F1Z5</strong></span>
                <span>•</span>
                <span>PAN: <strong>AACB1234F</strong></span>
                <span>•</span>
                <span>CIN: <strong>U74999KA2025PTC123456</strong></span>
              </div>
            </div>

            {/* CENTER: Tax Invoice Title */}
            <div className="text-left sm:text-center">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">TAX INVOICE</h1>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5">Original for Recipient</p>
            </div>

            {/* RIGHT: Invoice Meta & Paid Badge */}
            <div className="text-left sm:text-right space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>PAID • VERIFIED</span>
              </div>
              <div className="text-xs font-black text-gray-900">Invoice No: <span className="text-brand-900 font-extrabold">{invoiceNo}</span></div>
              <div className="text-[11px] font-medium text-gray-500">Invoice Date: <strong>{invoiceDate}</strong></div>
            </div>
          </div>

          {/* ================= 2. BILLING / SHIPPING / ORDER INFO CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CARD 1 — BILLED TO */}
            <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 uppercase tracking-wider mb-1">
                <User className="w-4 h-4 text-brand-800" />
                <span>BILLED TO</span>
              </div>
              <p className="text-xs font-bold text-gray-900">{customerName}</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">{customerAddress}</p>
              <p className="text-[11px] text-gray-600 font-medium pt-1">Phone: <strong>{customerPhone}</strong></p>
              <p className="text-[11px] text-gray-600 font-medium">Email: <strong>{customerEmail}</strong></p>
            </div>

            {/* CARD 2 — SHIPPED TO */}
            <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4 text-brand-800" />
                <span>SHIPPED TO</span>
              </div>
              <p className="text-xs font-bold text-gray-900">{customerName}</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">{customerAddress}</p>
              <p className="text-[11px] text-gray-600 font-medium pt-1">Phone: <strong>{customerPhone}</strong></p>
            </div>

            {/* CARD 3 — ORDER & PAYMENT */}
            <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 uppercase tracking-wider mb-1">
                <ShoppingBag className="w-4 h-4 text-brand-800" />
                <span>ORDER &amp; PAYMENT</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600">
                <span>Order ID:</span>
                <strong className="text-gray-900 font-extrabold">{orderId}</strong>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600">
                <span>Order Date:</span>
                <strong className="text-gray-900 font-semibold">{invoiceDate}</strong>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600">
                <span>Payment Method:</span>
                <strong className="text-gray-900 font-bold uppercase">{paymentMethod}</strong>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600">
                <span>Transaction ID:</span>
                <strong className="text-gray-900 font-mono text-[10px]">{transactionId}</strong>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600 pt-0.5">
                <span>Payment Status:</span>
                <strong className="text-emerald-700 font-extrabold">✓ Paid</strong>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600">
                <span>Delivery Status:</span>
                <strong className="text-emerald-700 font-bold">{currentDeliveryStatus}</strong>
              </div>
            </div>
          </div>

          {/* ================= 3. PRODUCT TABLE ================= */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#063328] text-white text-[11px] font-black uppercase tracking-wider">
                    <th className="py-3 px-3.5 text-center w-10">#</th>
                    <th className="py-3 px-4">PRODUCT</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3 text-center">QTY</th>
                    <th className="py-3 px-3 text-right">UNIT PRICE</th>
                    <th className="py-3 px-3 text-right">DISCOUNT</th>
                    <th className="py-3 px-3 text-right">TAX (18%)</th>
                    <th className="py-3 px-4 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/80 text-xs">
                  {items.map((it) => (
                    <tr key={it.num} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold text-gray-500">{it.num}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-200 p-0.5 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{it.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{it.variant}</p>
                            <p className="text-[10px] text-gray-400 font-mono">SKU: {it.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-gray-600">{it.sku}</td>
                      <td className="py-3 px-3 text-center font-bold text-gray-900">{it.quantity}</td>
                      <td className="py-3 px-3 text-right font-medium text-gray-700">₹{it.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-bold text-amber-600">
                        {it.discount > 0 ? `-₹${it.discount.toLocaleString('en-IN')}` : '-₹0'}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-600 font-medium">₹{it.tax.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-black text-gray-900">₹{it.lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= 4. PRICE BREAKDOWN ================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-1">
            {/* LEFT: Payment Information */}
            <div className="md:col-span-6 bg-emerald-50/30 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-black text-emerald-950 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>PAYMENT INFORMATION</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 bg-emerald-100/90 text-emerald-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                <span>Payment Successful</span>
              </div>
              <div className="text-xs space-y-1 pt-1 text-gray-700 font-medium">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <strong className="text-gray-900 font-bold uppercase">{paymentMethod}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <strong className="text-gray-900 font-mono text-[11px]">{transactionId}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Paid On:</span>
                  <strong className="text-gray-900 font-semibold">{invoiceDate}</strong>
                </div>
                <div className="flex justify-between border-t border-emerald-200/60 pt-1.5">
                  <span>Paid Amount:</span>
                  <strong className="text-brand-900 font-black text-sm">₹{finalTotal.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* RIGHT: Price Summary */}
            <div className="md:col-span-6 bg-gray-50/70 border border-gray-200/90 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2">PRICE SUMMARY</div>
              <div className="text-xs space-y-1.5 text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>Item Total:</span>
                  <span className="font-bold text-gray-900">₹{itemTotal.toLocaleString('en-IN')}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-bold">
                    <span>Coupon Discount:</span>
                    <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Includes GST (18%):</span>
                  <span>₹{totalTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Shipping Fee:</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-300/80 pt-2 mt-1">
                  <span className="text-xs font-black text-gray-900 uppercase">TOTAL AMOUNT PAID:</span>
                  <span className="text-xl font-black text-emerald-700 tracking-tight">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 5. ORDER TRACKING & 6. QR CODE ================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50/60 border border-gray-200/80 rounded-2xl p-4">
            {/* LEFT: Horizontal Timeline (8 cols) */}
            <div className="md:col-span-8">
              <div className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">ORDER TRACKING</div>
              <div className="flex items-center justify-between relative px-2">
                {[
                  { title: 'Ordered', date: 'Order Confirmed', completed: true },
                  { title: 'Paid', date: 'Payment Verified', completed: true },
                  { title: 'Packed', date: 'Packed at Warehouse', completed: true },
                  { title: 'Shipped', date: 'Dispatched via Courier', completed: true },
                  { title: 'Delivered', date: 'Delivered Safely', completed: true }
                ].map((step) => (
                  <div key={step.title} className="flex-1 flex flex-col items-center text-center relative z-10">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs mb-1">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-[11px] font-black text-gray-900">{step.title}</span>
                    <span className="text-[9px] text-gray-500 font-medium hidden sm:inline">{step.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: QR Code Verification (4 cols) */}
            <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-4 flex items-center space-x-3">
              <img
                src={qrCodeImg}
                alt="QR Code Verification"
                className="w-16 h-16 rounded-xl border border-gray-300 p-1 shrink-0 bg-white"
              />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-900 tracking-wider">SCAN TO VIEW ORDER DETAILS</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Scan to verify invoice or view order</p>
                <p className="text-[10px] font-bold text-brand-800 underline mt-0.5">buyzo.com/track</p>
              </div>
            </div>
          </div>

          {/* ================= 7. RETURN, 8. SUPPORT, 9. THANK YOU CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Return & Warranty */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 uppercase tracking-wider mb-1">
                <RotateCcw className="w-4 h-4 text-brand-800" />
                <span>RETURN &amp; WARRANTY</span>
              </div>
              <ul className="text-[11px] text-gray-600 space-y-1 font-medium pl-1">
                <li>• 7 Days Easy Return</li>
                <li>• 1 Year Warranty on Electronics</li>
                <li>• For books, return allowed within 7 days of delivery</li>
              </ul>
              <a href="#return-policy" onClick={(e) => e.preventDefault()} className="text-[11px] font-extrabold text-accent hover:underline block pt-1">
                View Return Policy ➔
              </a>
            </div>

            {/* Card 2: Need Help */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 uppercase tracking-wider mb-1">
                <Headphones className="w-4 h-4 text-brand-800" />
                <span>NEED HELP?</span>
              </div>
              <p className="text-[11px] text-gray-500 font-semibold">We are here for you!</p>
              <div className="text-[11px] text-gray-700 font-medium space-y-0.5">
                <p>✉️ help@buyzo.com</p>
                <p>📞 1800-123-4567</p>
                <p>🕒 Mon - Sun (9 AM - 9 PM)</p>
              </div>
              <a href="#help-center" onClick={(e) => e.preventDefault()} className="text-[11px] font-extrabold text-accent hover:underline block pt-1">
                Visit Help Center ➔
              </a>
            </div>

            {/* Card 3: Thank You */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 uppercase tracking-wider mb-1">
                <Gift className="w-4 h-4 text-brand-800" />
                <span>THANK YOU!</span>
              </div>
              <p className="text-[11px] text-gray-600 font-medium">Thank you for shopping with BuyZo. We hope you love your purchase.</p>
              <p className="text-xs font-black text-brand-800 italic">"Shop More. Save More."</p>
              <div className="flex items-center space-x-3 text-gray-400 pt-1">
                <Globe className="w-4 h-4 hover:text-emerald-700 cursor-pointer" />
                <MessageCircle className="w-4 h-4 hover:text-emerald-700 cursor-pointer" />
                <Share2 className="w-4 h-4 hover:text-emerald-700 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* ================= 10. FOOTER ================= */}
          <div className="bg-[#063328] text-white rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center text-[11px] gap-2">
            <div className="flex items-center space-x-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>BuyZo E-Commerce Pvt. Ltd. | GSTIN: 07AACB1234F1Z5 | PAN: AACB1234F | CIN: U74999KA2025PTC123456</span>
            </div>
            <div className="text-[10px] text-emerald-200/80 italic text-center sm:text-right">
              This is a computer-generated invoice and does not require a physical signature.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
