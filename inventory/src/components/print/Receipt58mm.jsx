import React, { forwardRef } from "react";
import "./Receipt58mm.css";

const Receipt58mm = forwardRef(({ invoice }, ref) => {
  // Agar invoice nahi hai to empty div render karein (ref abhi bhi attach rahega)
  // Isse na to red error text screen pe dikhega, na hi console error bar bar fire hoga
  if (!invoice) {
    return <div ref={ref}></div>;
  }

  return (
    <div ref={ref} className="receipt-80mm">
      {/* Header */}
      <div className="text-center mb-4 border-b pb-3">
        <h1 className="text-xl font-bold tracking-wider">ASHFLEA</h1>
        <p className="text-xs mt-1">borrowvibes@gmail.com</p>
        <p className="text-xs">0318-7020058</p>
        <p className="text-xs mt-2 leading-tight">
          Shop G-31, Kohinoor 1 Plaza<br />
          Basement, Opposite Executive Passport Office
        </p>
      </div>

      {/* Invoice Info */}
      <div className="text-xs space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Invoice #</span>
          <span className="font-medium">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span>{new Date(invoice.date).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer</span>
          <span>{invoice.customerName || "Walk-in"}</span>
        </div>
        {invoice.customerPhone && (
          <div className="flex justify-between">
            <span>Phone</span>
            <span>{invoice.customerPhone}</span>
          </div>
        )}
      </div>

      <hr className="border-dashed my-3" />

      {/* Items Table */}
      <table className="w-full text-xs mb-4 items-table">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1 font-medium">Item</th>
            <th className="text-center py-1 font-medium w-12">Qty</th>
            <th className="text-right py-1 font-medium">Price</th>
            <th className="text-right py-1 font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invoice.products?.map((item, index) => (
            <tr key={index}>
              <td className="py-2 pr-2">{item.name}</td>
              <td className="text-center py-2">{item.quantity}</td>
              <td className="text-right py-2">{item.price}</td>
              <td className="text-right py-2 font-medium">
                {item.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-dashed my-3" />

      {/* Totals */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{invoice.subTotal || invoice.grandTotal}</span>
        </div>
        {invoice.discount && parseFloat(invoice.discount) > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount</span>
            <span>{parseFloat(invoice.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-black pt-2 mt-2 font-bold text-base">
          <span>GRAND TOTAL</span>
          <span>{invoice.grandTotal}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs">
        <p>Thank you for shopping with us!</p>
        <p className="mt-1">Please visit again</p>
        <p className="mt-4 text-[10px] opacity-70">Powered by Noman.Tech</p>
      </div>
    </div>
  );
});

export default Receipt58mm;