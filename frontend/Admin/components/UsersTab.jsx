import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, X, RefreshCw, CheckCircle2, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  fetchAdminUsers,
  createAdminUserApi,
  updateAdminUserApi,
  deleteAdminUserApi
} from '../../src/services/api';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Customer', status: 'Active' });
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const formatUser = (u) => {
    const fn = u.first_name || '';
    const ln = u.last_name || '';
    const fullName = (fn || ln) ? `${fn} ${ln}`.trim() : (u.email ? u.email.split('@')[0] : u.phone || `User #${u.id}`);
    
    let roleLabel = 'Customer';
    const r = (u.role || '').toUpperCase();
    if (r === 'ADMIN') roleLabel = 'Admin';
    else if (r === 'SELLER') roleLabel = 'Seller';
    else if (r === 'WAREHOUSE') roleLabel = 'Warehouse';
    else if (r === 'DELIVERY_AGENT') roleLabel = 'Delivery Agent';
    else roleLabel = 'Customer';

    return {
      id: u.id,
      name: fullName,
      email: u.email || u.phone || 'No Email',
      phone: u.phone || '',
      role: roleLabel,
      rawRole: u.role,
      status: u.is_active !== false ? 'Active' : 'Inactive',
      isVerified: Boolean(u.is_verified),
      dateJoined: u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'N/A',
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`
    };
  };

  const loadUsers = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await fetchAdminUsers({ search: searchTerm, role: selectedRole });
      if (Array.isArray(data)) {
        setUsers(data.map(formatUser));
      }
    } catch (err) {
      console.warn('[UsersTab] Error fetching admin users:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchTerm, selectedRole]);

  // Initial Load & Realtime Polling
  useEffect(() => {
    loadUsers();
    const interval = setInterval(() => {
      loadUsers(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [loadUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email) return;
    try {
      await createAdminUserApi(newUser);
      setIsCreateModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'Customer', status: 'Active' });
      setFeedbackMsg({ type: 'success', text: 'New user created successfully in database!' });
      setTimeout(() => setFeedbackMsg(null), 3500);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateAdminUserApi(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status
      });
      setIsEditModalOpen(false);
      setEditingUser(null);
      setFeedbackMsg({ type: 'success', text: `User #${editingUser.id} updated successfully!` });
      setTimeout(() => setFeedbackMsg(null), 3500);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (userObj) => {
    if (!window.confirm(`Are you sure you want to delete user ${userObj.email}?`)) return;
    try {
      await deleteAdminUserApi(userObj.id);
      setFeedbackMsg({ type: 'success', text: `User ${userObj.email} deleted from database!` });
      setTimeout(() => setFeedbackMsg(null), 3500);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const openEditModal = (u) => {
    setEditingUser({ ...u });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Banner */}
      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Users</h2>
            {isRefreshing && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-emerald-200 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Live Syncing</span>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Manage customer accounts, sellers, delivery agents, and system administrators.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadUsers()}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
        >
          <option value="All">All Roles</option>
          <option value="Customer">Customer</option>
          <option value="Seller">Seller</option>
          <option value="Admin">Admin</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Delivery Agent">Delivery Agent</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-medium flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading user accounts from database...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No user accounts found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email / Phone</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((u) => (
                  <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 flex items-center space-x-3">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 bg-gray-100" />
                      <div>
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <span className="text-[11px] text-gray-400 font-normal">Joined {u.dateJoined}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      <div>{u.email}</div>
                      {u.phone && <div className="text-xs text-gray-400">{u.phone}</div>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        u.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'Seller' ? 'bg-amber-100 text-amber-800' :
                        u.role === 'Warehouse' ? 'bg-indigo-100 text-indigo-800' :
                        u.role === 'Delivery Agent' ? 'bg-teal-100 text-teal-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit User Role/Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete User from Database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {users.length > 0 && !isLoading && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-600">
            <div>
              Showing <span className="font-bold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, users.length)}</span> of <span className="font-bold text-gray-900">{users.length}</span> user accounts
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.ceil(users.length / ITEMS_PER_PAGE) || 1 }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#0c7a68] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(users.length / ITEMS_PER_PAGE)))}
                disabled={currentPage === Math.ceil(users.length / ITEMS_PER_PAGE)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-fade-in">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New User</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-emerald-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Rao"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Set initial password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Seller">Seller</option>
                    <option value="Admin">Admin</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Delivery Agent">Delivery Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#ff5100] text-white hover:bg-[#e64900] rounded-xl cursor-pointer">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-fade-in">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Edit User #{editingUser.id}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-emerald-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Seller">Seller</option>
                    <option value="Admin">Admin</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Delivery Agent">Delivery Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#093529] text-white hover:bg-[#0c4737] rounded-xl cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
