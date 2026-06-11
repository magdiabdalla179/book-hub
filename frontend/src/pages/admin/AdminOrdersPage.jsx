import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: async () => {
      const { data } = await api.get(`/orders?page=${page}&limit=10`);
      return data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries(['admin-orders']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status')
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Orders</h1>
          <p className="text-surface-400 text-sm">View and update customer orders</p>
        </div>
      </div>

      <div className="glass-dark rounded-2xl border border-surface-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-800/80 text-surface-400 text-xs uppercase tracking-wider border-b border-surface-700">
                <th className="p-4 font-medium">Order ID / Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total / Payment</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : ordersData?.data?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-surface-500">No orders found.</td>
                </tr>
              ) : (
                ordersData?.data.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-surface-400">{new Date(order.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-white text-sm">{order.user?.name}</p>
                      <p className="text-xs text-surface-400">{order.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-surface-500" />
                        <span className="text-sm text-surface-300">{order.items?.length || 0} items</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-brand-400 text-sm">RWF {order.total.toLocaleString()}</p>
                      <p className="text-[10px] uppercase font-bold text-surface-500">{order.paymentMethod.replace('_', ' ')}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus.mutate({ id: order._id, status: e.target.value })}
                        disabled={updateStatus.isPending}
                        className={`text-xs font-bold uppercase px-2 py-1.5 rounded outline-none border cursor-pointer ${
                          order.orderStatus === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          order.orderStatus === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-brand-500/10 text-brand-400 border-brand-500/20'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {ordersData?.totalPages > 1 && (
          <div className="p-4 border-t border-surface-700 flex justify-between items-center bg-surface-800/50 text-sm">
            <span className="text-surface-400">Showing page {page} of {ordersData.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-surface-700 text-white rounded hover:bg-surface-600 disabled:opacity-50">Prev</button>
              <button disabled={page === ordersData.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-surface-700 text-white rounded hover:bg-surface-600 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
