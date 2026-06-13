import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserX, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: async () => {
      const { data } = await api.get(`/users?page=${page}&limit=10`);
      return data;
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isSuspended }) => {
      await api.put(`/users/${id}/status`, { isSuspended });
    },
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status')
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          <p className="text-on-surface-variant text-sm">View and manage customer accounts</p>
        </div>
      </div>

      <div className="glass-dark rounded-lg border border-neutral-high overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-low/80 text-on-surface-variant text-xs uppercase tracking-wider border-b border-neutral-high">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-high/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : usersData?.data?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-outline">No users found.</td>
                </tr>
              ) : (
                usersData?.data.map((u) => (
                  <tr key={u._id} className={`hover:bg-neutral-low/30 transition-colors ${u.isSuspended ? 'opacity-50' : ''}`}>
                    <td className="p-4">
                      <p className="font-bold text-white text-sm flex items-center gap-2">
                        {u.name}
                        {u.isSuspended && <span className="badge-danger text-[10px]">Suspended</span>}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-on-surface">{u.email}</p>
                      <p className="text-xs text-outline">{u.phone || 'No phone'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                        u.role === 'admin' ? 'bg-secondary/20 text-secondary border-secondary/30' : 'bg-neutral-high text-on-surface border-outline-variant'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if(window.confirm(`Are you sure you want to ${u.isSuspended ? 'unsuspend' : 'suspend'} this user?`)) {
                              toggleStatus.mutate({ id: u._id, isSuspended: !u.isSuspended });
                            }
                          }}
                          disabled={toggleStatus.isPending}
                          className={`p-1.5 rounded transition-colors tooltip ${
                            u.isSuspended ? 'text-green-400 hover:bg-green-400/10' : 'text-red-400 hover:bg-red-400/10'
                          }`}
                          title={u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        >
                          {u.isSuspended ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {usersData?.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-high flex justify-between items-center bg-neutral-low/50 text-sm">
            <span className="text-on-surface-variant">Showing page {page} of {usersData.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-neutral-high text-white rounded hover:bg-neutral-higher disabled:opacity-50">Prev</button>
              <button disabled={page === usersData.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-neutral-high text-white rounded hover:bg-neutral-higher disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
