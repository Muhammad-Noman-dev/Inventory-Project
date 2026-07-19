import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Package, Search } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '', 
    sku: '', 
    category: '', 
    costPrice: '', 
    sellingPrice: '', 
    stock: 0, 
    minStock: 5
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/product');
      setProducts(res.data.products || res.data);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/category');
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.category || !formData.costPrice || !formData.sellingPrice) {
      return toast.error("All fields are required!");
    }

    setLoading(true);
    const dataToSend = {
      name: formData.name,
      sku: formData.sku.toUpperCase(),
      category: formData.category,
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      profit: Number(formData.sellingPrice) - Number(formData.costPrice),
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 5,
    };

    try {
      if (editingId) {
        await API.put(`/product/${editingId}`, dataToSend);
        toast.success("Product updated successfully");
      } else {
        await API.post('/product', dataToSend);
        toast.success("Product added successfully");
      }
      fetchProducts();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      sku: '', 
      category: '', 
      costPrice: '', 
      sellingPrice: '', 
      stock: 0, 
      minStock: 5 
    });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category?._id || product.category,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock || 5
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await API.delete(`/product/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Package className="text-purple-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your inventory</p>
          </div>
        </div>

        <button
          onClick={resetForm}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-medium hover:brightness-105 transition-all"
        >
          <Plus size={20} />
          New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-purple-500 text-base"
        />
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-6">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-purple-500"
                placeholder="Product Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-purple-500 uppercase"
                placeholder="SKU-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-medium hover:brightness-105 transition-all disabled:opacity-70"
            >
              {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-10 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">All Products ({filteredProducts.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-5 text-left font-medium">Product</th>
                <th className="px-6 py-5 text-left font-medium">SKU</th>
                <th className="px-6 py-5 text-left font-medium hidden md:table-cell">Category</th>
                <th className="px-6 py-5 text-center font-medium">Stock</th>
                <th className="px-6 py-5 text-center font-medium">Price</th>
                <th className="px-6 py-5 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-medium">{product.name}</td>
                  <td className="px-6 py-5 font-mono text-sm text-gray-600">{product.sku}</td>
                  <td className="px-6 py-5 text-gray-600 hidden md:table-cell">
                    {product.category?.name || product.category}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`font-semibold ${product.stock < (product.minStock || 5) ? 'text-red-600' : 'text-emerald-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-medium">
                    {product.sellingPrice}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
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

export default Products;