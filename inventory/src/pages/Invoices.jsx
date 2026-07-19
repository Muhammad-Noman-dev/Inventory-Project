// import { useEffect, useRef, useState } from "react";
// import API from "../api";
// import toast from "react-hot-toast";
// import { useReactToPrint } from "react-to-print";
// import Receipt58mm from "../components/print/Receipt58mm";

// const Invoices = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [formData, setFormData] = useState({
//     customerName: "",
//     customerPhone: "",
//     date: "",
//     products: [],
//     discount: 0,
//   });

//   const [currentProduct, setCurrentProduct] = useState({
//     productId: "",
//     quantity: 1,
//   });

//   const [loading, setLoading] = useState(false);
//   const [selectedInvoice, setSelectedInvoice] = useState(null);

//   const receiptRef = useRef(null);

//   const getTodayDate = () => {
//     const now = new Date();

//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, "0");
//     const day = String(now.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   };

//  const getDateWithCurrentTime = (dateString) => {
//   const now = new Date();
//   if (!dateString) return now.toISOString();

//   const [year, month, day] = dateString.split("-").map(Number);

//   const dateWithCurrentTime = new Date(
//     year, month - 1, day,           // ← YE date input se aa raha hai
//     now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()  // ← YE time system se aa raha hai
//   );

//   return dateWithCurrentTime.toISOString();
// };

// const getInvoiceCreatedTimestamp = (invoice) => {
//   if (invoice.createdAt) {
//     return new Date(invoice.createdAt).getTime();
//   }

//   const timestamp = Number(
//     String(invoice.invoiceNumber || "").replace("INV-", "")
//   );

//   if (Number.isFinite(timestamp)) {
//     return timestamp;
//   }

//   return invoice.date ? new Date(invoice.date).getTime() : 0;
// };

// const formatInvoiceDateTime = (invoice) => {
//   if (!invoice?.date) return "";

//   const selectedDate = new Date(invoice.date);
//   const createdTime = invoice.createdAt
//     ? new Date(invoice.createdAt)
//     : selectedDate;

//   const datePart = selectedDate.toLocaleDateString("en-PK", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const timePart = createdTime.toLocaleTimeString("en-PK", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return `${datePart}, ${timePart}`;
// };

//   const getArrayData = (data, key) => {
//     if (Array.isArray(data?.[key])) return data[key];
//     if (Array.isArray(data)) return data;
//     return [];
//   };

//   const formatCurrency = (amount) => {
//     return `Rs. ${Number(amount || 0).toLocaleString()}`;
//   };

//   const fetchData = async () => {
//     try {
//       const [invoiceRes, productRes] = await Promise.all([
//         API.get("/invoice"),
//         API.get("/product?limit=1000"),
//       ]);

//       const invoiceData = getArrayData(invoiceRes.data, "invoices");
//       const productData = getArrayData(productRes.data, "products");

//       const sortedInvoices = [...invoiceData].sort(
//         (a, b) => new Date(b.date) - new Date(a.date)
//       );

//       setInvoices(sortedInvoices);
//       setProducts(productData);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load data");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     setFormData((prev) => ({ ...prev, date: getTodayDate() }));
//   }, []);

//   const addProductToInvoice = () => {
//     const selectedProduct = products.find(
//       (product) => product._id === currentProduct.productId
//     );

//     if (!selectedProduct) {
//       toast.error("Please select a product");
//       return;
//     }

//     const quantity = Number(currentProduct.quantity) || 0;

//     if (quantity <= 0) {
//       toast.error("Quantity must be greater than 0");
//       return;
//     }

//     const costPrice = Number(selectedProduct.costPrice) || 0;
//     const sellingPrice = Number(selectedProduct.sellingPrice) || 0;
//     const total = sellingPrice * quantity;
//     const costTotal = costPrice * quantity;
//     const profit = total - costTotal;

//     const newItem = {
//       product: selectedProduct._id,
//       name: selectedProduct.name,
//       quantity,
//       price: sellingPrice,
//       sellingPrice,
//       costPrice,
//       total,
//       costTotal,
//       profit,
//     };

//     setFormData((prev) => ({
//       ...prev,
//       products: [...prev.products, newItem],
//     }));

//     setCurrentProduct({
//       productId: "",
//       quantity: 1,
//     });
//   };

//   const removeProduct = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       products: prev.products.filter((_, itemIndex) => itemIndex !== index),
//     }));
//   };

//   const calculateSubtotal = () => {
//     return formData.products.reduce(
//       (sum, item) => sum + Number(item.total || 0),
//       0
//     );
//   };

//   const calculateGrandTotal = () => {
//     const subtotal = calculateSubtotal();
//     const discount = Number(formData.discount) || 0;

//     return Math.max(0, subtotal - discount);
//   };

//   const createInvoice = async () => {
//     if (!formData.customerName.trim()) {
//       toast.error("Customer name is required");
//       return;
//     }

//     if (formData.products.length === 0) {
//       toast.error("At least 1 product is required");
//       return;
//     }

//     if (!formData.date) {
//       toast.error("Please select invoice date");
//       return;
//     }

//     try {
//       setLoading(true);

//       await API.post("/invoice", {
//         customerName: formData.customerName.trim(),
//         customerPhone: formData.customerPhone.trim(),
//         date: getDateWithCurrentTime(formData.date),
//         products: formData.products,
//         discount: Number(formData.discount) || 0,
//         subTotal: calculateSubtotal(),
//         grandTotal: calculateGrandTotal(),
//       });

//       toast.success("Invoice created successfully");

//       setFormData({
//         customerName: "",
//         customerPhone: "",
//         date: getTodayDate(),
//         products: [],
//         discount: 0,
//       });

//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.msg || "Invoice create error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendWhatsAppInvoice = (invoice) => {
//     if (!invoice.customerPhone) {
//       toast.error("Customer phone missing");
//       return;
//     }

//     let phone = invoice.customerPhone.replace(/\D/g, "");

//     if (phone.startsWith("0")) {
//       phone = `92${phone.substring(1)}`;
//     }

//     if (!phone.startsWith("92")) {
//       phone = `92${phone}`;
//     }

//     const productsList = (invoice.products || [])
//       .map(
//         (item, index) =>
//           `${index + 1}. ${item.name} × ${item.quantity} = Rs. ${item.total}`
//       )
//       .join("\n");

//     const message = `
// ASHFLEA

// Dear ${invoice.customerName},
// Your purchase has been completed successfully.

// Invoice No: ${invoice.invoiceNumber || invoice._id}
// Date: ${formatInvoiceDateTime(invoice.date)}

// Products:
// ${productsList}

// Total Amount: Rs. ${invoice.grandTotal}

// Thank you for choosing ASHFLEA.
// Regards,
// ASHFLEA
// 0318-7020058
// `;

//     window.open(
//       `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
//       "_blank"
//     );
//   };

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

//       toast.success("PDF downloaded");
//     } catch (err) {
//       console.error(err);
//       toast.error("PDF download failed");
//     }
//   };

//   const deleteInvoice = async (id) => {
//     const confirmed = window.confirm("Do you want to delete this invoice?");
//     if (!confirmed) return;

//     try {
//       setLoading(true);

//       await API.delete(`/invoice/${id}`);

//       toast.success("Invoice deleted successfully");
//       fetchData();
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.msg || "Delete failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrint = useReactToPrint({
//     contentRef: receiptRef,
//     documentTitle: "Receipt",
//     removeAfterPrint: true,
//   });

//   return (
//     <div className="p-4 lg:p-8 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold mb-8">Invoices</h1>

//       <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
//         <div className="xl:col-span-3 bg-white p-6 lg:p-10 rounded-3xl shadow xl:sticky xl:top-8 xl:self-start">
//           <h2 className="text-2xl font-semibold mb-6">New Invoice</h2>

//           <div className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium mb-2 text-gray-700">
//                 Invoice Date *
//               </label>

//               <input
//                 type="date"
//                 value={formData.date}
//                 onChange={(e) =>
//                   setFormData({ ...formData, date: e.target.value })
//                 }
//                 className="w-full border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
//               />
//             </div>

//             <input
//               type="text"
//               placeholder="Customer Name *"
//               className="w-full border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
//               value={formData.customerName}
//               onChange={(e) =>
//                 setFormData({ ...formData, customerName: e.target.value })
//               }
//             />

//             <input
//               type="text"
//               placeholder="Phone Number (Optional)"
//               className="w-full border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
//               value={formData.customerPhone}
//               onChange={(e) =>
//                 setFormData({ ...formData, customerPhone: e.target.value })
//               }
//             />

//             <div className="border border-gray-200 bg-gray-50 p-6 rounded-3xl">
//               <h3 className="font-medium mb-4">Add Product</h3>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <select
//                   value={currentProduct.productId}
//                   onChange={(e) =>
//                     setCurrentProduct({
//                       ...currentProduct,
//                       productId: e.target.value,
//                     })
//                   }
//                   className="flex-1 border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
//                 >
//                   <option value="">Select Product</option>

//                   {products.map((product) => (
//                     <option key={product._id} value={product._id}>
//                       {product.name} - {formatCurrency(product.sellingPrice)}
//                     </option>
//                   ))}
//                 </select>

//                 <input
//                   type="number"
//                   min="1"
//                   placeholder="Qty"
//                   value={currentProduct.quantity}
//                   onChange={(e) =>
//                     setCurrentProduct({
//                       ...currentProduct,
//                       quantity: e.target.value,
//                     })
//                   }
//                   className="w-28 border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
//                 />

//                 <button
//                   type="button"
//                   onClick={addProductToInvoice}
//                   className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all"
//                 >
//                   Add
//                 </button>
//               </div>
//             </div>

//             <div className="min-h-[180px] max-h-[320px] overflow-y-auto pr-1">
//               {formData.products.length > 0 ? (
//                 formData.products.map((item, index) => (
//                   <div
//                     key={`${item.product}-${index}`}
//                     className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl mb-3"
//                   >
//                     <div>
//                       <span className="font-medium">{item.name}</span>
//                       <span className="text-sm text-gray-500 ml-3">
//                         × {item.quantity}
//                       </span>

//                       <p className="text-xs text-gray-400 mt-1">
//                         Sale: {formatCurrency(item.sellingPrice)} | Cost:{" "}
//                         {formatCurrency(item.costPrice)}
//                       </p>
//                     </div>

//                     <div className="flex items-center gap-4">
//                       <span className="font-semibold">
//                         {formatCurrency(item.total)}
//                       </span>

//                       <button
//                         type="button"
//                         onClick={() => removeProduct(index)}
//                         className="text-red-600 hover:text-red-700 text-2xl leading-none"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-400 italic text-center py-12 border border-dashed rounded-3xl">
//                   No products added yet
//                 </p>
//               )}
//             </div>

//             <div className="total-section mt-4">
//               <div className="flex justify-between text-sm py-1">
//                 <span>Subtotal</span>
//                 <span>{formatCurrency(calculateSubtotal())}</span>
//               </div>

//               <div>
//                 <label className="block text-sm mb-2 mt-2">
//                   Discount (Rs.)
//                 </label>

//                 <input
//                   type="number"
//                   min="0"
//                   placeholder="Discount"
//                   className="w-full border border-gray-300 p-3 rounded-2xl"
//                   value={formData.discount}
//                   onChange={(e) =>
//                     setFormData({ ...formData, discount: e.target.value })
//                   }
//                 />
//               </div>

//               <hr className="my-2 border-dashed border-gray-400" />

//               <div className="flex justify-between text-base font-bold py-1">
//                 <span>GRAND TOTAL</span>
//                 <span>{formatCurrency(calculateGrandTotal())}</span>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={createInvoice}
//               disabled={loading}
//               className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-xl font-semibold mt-4 disabled:opacity-70"
//             >
//               {loading ? "Creating Invoice..." : "Create Invoice"}
//             </button>
//           </div>
//         </div>

//         <div className="xl:col-span-2">
//           <h2 className="text-2xl font-semibold mb-6">Previous Invoices</h2>

//           <div className="bg-white rounded-3xl shadow divide-y overflow-y-auto max-h-[75vh]">
//             {invoices.length > 0 ? (
//               invoices.map((invoice) => (
//                 <div
//                   key={invoice._id}
//                   className="p-6 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex flex-col sm:flex-row justify-between gap-4">
//                     <div>
//                       <p className="font-semibold text-lg">
//                         {invoice.customerName}
//                       </p>

//                       <p className="text-sm text-gray-500">
//                         {invoice.invoiceNumber || invoice._id}
//                       </p>

//                       <p className="text-xs text-gray-400 mt-1">
//                         {formatInvoiceDateTime(invoice.date)}
//                       </p>
//                     </div>

//                     <div className="text-right">
//                       <p className="font-bold text-2xl">
//                         {formatCurrency(invoice.grandTotal)}
//                       </p>

//                       <div className="flex flex-wrap gap-2 mt-4 justify-end">
//                         <button
//                           type="button"
//                           onClick={() => downloadPDF(invoice._id)}
//                           className="text-blue-600 hover:underline text-sm"
//                         >
//                           Download PDF
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => deleteInvoice(invoice._id)}
//                           className="text-red-600 hover:underline text-sm"
//                           disabled={loading}
//                         >
//                           Delete
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => {
//                             setSelectedInvoice(invoice);
//                             setTimeout(() => handlePrint(), 200);
//                           }}
//                           className="text-green-600 hover:underline text-sm"
//                         >
//                           Print
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => sendWhatsAppInvoice(invoice)}
//                           className="text-green-600 hover:underline text-sm"
//                         >
//                           WhatsApp
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="p-16 text-center text-gray-500">No invoices yet</p>
//             )}
//           </div>
//         </div>
//       </div>

//       <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
//         <Receipt58mm ref={receiptRef} invoice={selectedInvoice} />
//       </div>
//     </div>
//   );
// };

// export default Invoices;



import { useEffect, useRef, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import Receipt58mm from "../components/print/Receipt58mm";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    date: "",
    products: [],
    discount: 0,
  });

  const [currentProduct, setCurrentProduct] = useState({
    productId: "",
    quantity: 1,
  });

  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const receiptRef = useRef(null);

  // ---------------- DATE HELPERS ----------------

  const getTodayDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // User selected date (day/month/year) + current system time (hour/min/sec)
  const getDateWithCurrentTime = (dateString) => {
    const now = new Date();
    if (!dateString) return now.toISOString();

    const [year, month, day] = dateString.split("-").map(Number);

    const dateWithCurrentTime = new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );

    return dateWithCurrentTime.toISOString();
  };

  // Reliable timestamp for sorting: createdAt > invoiceNumber (INV-<timestamp>) > date
  const getInvoiceCreatedTimestamp = (invoice) => {
    if (invoice.createdAt) {
      return new Date(invoice.createdAt).getTime();
    }

    const timestamp = Number(
      String(invoice.invoiceNumber || "").replace("INV-", "")
    );

    if (Number.isFinite(timestamp)) {
      return timestamp;
    }

    return invoice.date ? new Date(invoice.date).getTime() : 0;
  };

  // Expects the FULL invoice object (not just invoice.date)
  const formatInvoiceDateTime = (invoice) => {
    if (!invoice?.date) return "";

    const selectedDate = new Date(invoice.date);
    const createdTime = invoice.createdAt
      ? new Date(invoice.createdAt)
      : selectedDate;

    const datePart = selectedDate.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const timePart = createdTime.toLocaleTimeString("en-PK", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${datePart}, ${timePart}`;
  };

  // ---------------- GENERAL HELPERS ----------------

  const getArrayData = (data, key) => {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data)) return data;
    return [];
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  // ---------------- DATA FETCH ----------------

  const fetchData = async () => {
    try {
      const [invoiceRes, productRes] = await Promise.all([
        API.get("/invoice"),
        API.get("/product?limit=1000"),
      ]);

      const invoiceData = getArrayData(invoiceRes.data, "invoices");
      const productData = getArrayData(productRes.data, "products");

      const sortedInvoices = [...invoiceData].sort(
        (a, b) => getInvoiceCreatedTimestamp(b) - getInvoiceCreatedTimestamp(a)
      );

      setInvoices(sortedInvoices);
      setProducts(productData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
    setFormData((prev) => ({ ...prev, date: getTodayDate() }));
  }, []);

  // ---------------- PRODUCT LINE ITEMS ----------------

  const addProductToInvoice = () => {
    const selectedProduct = products.find(
      (product) => product._id === currentProduct.productId
    );

    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    const quantity = Number(currentProduct.quantity) || 0;

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const costPrice = Number(selectedProduct.costPrice) || 0;
    const sellingPrice = Number(selectedProduct.sellingPrice) || 0;
    const total = sellingPrice * quantity;
    const costTotal = costPrice * quantity;
    const profit = total - costTotal;

    const newItem = {
      product: selectedProduct._id,
      name: selectedProduct.name,
      quantity,
      price: sellingPrice,
      sellingPrice,
      costPrice,
      total,
      costTotal,
      profit,
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newItem],
    }));

    setCurrentProduct({
      productId: "",
      quantity: 1,
    });
  };

  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const calculateSubtotal = () => {
    return formData.products.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = Number(formData.discount) || 0;

    return Math.max(0, subtotal - discount);
  };

  // ---------------- CREATE INVOICE ----------------

  const createInvoice = async () => {
    if (!formData.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (formData.products.length === 0) {
      toast.error("At least 1 product is required");
      return;
    }

    if (!formData.date) {
      toast.error("Please select invoice date");
      return;
    }

    try {
      setLoading(true);

      await API.post("/invoice", {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        date: getDateWithCurrentTime(formData.date),
        products: formData.products,
        discount: Number(formData.discount) || 0,
        subTotal: calculateSubtotal(),
        grandTotal: calculateGrandTotal(),
      });

      toast.success("Invoice created successfully");

      setFormData({
        customerName: "",
        customerPhone: "",
        date: getTodayDate(),
        products: [],
        discount: 0,
      });

      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Invoice create error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- WHATSAPP / PDF / DELETE ----------------

  const sendWhatsAppInvoice = (invoice) => {
    if (!invoice.customerPhone) {
      toast.error("Customer phone missing");
      return;
    }

    let phone = invoice.customerPhone.replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone = `92${phone.substring(1)}`;
    }

    if (!phone.startsWith("92")) {
      phone = `92${phone}`;
    }

    const productsList = (invoice.products || [])
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} × ${item.quantity} = Rs. ${item.total}`
      )
      .join("\n");

    const message = `
ASHFLEA

Dear ${invoice.customerName},
Your purchase has been completed successfully.

Invoice No: ${invoice.invoiceNumber || invoice._id}
Date: ${formatInvoiceDateTime(invoice)}

Products:
${productsList}

Total Amount: Rs. ${invoice.grandTotal}

Thank you for choosing ASHFLEA.
Regards,
ASHFLEA
0318-7020058
`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

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

      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("PDF download failed");
    }
  };

  const deleteInvoice = async (id) => {
    const confirmed = window.confirm("Do you want to delete this invoice?");
    if (!confirmed) return;

    try {
      setLoading(true);

      await API.delete(`/invoice/${id}`);

      toast.success("Invoice deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: "Receipt",
    removeAfterPrint: true,
  });

  // ---------------- UI ----------------

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Invoices</h1>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        <div className="xl:col-span-3 bg-white p-6 lg:p-10 rounded-3xl shadow xl:sticky xl:top-8 xl:self-start">
          <h2 className="text-2xl font-semibold mb-6">New Invoice</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Invoice Date *
              </label>

              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
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

            <div className="border border-gray-200 bg-gray-50 p-6 rounded-3xl">
              <h3 className="font-medium mb-4">Add Product</h3>

              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={currentProduct.productId}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      productId: e.target.value,
                    })
                  }
                  className="flex-1 border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Product</option>

                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {formatCurrency(product.sellingPrice)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={currentProduct.quantity}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      quantity: e.target.value,
                    })
                  }
                  className="w-28 border border-gray-300 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={addProductToInvoice}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="min-h-[180px] max-h-[320px] overflow-y-auto pr-1">
              {formData.products.length > 0 ? (
                formData.products.map((item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl mb-3"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500 ml-3">
                        × {item.quantity}
                      </span>

                      <p className="text-xs text-gray-400 mt-1">
                        Sale: {formatCurrency(item.sellingPrice)} | Cost:{" "}
                        {formatCurrency(item.costPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        {formatCurrency(item.total)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-700 text-2xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-center py-12 border border-dashed rounded-3xl">
                  No products added yet
                </p>
              )}
            </div>

            <div className="total-section mt-4">
              <div className="flex justify-between text-sm py-1">
                <span>Subtotal</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>

              <div>
                <label className="block text-sm mb-2 mt-2">
                  Discount (Rs.)
                </label>

                <input
                  type="number"
                  min="0"
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
                <span>{formatCurrency(calculateGrandTotal())}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={createInvoice}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-xl font-semibold mt-4 disabled:opacity-70"
            >
              {loading ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </div>
        </div>

        <div className="xl:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Previous Invoices</h2>

          <div className="bg-white rounded-3xl shadow divide-y overflow-y-auto max-h-[75vh]">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="font-semibold text-lg">
                        {invoice.customerName}
                      </p>

                      <p className="text-sm text-gray-500">
                        {invoice.invoiceNumber || invoice._id}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {formatInvoiceDateTime(invoice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-2xl">
                        {formatCurrency(invoice.grandTotal)}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4 justify-end">
                        <button
                          type="button"
                          onClick={() => downloadPDF(invoice._id)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Download PDF
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteInvoice(invoice._id)}
                          className="text-red-600 hover:underline text-sm"
                          disabled={loading}
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setTimeout(() => handlePrint(), 200);
                          }}
                          className="text-green-600 hover:underline text-sm"
                        >
                          Print
                        </button>

                        <button
                          type="button"
                          onClick={() => sendWhatsAppInvoice(invoice)}
                          className="text-green-600 hover:underline text-sm"
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-16 text-center text-gray-500">No invoices yet</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <Receipt58mm ref={receiptRef} invoice={selectedInvoice} />
      </div>
    </div>
  );
};

export default Invoices;