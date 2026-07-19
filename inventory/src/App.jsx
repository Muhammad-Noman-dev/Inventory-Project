import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Stock from './pages/Stock';
import Invoices from './pages/Invoices';
import Analytics from './pages/Analytics';
import ProductInventory from "./pages/ProductInventory";
import CategoryProducts from "./pages/CategoryProducts";
import InvoicesList from "./pages/InvoicesList";
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceSummary from './pages/InvoiceSummary';
import InvoiceEdit from './pages/InvoiceEdit';
import MonthReport from "./pages/MonthReport";

function App() {
  return (
    <Routes>
      {/* All Pages with Sidebar Layout - no login required */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/product-inventory" element={<ProductInventory />} />
        <Route path="/product-inventory/:categoryId" element={<CategoryProducts />} />
        <Route path="/invoices-list" element={<InvoicesList />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/invoice-summary" element={<InvoiceSummary />} />
        <Route path="/month-report/:month" element={<MonthReport />} />
        <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;