import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';

const initialProducts = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: '₹1,299', stock: 50, status: 'Active', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Smart Watch', category: 'Electronics', price: '₹2,499', stock: 32, status: 'Active', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Running Shoes', category: 'Fashion', price: '₹1,799', stock: 78, status: 'Active', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60' },
  { id: 4, name: 'Backpack', category: 'Fashion', price: '₹999', stock: 45, status: 'Inactive', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&auto=format&fit=crop&q=60' },
  { id: 5, name: 'Coffee Maker', category: 'Home & Kitchen', price: '₹3,499', stock: 20, status: 'Active', image: 'https://images.unsplash.com/photo-1517668808822-9ebe02f2a698?w=100&auto=format&fit=crop&q=60' },
];

export default function ProductsTab() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Electronics', price: '', stock: '', status: 'Active', image: ''
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: 'Electronics', price: '', stock: '', status: 'Active', image: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.replace('₹', '').replace(',', ''),
      stock: product.stock,
      status: product.status,
      image: product.image
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedPrice = `₹${Number(formData.price).toLocaleString('en-IN')}`;
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData, price: formattedPrice, stock: Number(formData.stock) } : p));
    } else {
      const newProd = {
        id: Date.now(),
        ...formData,
        price: formattedPrice,
        stock: Number(formData.stock) || 0,
        image: formData.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100&auto=format&fit=crop&q=60'
      };
      setProducts([newProd, ...products]);
    }
    setIsModalOpen(false);
  };

  // Filtered List
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Products</h2>
          <p className="text-sm text-gray-500 font-medium">Manage store inventory, prices, and catalog.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 md:flex-initial bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 md:flex-initial bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Stock</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-100"
                      />
                      <span className="font-bold text-gray-900 leading-snug">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">{p.category}</td>
                  <td className="py-4 px-6 font-bold text-gray-900">{p.price}</td>
                  <td className="py-4 px-6 font-semibold text-gray-700">{p.stock}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                        p.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 font-medium">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 bg-gray-50/80 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <span>Showing 1 to {filteredProducts.length} of 12 items</span>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-400 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-[#ff5100] text-white font-bold flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-lg hover:bg-gray-200 text-gray-700 font-semibold flex items-center justify-center">2</button>
            <button className="w-7 h-7 rounded-lg hover:bg-gray-200 text-gray-700 font-semibold flex items-center justify-center">3</button>
            <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1299"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-[#ff5100] text-white hover:bg-[#e64900] rounded-xl shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
