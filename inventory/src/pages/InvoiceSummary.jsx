


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import {
  getInvoiceCost,
  getInvoiceProfit,
  getInvoiceRevenue,
  summarizeInvoices,
} from "../utils/invoiceCalculations";

const InvoiceSummary = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();
  const getArrayData = (data, key) => {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [invoiceRes, productRes] = await Promise.all([
        API.get("/invoice"),
        API.get("/product?limit=1000"),
      ]);

      setInvoices(getArrayData(invoiceRes.data, "invoices"));
      setProducts(getArrayData(productRes.data, "products"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    if (!invoice.date || (!fromDate && !toDate)) return true;

    const invoiceDate = new Date(invoice.date).toISOString().split("T")[0];

    if (fromDate && invoiceDate < fromDate) return false;
    if (toDate && invoiceDate > toDate) return false;

    return true;
  });

  const summary = summarizeInvoices(filteredInvoices, products);

  const monthlyGroups = filteredInvoices.reduce((groups, invoice) => {
    if (!invoice.date) return groups;

    const date = new Date(invoice.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!groups[key]) {
      groups[key] = {
        key,
        label: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        totalInvoices: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
      };
    }

    const revenue = getInvoiceRevenue(invoice);
    const cost = getInvoiceCost(invoice, products);
    const profit = getInvoiceProfit(invoice, products);

    groups[key].totalInvoices += 1;
    groups[key].totalRevenue += revenue;
    groups[key].totalCost += cost;
    groups[key].totalProfit += profit;

    return groups;
  }, {});

  const monthlySummary = Object.values(monthlyGroups).sort((a, b) =>
    b.key.localeCompare(a.key)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Invoice Summary</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold mt-1">
                {summary.totalInvoices}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Total Sale Revenue</p>
              <p className="text-2xl font-bold mt-1">
                Rs. {summary.totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                Rs. {summary.totalCost.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                Rs. {summary.totalProfit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <div className="p-5 border-b">
              <h2 className="text-lg font-semibold">Monthly Breakdown</h2>
            </div>

            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Month</th>
                  <th className="p-4 text-left">Invoices</th>
                  <th className="p-4 text-left">Revenue</th>
                  <th className="p-4 text-left">Cost</th>
                  <th className="p-4 text-left">Profit</th>
                </tr>
              </thead>

              <tbody>
                {monthlySummary.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-gray-500"
                    >
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  monthlySummary.map((month) => (
                    <tr
                      key={month.key}
                      onClick={() => navigate(`/month-report/${month.key}`)}
                      className="border-t hover:bg-blue-50 cursor-pointer transition-all duration-200"
                    >
                      <td className="p-4 font-medium">{month.label}</td>
                      <td className="p-4">{month.totalInvoices}</td>
                      <td className="p-4">
                        Rs. {month.totalRevenue.toLocaleString()}
                      </td>
                      <td className="p-4 text-red-600">
                        Rs. {month.totalCost.toLocaleString()}
                      </td>
                      <td className="p-4 text-green-600 font-semibold">
                        Rs. {month.totalProfit.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};

export default InvoiceSummary;