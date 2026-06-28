import React, { useState, useMemo } from 'react';
import { MdSearch, MdDelete, MdBlock, MdCheckCircle, MdPerson } from 'react-icons/md';
import { useAdminUsersQuery } from '../../../api/reactQuery';
import adminApi from '../../../api/admin';

const Users = () => {
  const { data: usersRes, refetch } = useAdminUsersQuery({ limit: 100 });
  const [searchTerm, setSearchTerm] = useState('');

  const users = useMemo(
    () =>
      (usersRes?.data || []).map((user) => ({
        ...user,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        status: user.status?.charAt(0).toUpperCase() + user.status?.slice(1),
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })
          : '',
        xp: user.xp || 0,
      })),
    [usersRes]
  );

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    await adminApi.deleteAdminUser(id);
    await refetch();
  };

  const handleToggleBlock = async (id, status) => {
    const nextStatus = status === 'Active' ? 'suspended' : 'active';
    await adminApi.updateAdminUser(id, { status: nextStatus });
    await refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-blue">
            User Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform users, roles, and access.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch className="text-gray-400 group-focus-within:text-accent-cyan transition-colors" size={20} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-background-secondary/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan focus:border-accent-cyan focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all sm:text-sm backdrop-blur-md"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 relative z-10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">User</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Role</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Joined</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">XP</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center border border-white/10">
                          <MdPerson className="text-gray-300" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-accent-cyan transition-colors">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'Instructor' 
                          ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]' 
                          : 'bg-white/5 text-gray-300 border-white/10'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${
                        user.status === 'Active' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {user.status === 'Active' ? <MdCheckCircle size={16} /> : <MdBlock size={16} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-400">{user.joinedDate}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-accent-orange drop-shadow-[0_0_5px_rgba(249,115,22,0.3)]">
                        {user.xp.toLocaleString()} XP
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleBlock(user.id, user.status)}
                          className={`p-2 rounded-lg transition-all ${
                            user.status === 'Active' 
                              ? 'text-yellow-500 hover:bg-yellow-500/10 hover:shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                              : 'text-green-400 hover:bg-green-400/10 hover:shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                          }`}
                          title={user.status === 'Active' ? 'Block User' : 'Unblock User'}
                        >
                          {user.status === 'Active' ? <MdBlock size={20} /> : <MdCheckCircle size={20} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-all hover:shadow-[0_0_10px_rgba(248,113,113,0.2)]"
                          title="Delete User"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MdSearch size={48} className="opacity-20" />
                      <p>No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
