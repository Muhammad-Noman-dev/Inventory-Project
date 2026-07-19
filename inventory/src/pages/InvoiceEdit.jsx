import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const InvoiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]); // all products (for the dropdown)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    date: "",
    products: [], // items already on this invoice: { product, name, quantity, price, total }
    discount: 0,
  });

  const [currentProduct, setCurrentProduct] = useState({
    productId: "",
    quantity: 1,
  });

  // ---------------- FETCH INVOICE + PRODUCTS ----------------
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [invoiceRes, productRes] = await Promise.all([
        API.get(`/invoice/${id}`),
        API.get("/product?limit=1000"),
      ]);

      const invoice = invoiceRes.data.invoice || invoiceRes.data;

      setFormData({
        customerName: invoice.customerName || "",
        customerPhone: invoice.customerPhone || "",
        date: invoice.date
          ? new Date(invoice.date).toISOString().split("T")[0]
          : "",
        products: (invoice.products || []).map((item) => ({
          product: item.product?._id || item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        discount: invoice.discount || 0,
      });

      setProducts(
        Array.isArray(productRes.data.products)
          ? productRes.data.products
          : productRes.data || []
      );
    } catch (err) {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PRODUCT ROW MANAGEMENT ----------------
  const addProductToInvoice = () => {
    const selected = products.find((p) => p._id === currentProduct.productId);
    if (!selected) return toast.error("Please select a product");

    const newItem = {
      product: selected._id,
      name: selected.name,
      quantity: Number(currentProduct.quantity),
      price: selected.sellingPrice,
      total: selected.sellingPrice * Number(currentProduct.quantity),
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newItem],
    }));

    setCurrentProduct({ productId: "", quantity: 1 });
  };

  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const calculateGrandTotal = () => {
    const subTotal = formData.products.reduce((sum, item) => sum + item.total, 0);
    return Math.max(0, subTotal - (formData.discount || 0));
  };

  // ---------------- SAVE ----------------
  const saveInvoice = async () => {
    if (!formData.customerName || formData.products.length === 0) {
      return toast.error("Customer name and at least 1 product required");
    }
    if (!formData.date) {
      return toast.error("Please select invoice date");
    }

    setSaving(true);
    try {
      await API.put(`/invoice/${id}`, {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone || "",
        date: formData.date,
        products: formData.products.map((p) => ({
          product: p.product,
          quantity: p.quantity,
        })),
        discount: Number(formData.discount) || 0,
      });

      toast.success("Invoice updated!");
      navigate(`/invoices/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invoice update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto">Loading...</div>;
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6 hover:underline"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white p-6 lg:p-10 rounded-3xl shadow">
        <h1 className="text-2xl font-semibold mb-6">Edit Invoice</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Invoice Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Customer Name *"
            className="w-full border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Phone Number (Optional)"
            className="w-full border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData({ ...formData, customerPhone: e.target.value })
            }
          />

          {/* Add Product Section */}
          <div className="border border-gray-200 bg-gray-50 p-6 rounded-3xl">
            <h3 className="font-medium mb-4">Add Product</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={currentProduct.productId}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, productId: e.target.value })
                }
                className="flex-1 border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} - Rs.{p.sellingPrice}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={currentProduct.quantity}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, quantity: e.target.value })
                }
                className="w-28 border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addProductToInvoice}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Current Products on this invoice */}
          <div className="min-h-[100px]">
            {formData.products.length > 0 ? (
              formData.products.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl mb-3"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-3">
                      × {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Rs. {item.total}</span>
                    <button
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-700 text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic text-center py-8 border border-dashed rounded-3xl">
                No products on this invoice
              </p>
            )}
          </div>

          {/* Total Section */}
          <div className="total-section mt-4">
            <div className="flex justify-between text-sm py-1">
              <span>Subtotal</span>
              <span>
                Rs. {formData.products.reduce((sum, item) => sum + item.total, 0)}
              </span>
            </div>
            <div>
              <label className="block text-sm mb-2 mt-2">Discount (Rs.)</label>
              <input
                type="number"
                placeholder="Discount"
                className="w-full border border-gray-300 p-3 rounded-2xl"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
              />
            </div>
            <hr className="my-2 border-dashed border-gray-400" />
            <div className="flex justify-between text-base font-bold py-1">
              <span>GRAND TOTAL</span>
              <span>Rs. {calculateGrandTotal()}</span>
            </div>
          </div>

          <button
            onClick={saveInvoice}
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-xl font-semibold mt-4 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEdit;