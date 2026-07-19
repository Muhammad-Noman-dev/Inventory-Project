import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { TrendingUp, Users, Package, DollarSign, FileText, Award } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState({
   
      monthlySales: 0,
      totalInvoicesThisMonth: 0,
      topProducts: [],
      topCustomers: []
    
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get('/analytics/dashboard');
      console.log(res.data);

      setStats({
        monthlySales: res.data.monthSales || 0,
        totalInvoicesThisMonth: res.data.totalInvoicesThisMonth || 0,
        topProducts: res.data.topProducts || [],
        topCustomers: res.data.topCustomers || []
      });
    } catch (err) {
      toast.error("Failed to load analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: []
    }).format(amount);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Overview of your business performance</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="mt-4 md:mt-0 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <TrendingUp size={18} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Sales</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {formatCurrency(stats.monthlySales)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="text-green-600" size={28} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4 flex items-center gap-1">

          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Invoices This Month</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {stats.totalInvoicesThisMonth}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileText className="text-blue-600" size={28} />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-4 flex items-center gap-1">
            Active this month
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Products</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {stats.topProducts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Package className="text-purple-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Customers</p>
              <p className="text-4xl font-bold text-amber-600 mt-2">NAN</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Users className="text-amber-600" size={28} />
            </div>
          </div>
        </div>
      </div>

     
      
    </div>
  );
};

export default Analytics;