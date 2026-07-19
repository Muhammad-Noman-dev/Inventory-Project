import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/category/${editingId}`, formData);
        toast.success("Category updated successfully");
      } else {
        await API.post('/category', formData);
        toast.success("Category created successfully");
      }
      fetchCategories();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
  };

  const handleEdit = (cat) => {
    setFormData({ 
      name: cat.name, 
      description: cat.description || '' 
    });
    setEditingId(cat._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      await API.delete(`/category/${id}`);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Tag className="text-indigo-600" size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage your product categories</p>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500"
          />
          <Tag className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          {editingId ? "Edit Category" : "Create New Category"}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="e.g. Electronics"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y min-h-[52px]"
              placeholder="Brief description (optional)"
              rows={3}
            />
          </div>

          <div className="md:col-span-2 flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-medium hover:brightness-105 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {loading ? "Processing..." : editingId ? "Update Category" : "Create Category"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">All Categories ({filteredCategories.length})</h3>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-5 text-left font-medium text-gray-600">Category Name</th>
                  <th className="px-6 py-5 text-left font-medium text-gray-600 hidden md:table-cell">Description</th>
                  <th className="px-6 py-5 text-center font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCategories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-5 text-gray-600 hidden md:table-cell">
                      {cat.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete"
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
        )}
      </div>
    </div>
  );
};

export default Categories;