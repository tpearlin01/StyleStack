import { CheckCircle, Printer, Home } from 'lucide-react';

export const CheckoutInvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 text-white animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Invoice Header */}
        <div className="bg-zinc-950 p-6 text-white text-center relative overflow-hidden border-b border-zinc-800">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <CheckCircle className="w-8 h-8 animate-bounce" />
          </div>
          
          <span className="bg-rose-500/20 text-rose-300 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-rose-500/30">
            Order Confirmed &amp; Invoiced
          </span>
          <h3 className="font-serif-luxury text-2xl font-bold mt-2 text-white">Thank You For Your Order!</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Order ID: <span className="font-mono font-bold text-rose-400">{invoice.orderId}</span>
          </p>
        </div>

        {/* Invoice Body Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-zinc-200 bg-zinc-900">
          
          {/* Order Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-xs">
            <div>
              <p className="text-zinc-400 font-medium">Customer Name</p>
              <p className="font-bold text-white">{invoice.customer.name}</p>
            </div>
            <div>
              <p className="text-zinc-400 font-medium">Date &amp; Time</p>
              <p className="font-bold text-white">
                {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-zinc-400 font-medium">Est. Delivery</p>
              <p className="font-bold text-rose-400">{invoice.estimatedDelivery}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Itemized Invoice Breakdown
            </h4>
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-300 uppercase font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-2 text-center">Size</th>
                    <th className="py-3 px-2 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-800"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-zinc-400">{item.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-zinc-200">{item.selectedSize}</td>
                      <td className="py-3 px-2 text-center font-bold text-zinc-200">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-300">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-white">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Charges Box */}
          <div className="bg-zinc-950 text-zinc-200 p-5 rounded-2xl space-y-2 text-xs border border-zinc-800">
            <div className="flex justify-between text-zinc-300">
              <span>Subtotal</span>
              <span className="font-mono text-white">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>GST (5%)</span>
              <span className="font-mono text-white">₹{invoice.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Shipping Fee</span>
              <span className="font-mono">
                {invoice.shippingFee === 0 ? (
                  <span className="text-rose-400 font-bold">FREE</span>
                ) : (
                  `₹${invoice.shippingFee}`
                )}
              </span>
            </div>
            <div className="border-t border-zinc-800 pt-3 mt-2 flex justify-between items-baseline text-sm font-bold">
              <span className="text-white text-base">Grand Total Paid</span>
              <span className="text-2xl font-extrabold text-rose-400 font-mono">
                ₹{invoice.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-950/40 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

      </div>
    </div>
  );
};
