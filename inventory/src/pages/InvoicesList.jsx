// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import API from "../api";
// // import toast from "react-hot-toast";
// // import { FileText, Trash2 } from "lucide-react";

// // const InvoicesList = () => {
// //   const navigate = useNavigate();

// //   const [invoices, setInvoices] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [searchDate, setSearchDate] = useState("");

// //   // ---------------- FETCH INVOICES ----------------
// //   const fetchInvoices = async () => {
// //     try {
// //       setLoading(true);

// //       const res = await API.get("/invoice");

// //       setInvoices(
// //         Array.isArray(res.data.invoices)
// //           ? res.data.invoices
// //           : res.data || []
// //       );
// //     } catch (err) {
// //       toast.error("Failed to load invoices");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchInvoices();
// //   }, []);

// //   // ---------------- PDF DOWNLOAD ----------------
// //   const downloadPDF = async (id) => {
// //     try {
// //       const res = await API.get(`/invoice/${id}/pdf`, {
// //         responseType: "blob",
// //       });

// //       const url = window.URL.createObjectURL(new Blob([res.data]));
// //       const link = document.createElement("a");

// //       link.href = url;
// //       link.download = `invoice-${id}.pdf`;

// //       document.body.appendChild(link);
// //       link.click();
// //       link.remove();

// //       toast.success("PDF Downloaded");
// //     } catch (err) {
// //       toast.error("PDF download failed");
// //     }
// //   };

// //   // ---------------- DELETE ----------------
// //   const deleteInvoice = async (id) => {
// //     if (!window.confirm("Do you want to delete this invoice?")) return;

// //     try {
// //       setLoading(true);

// //       await API.delete(`/invoice/${id}`);

// //       toast.success("Invoice deleted successfully");
// //       fetchInvoices();
// //     } catch (err) {
// //       toast.error(err.response?.data?.msg || "Delete failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ---------------- FILTER BY SELECTED INVOICE DATE + SORT DESCENDING ----------------
// //   const filteredInvoices = invoices
// //     .filter((inv) => {
// //       if (!searchDate) return true;

// //       if (!inv.date) return false;

// //       const invoiceDate = new Date(inv.date)
// //         .toISOString()
// //         .split("T")[0];

// //       return invoiceDate === searchDate;
// //     })
// //     .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest invoice date first

// //   return (
// //     <div className="p-6 max-w-7xl mx-auto">
// //       <h1 className="text-3xl font-bold mb-6">Total Invoices</h1>

// //       <div className="flex flex-wrap items-center gap-3 mb-5">
// //         <div>
// //           <label className="block text-sm font-medium mb-1">
// //             Search by Date
// //           </label>

// //           <input
// //             type="date"
// //             value={searchDate}
// //             onChange={(e) => setSearchDate(e.target.value)}
// //             className="border rounded-lg px-3 py-2"
// //           />
// //         </div>

// //         {searchDate && (
// //           <button
// //             onClick={() => setSearchDate("")}
// //             className="mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
// //           >
// //             Clear
// //           </button>
// //         )}
// //       </div>

// //       {loading ? (
// //         <p>Loading...</p>
// //       ) : (
// //         <div className="bg-white rounded-2xl shadow overflow-x-auto">
// //           <table className="w-full">
// //             <thead className="bg-gray-100">
// //               <tr>
// //                 <th className="p-4 text-left">Invoice #</th>
// //                 <th className="p-4 text-left">Customer</th>
// //                 <th className="p-4 text-left">Phone</th>
// //                 <th className="p-4 text-left">Date & Time</th>
// //                 <th className="p-4 text-left">Total</th>
// //                 <th className="p-4 text-left">Actions</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {filteredInvoices.length > 0 ? (
// //                 filteredInvoices.map((inv) => (
// //                   <tr
// //                     key={inv._id}
// //                     onClick={() => navigate(`/invoices/${inv._id}`)}
// //                     className="border-t hover:bg-gray-50 cursor-pointer transition"
// //                   >
// //                     <td className="p-4 font-medium">
// //                       {inv.invoiceNumber || inv._id}
// //                     </td>

// //                     <td className="p-4">
// //                       {inv.customerName || "Walk-in"}
// //                     </td>

// //                     <td className="p-4">
// //                       {inv.customerPhone || "-"}
// //                     </td>

// //                     <td className="p-4">
// //                       {inv.date ? (
// //                         <>
// //                           <div>
// //                             {new Date(inv.date).toLocaleDateString(
// //                               "en-GB"
// //                             )}
// //                           </div>

// //                           <div className="text-xs text-gray-500">
// //                             {new Date(inv.date).toLocaleTimeString(
// //                               "en-US",
// //                               {
// //                                 hour: "2-digit",
// //                                 minute: "2-digit",
// //                                 hour12: true,
// //                               }
// //                             )}
// //                           </div>
// //                         </>
// //                       ) : (
// //                         "-"
// //                       )}
// //                     </td>

// //                     <td className="p-4 font-bold">
// //                       Rs. {inv.grandTotal}
// //                     </td>

// //                     <td
// //                       className="p-4 flex items-center gap-3"
// //                       onClick={(e) => e.stopPropagation()}
// //                     >
// //                       <button
// //                         onClick={() => downloadPDF(inv._id)}
// //                         className="text-blue-600 hover:text-blue-800"
// //                         title="Download PDF"
// //                       >
// //                         <FileText size={18} />
// //                       </button>

// //                       <button
// //                         onClick={() => deleteInvoice(inv._id)}
// //                         className="text-red-600 hover:text-red-800"
// //                         title="Delete Invoice"
// //                       >
// //                         <Trash2 size={18} />
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))
// //               ) : (
// //                 <tr>
// //                   <td
// //                     colSpan="6"
// //                     className="p-6 text-center text-gray-500"
// //                   >
// //                     No invoices found.
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default InvoicesList;



// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api";
// import toast from "react-hot-toast";
// import { FileText, Trash2 } from "lucide-react";

// const InvoicesList = () => {
//   const navigate = useNavigate();

//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // ---------------- DATE RANGE SEARCH ----------------
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   // ---------------- FETCH INVOICES ----------------
//   const fetchInvoices = async () => {
//     try {
//       setLoading(true);

//       const res = await API.get("/invoice");

//       setInvoices(
//         Array.isArray(res.data.invoices)
//           ? res.data.invoices
//           : res.data || []
//       );
//     } catch (err) {
//       toast.error("Failed to load invoices");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   // ---------------- PDF DOWNLOAD ----------------
//   const downloadPDF = async (id) => {
//     try {
//       const res = await API.get(`/invoice/${id}/pdf`, {
//         responseType: "blob",
//       });

//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement("a");

//       link.href = url;
//       link.download = `invoice-${id}.pdf`;

//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       toast.success("PDF Downloaded");
//     } catch (err) {
//       toast.error("PDF download failed");
//     }
//   };

//   // ---------------- DELETE ----------------
//   const deleteInvoice = async (id) => {
//     if (!window.confirm("Do you want to delete this invoice?")) return;

//     try {
//       setLoading(true);

//       await API.delete(`/invoice/${id}`);

//       toast.success("Invoice deleted successfully");
//       fetchInvoices();
//     } catch (err) {
//       toast.error(err.response?.data?.msg || "Delete failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------- FILTER BY DATE RANGE + SORT DESCENDING ----------------
//   const filteredInvoices = invoices
//     .filter((inv) => {
//       if (!fromDate && !toDate) return true;

//       if (!inv.date) return false;

//       const invoiceDate = new Date(inv.date).toISOString().split("T")[0];

//       if (fromDate && invoiceDate < fromDate) return false;
//       if (toDate && invoiceDate > toDate) return false;

//       return true;
//     })
//     .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest invoice date first

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Total Invoices</h1>

//       <div className="flex flex-wrap items-end gap-3 mb-5">
//         <div>
//           <label className="block text-sm font-medium mb-1">From Date</label>

//           <input
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//             className="border rounded-lg px-3 py-2"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">To Date</label>

//           <input
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//             className="border rounded-lg px-3 py-2"
//           />
//         </div>

//         {(fromDate || toDate) && (
//           <button
//             onClick={() => {
//               setFromDate("");
//               setToDate("");
//             }}
//             className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
//           >
//             Clear
//           </button>
//         )}
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="bg-white rounded-2xl shadow overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-4 text-left">Invoice #</th>
//                 <th className="p-4 text-left">Customer</th>
//                 <th className="p-4 text-left">Phone</th>
//                 <th className="p-4 text-left">Date & Time</th>
//                 <th className="p-4 text-left">Total</th>
//                 <th className="p-4 text-left">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredInvoices.length > 0 ? (
//                 filteredInvoices.map((inv) => (
//                   <tr
//                     key={inv._id}
//                     onClick={() => navigate(`/invoices/${inv._id}`)}
//                     className="border-t hover:bg-gray-50 cursor-pointer transition"
//                   >
//                     <td className="p-4 font-medium">
//                       {inv.invoiceNumber || inv._id}
//                     </td>

//                     <td className="p-4">{inv.customerName || "Walk-in"}</td>

//                     <td className="p-4">{inv.customerPhone || "-"}</td>

//                     <td className="p-4">
//                       {inv.date ? (
//                         <>
//                           <div>
//                             {new Date(inv.date).toLocaleDateString("en-GB")}
//                           </div>

//                           <div className="text-xs text-gray-500">
//                             {new Date(inv.date).toLocaleTimeString("en-US", {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                               hour12: true,
//                             })}
//                           </div>
//                         </>
//                       ) : (
//                         "-"
//                       )}
//                     </td>

//                     <td className="p-4 font-bold">Rs. {inv.grandTotal}</td>

//                     <td
//                       className="p-4 flex items-center gap-3"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <button
//                         onClick={() => downloadPDF(inv._id)}
//                         className="text-blue-600 hover:text-blue-800"
//                         title="Download PDF"
//                       >
//                         <FileText size={18} />
//                       </button>

//                       <button
//                         onClick={() => deleteInvoice(inv._id)}
//                         className="text-red-600 hover:text-red-800"
//                         title="Delete Invoice"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="p-6 text-center text-gray-500">
//                     No invoices found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InvoicesList;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { FileText, Trash2, Pencil } from "lucide-react";

const InvoicesList = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- DATE RANGE SEARCH ----------------
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ---------------- FETCH INVOICES ----------------
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const res = await API.get("/invoice");

      setInvoices(
        Array.isArray(res.data.invoices)
          ? res.data.invoices
          : res.data || []
      );
    } catch (err) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // ---------------- PDF DOWNLOAD ----------------
  const downloadPDF = async (id) => {
    try {
      const res = await API.get(`/invoice/${id}/pdf`, {
        responseType: "blob",
      });

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

  // ---------------- DELETE ----------------
  const deleteInvoice = async (id) => {
    if (!window.confirm("Do you want to delete this invoice?")) return;

    try {
      setLoading(true);

      await API.delete(`/invoice/${id}`);

      toast.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EDIT ----------------
  const editInvoice = (id) => {
    navigate(`/invoices/${id}/edit`);
  };

  // ---------------- FILTER BY DATE RANGE + SORT DESCENDING ----------------
  const filteredInvoices = invoices
    .filter((inv) => {
      if (!fromDate && !toDate) return true;

      if (!inv.date) return false;

      const invoiceDate = new Date(inv.date).toISOString().split("T")[0];

      if (fromDate && invoiceDate < fromDate) return false;
      if (toDate && invoiceDate > toDate) return false;

      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest invoice date first

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Total Invoices</h1>

      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {(fromDate || toDate) && (
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Invoice #</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Date & Time</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv._id}
                    onClick={() => navigate(`/invoices/${inv._id}`)}
                    className="border-t hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="p-4 font-medium">
                      {inv.invoiceNumber || inv._id}
                    </td>

                    <td className="p-4">{inv.customerName || "Walk-in"}</td>

                    <td className="p-4">{inv.customerPhone || "-"}</td>

                    <td className="p-4">
                      {inv.date ? (
                        <>
                          <div>
                            {new Date(inv.date).toLocaleDateString("en-GB")}
                          </div>

                          <div className="text-xs text-gray-500">
                            {new Date(inv.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-4 font-bold">Rs. {inv.grandTotal}</td>

                    <td
                      className="p-4 flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => editInvoice(inv._id)}
                        className="text-amber-600 hover:text-amber-800"
                        title="Edit Invoice"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => downloadPDF(inv._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download PDF"
                      >
                        <FileText size={18} />
                      </button>

                      <button
                        onClick={() => deleteInvoice(inv._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Invoice"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoicesList;