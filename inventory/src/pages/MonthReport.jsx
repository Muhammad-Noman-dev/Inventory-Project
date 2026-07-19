import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

import {
  summarizeInvoices,
  getInvoiceCost,
  getInvoiceProfit,
  getInvoiceRevenue,
} from "../utils/invoiceCalculations";

const MonthReport = () => {
  const navigate = useNavigate();
  const { month } = useParams(); // e.g. 2026-07

  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

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
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- MONTH FILTER ----------------

  const monthInvoices = useMemo(() => {
    if (!month) return [];

    return invoices.filter((invoice) => {
      if (!invoice.date) return false;

      const d = new Date(invoice.date);

      const invoiceMonth =
        `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`;

      return invoiceMonth === month;
    });
  }, [invoices, month]);

  // ---------------- SEARCH ----------------

  const filteredInvoices = useMemo(() => {
    if (!search) return monthInvoices;

    const keyword = search.toLowerCase();

    return monthInvoices.filter((invoice) => {
      return (
        invoice.customerName?.toLowerCase().includes(keyword) ||
        invoice.customerPhone?.includes(keyword) ||
        invoice.invoiceNumber?.toLowerCase().includes(keyword)
      );
    });
  }, [monthInvoices, search]);

  // ---------------- SUMMARY ----------------

  const summary = useMemo(() => {
    return summarizeInvoices(filteredInvoices, products);
  }, [filteredInvoices, products]);

  // ---------------- MONTH TITLE ----------------

  const monthTitle = useMemo(() => {
    if (!month) return "";

    const [year, mon] = month.split("-");

    return new Date(year, Number(mon) - 1).toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  }, [month]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading Report...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            {monthTitle}
          </h1>

          <p className="text-gray-500 mt-1">
            Monthly Sales Report
          </p>
        </div>

        <button
          onClick={() => navigate("/invoice-summary")}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Sale
          </p>

          <p className="text-2xl font-bold mt-2">
            Rs. {summary.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Cost
          </p>

          <p className="text-2xl font-bold text-red-600 mt-2">
            Rs. {summary.totalCost.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Profit
          </p>

          <p className="text-2xl font-bold text-green-600 mt-2">
            Rs. {summary.totalProfit.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Invoices
          </p>

          <p className="text-2xl font-bold mt-2">
            {summary.totalInvoices}
          </p>
        </div>

      </div>

      {/* Search */}

      <div className="bg-white rounded-2xl shadow p-5 mb-6">

        <input
          type="text"
          placeholder="Search by customer, phone or invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        />

      </div>

      {/* TABLE PART 2 */}

            <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Invoice #</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Sale</th>
              <th className="p-4 text-left">Cost</th>
              <th className="p-4 text-left">Profit</th>
              <th className="p-4 text-left">Date & Time</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((invoice) => {
                  const revenue = getInvoiceRevenue(invoice);
                  const cost = getInvoiceCost(invoice, products);
                  const profit = getInvoiceProfit(invoice, products);

                  return (
                    <tr
                      key={invoice._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-medium">
                        {invoice.invoiceNumber || invoice._id}
                      </td>

                      <td className="p-4">
                        {invoice.customerName || "Walk-in"}
                      </td>

                      <td className="p-4">
                        {invoice.customerPhone || "-"}
                      </td>

                      <td className="p-4 font-semibold">
                        Rs. {revenue.toLocaleString()}
                      </td>

                      <td className="p-4 text-red-600">
                        Rs. {cost.toLocaleString()}
                      </td>

                      <td className="p-4 text-green-600 font-semibold">
                        Rs. {profit.toLocaleString()}
                      </td>

                      <td className="p-4">
                        {invoice.date ? (
                          <>
                            <div>
                              {new Date(invoice.date).toLocaleDateString(
                                "en-GB"
                              )}
                            </div>

                            <div className="text-xs text-gray-500">
                              {new Date(invoice.date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </div>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() =>
                            navigate(`/invoices/${invoice._id}`)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center p-8 text-gray-500"
                >
                  No invoices found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthReport;