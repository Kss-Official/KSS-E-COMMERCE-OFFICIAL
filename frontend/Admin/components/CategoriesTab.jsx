import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, FolderTree, X } from 'lucide-react';

const initialCategories = [
  { id: 1, name: 'Electronics', products: 245, status: 'Active' },
  { id: 2, name: 'Fashion', products: 189, status: 'Active' },
  { id: 3, name: 'Home & Kitchen', products: 156, status: 'Active' },
  { id: 4, name: 'Beauty & Personal Care', products: 112, status: 'Active' },
  { id: 5, name: 'Sports & Outdoors', products: 98, status: 'Active' },
  { id: 6, name: 'Toys & Games', products: 76, status: 'Active' },
];

export default function CategoriesTab() {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: Date.now(),
      name: newCatName,
      products: 0,
      status: 'Active'
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete category?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Categories</h2>
          <p className="text-sm text-gray-500 font-medium">Organize store items into structured product categories.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Products</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((cat) => (
              <tr key={cat.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <span>{cat.name}</span>
                </td>
                <td className="py-4 px-6 text-gray-600 font-semibold">{cat.products}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                    {cat.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Footwear & Accessories"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#ff5100] text-white hover:bg-[#e64900] rounded-xl">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
