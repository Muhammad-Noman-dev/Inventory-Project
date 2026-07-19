import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { Package, ArrowUp, ArrowDown, AlertTriangle, History } from 'lucide-react';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [stockInData, setStockInData] = useState({ productId: '', quantity: '', note: '' });
  const [stockOutData, setStockOutData] = useState({ productId: '', quantity: '', note: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchStockData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/product');
      setProducts(res.data.products || res.data);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  const fetchStockData = async () => {
    try {
      const [historyRes, lowRes] = await Promise.all([
        API.get('/stock/history'),
        API.get('/stock/low-stock')
      ]);
      setStockHistory(historyRes.data.history || []);
      setLowStock(lowRes.data.products || []);
      
    } catch (err) {
      toast.error("Failed to load stock data");
    }


  };
  // ==================== DELETE FUNCTION ====================
  const deleteHistory = async (id) => {
    if (!confirm("Kya aap is history record ko delete karna chahte hain?")) {
      return;
    }

    try {
      const res = await API.delete(`/stock/history/${id}`);

      if (res.data.success) {
        toast.success("History deleted successfully!");
        fetchStockData();        // Yeh list ko refresh karega
      } else {
        toast.error(res.data.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete history");
    }
  };

  const handleDelete = (id) => {
    console.log("Trying to delete ID:", id);
    deleteHistory(id);
  };
  // ========================================================

  const handleStockIn = async () => {
    if (!stockInData.productId || !stockInData.quantity) {
      return toast.error("Product and Quantity are required");
    }
    setLoading(true);
    try {
      await API.post('/stock/in', {
        productId: stockInData.productId,
        quantity: Number(stockInData.quantity),
        note: stockInData.note
      });
      toast.success("Stock In Successful!");
      setStockInData({ productId: '', quantity: '', note: '' });
      fetchStockData();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  const handleStockOut = async () => {
    if (!stockOutData.productId || !stockOutData.quantity) {
      return toast.error("Product and Quantity are required");
    }
    setLoading(true);
    try {
      await API.post('/stock/out', {
        productId: stockOutData.productId,
        quantity: Number(stockOutData.quantity),
        note: stockOutData.note
      });
      toast.success("Stock Out Successful!");
      setStockOutData({ productId: '', quantity: '', note: '' });
      fetchStockData();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to reduce stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock In */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
              <ArrowUp className="text-green-600" size={28} />
            </div>
            <h2 className="text-2xl font-semibold text-green-700">Stock In</h2>
          </div>

          <div className="space-y-5">
            <select
              value={stockInData.productId}
              onChange={(e) => setStockInData({ ...stockInData, productId: e.target.value })}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500"
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} (Current: {p.stock})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={stockInData.quantity}
              onChange={(e) => setStockInData({ ...stockInData, quantity: e.target.value })}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <input
              type="text"
              placeholder="Note (Optional)"
              value={stockInData.note}
              onChange={(e) => setStockInData({ ...stockInData, note: e.target.value })}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <button
              onClick={handleStockIn}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-all disabled:opacity-70"
            >
              {loading ? "Processing..." : "Add Stock In"}
            </button>
          </div>
        </div>

        {/* Stock Out */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
              <ArrowDown className="text-red-600" size={28} />
            </div>
            <h2 className="text-2xl font-semibold text-red-700">Stock Out</h2>
          </div>

          <div className="space-y-5">
            <select
              value={stockOutData.productId}
              onChange={(e) => setStockOutData({ ...stockOutData, productId: e.target.value })}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-red-500"
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} (Current: {p.stock})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={stockOutData.quantity}
              onChange={(e) => setStockOutData({ ...stockOutData, quantity: e.target.value })}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-red-500"
            />

            <input
              type="text"
              placeholder="Note (Optional)"
              value={stockOutData.note}
              onChange={(e) => setStockOutData({ ...stockOutData, note: e.target.value })}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-red-500"
            />

            <button
              onClick={handleStockOut}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold transition-all disabled:opacity-70"
            >
              {loading ? "Processing..." : "Reduce Stock Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-red-600" size={28} />
          <h2 className="text-2xl font-semibold text-red-700">Low Stock Alert</h2>
        </div>

        {lowStock.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStock.map(p => (
              <div key={p._id} className="border border-red-200 bg-red-50 rounded-2xl p-5">
                <p className="font-medium text-lg">{p.name}</p>
                <p className="text-red-600 font-bold text-2xl mt-2">Stock: {p.stock}</p>
                <p className="text-sm text-red-500">Low stock - Restock soon</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-green-600 text-center py-8">All products have sufficient stock ✓</p>
        )}
      </div>

      {/* Stock History */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History size={28} />
            <h2 className="text-2xl font-semibold">Stock History</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-5 text-left">Date</th>
                <th className="px-8 py-5 text-left">Product</th>
                <th className="px-8 py-5 text-center">Type</th>
                <th className="px-8 py-5 text-center">Quantity</th>
                <th className="px-8 py-5 text-left">Note</th>

              </tr>
            </thead>
            <tbody className="divide-y">
              {stockHistory.map(item => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5 text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-8 py-5 font-medium">{item.product?.name}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-6 py-2 rounded-full text-sm font-medium ${item.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-center font-semibold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'IN' ? '+' : '-'}{item.quantity}
                  </td>
                  <td className="px-8 py-5 text-gray-500">{item.note || '-'}</td>
                  <td className="px-8 py-5 text-center">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stock;