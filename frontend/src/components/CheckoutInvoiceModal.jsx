import React from 'react';
import { CheckCircle, Printer, Download, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const CheckoutInvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Invoice Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-8 h-8 animate-bounce" />
          </div>
          
          <span className="bg-rose-500/20 text-rose-300 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-rose-500/30">
            Order Confirmed &amp; Invoiced
          </span>
          <h3 className="font-serif-luxury text-2xl font-bold mt-2">Thank You For Your Order!</h3>
          <p className="text-xs text-slate-300 mt-1">
            Order ID: <span className="font-mono font-bold text-amber-300">{invoice.orderId}</span>
          </p>
        </div>

        {/* Invoice Body Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-slate-800">
          
          {/* Order Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Customer Name</p>
              <p className="font-bold text-slate-900">{invoice.customer.name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Date &amp; Time</p>
              <p className="font-bold text-slate-900">
                {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Est. Delivery</p>
              <p className="font-bold text-emerald-600">{invoice.estimatedDelivery}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Itemized Invoice Breakdown
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-2 text-center">Size</th>
                    <th className="py-3 px-2 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold">{item.selectedSize}</td>
                      <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold font-mono">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Charges Box */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-mono">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>GST (5%)</span>
              <span className="font-mono">₹{invoice.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Shipping Fee</span>
              <span className="font-mono">
                {invoice.shippingFee === 0 ? (
                  <span className="text-emerald-400 font-bold">FREE</span>
                ) : (
                  `₹${invoice.shippingFee}`
                )}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-3 mt-2 flex justify-between items-baseline text-sm font-bold">
              <span className="text-white text-base">Grand Total Paid</span>
              <span className="text-2xl font-extrabold text-rose-400 font-mono">
                ₹{invoice.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Digital Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
