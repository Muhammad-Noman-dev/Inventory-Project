


import { useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  RefreshCw,
} from "lucide-react";
import { summarizeInvoices } from "../utils/invoiceCalculations";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalProducts: 0,
    totalInvoices: 0,
  });

  const [loading, setLoading] = useState(true);

  const getArray = (data, key) => {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [invoiceRes, productRes] = await Promise.all([
        API.get("/invoice"),
        API.get("/product?limit=1000"),
      ]);

      const invoices = getArray(invoiceRes.data, "invoices");
      const products = getArray(productRes.data, "products");

      const summary = summarizeInvoices(invoices, products);

      setStats({
        totalSales: summary.totalRevenue,
        totalProfit: summary.totalProfit,
        totalProducts: products.length,
        totalInvoices: summary.totalInvoices,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your business overview
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all text-sm font-medium disabled:opacity-70"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-7">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
            <DollarSign className="text-green-600" size={28} />
          </div>
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
            {formatCurrency(stats.totalSales)}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-7">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
            <TrendingUp className="text-emerald-600" size={28} />
          </div>
          <p className="text-sm text-gray-500">Total Profit</p>
          <p className="text-3xl lg:text-4xl font-bold text-emerald-600 mt-2">
            {formatCurrency(stats.totalProfit)}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-7">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-5">
            <Package className="text-purple-600" size={28} />
          </div>
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
            {stats.totalProducts}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-7">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5">
            <Users className="text-orange-600" size={28} />
          </div>
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
            {stats.totalInvoices}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;