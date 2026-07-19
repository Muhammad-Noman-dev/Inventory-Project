import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { ArrowLeft, FileText, Printer } from "lucide-react";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/invoice/${id}`);
      setInvoice(res.data.invoice || res.data);
    } catch (err) {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await API.get(`/invoice/${id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF Downloaded");
    } catch (err) {
      toast.error("PDF download failed");
    }
  };

  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto">Loading...</div>;
  }

  if (!invoice) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/invoice-list")}
          className="flex items-center gap-2 text-blue-600 mb-6 hover:underline"
        >
          <ArrowLeft size={18} /> Back to Invoices
        </button>
        <p className="text-red-500">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/invoice-list")}
        className="flex items-center gap-2 text-blue-600 mb-6 hover:underline"
      >
        <ArrowLeft size={18} /> Back to Invoices
      </button>

      <div className="bg-white rounded-3xl shadow p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">ASHFLEA</h1>
            <p className="text-sm text-gray-500">borrowvibes@gmail.com</p>
            <p className="text-sm text-gray-500">0318-7020058</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500">
              {new Date(invoice.date).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-medium">{invoice.customerName || "Walk-in"}</p>
          </div>
          {invoice.customerPhone && (
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{invoice.customerPhone}</p>
            </div>
          )}
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <td className="px-4 py-3">
              <div>{new Date(invoice.date).toLocaleDateString("en-GB")}</div>
              <div className="text-xs text-gray-500">
                {new Date(invoice.date).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </td>
            <tr className="border-b text-left">
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Date & Time</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoice.products?.map((item, index) => (
              <tr key={index}>
                <td className="py-3">{item.name}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">{item.price}</td>
                <td className="py-3 text-right font-medium">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t pt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {invoice.subTotal || invoice.grandTotal}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount</span>
              <span>Rs. {invoice.discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>GRAND TOTAL</span>
            <span>Rs. {invoice.grandTotal}</span>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700"
          >
            <FileText size={18} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;