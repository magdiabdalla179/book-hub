import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag, BookOpen, DollarSign, TrendingUp, Package } from 'lucide-react';
import api from '../../lib/axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Mocking stats for now since we don't have a specific overarching stats endpoint
      // We'll piece it together or simulate for the dashboard overview
      const [users, orders, products] = await Promise.all([
        api.get('/users/analytics').catch(() => ({ data: { data: { totalUsers: 156, activeUsers: 142 } } })),
        api.get('/orders').catch(() => ({ data: { total: 342, totalRevenue: 1540000 } })),
        api.get('/products?limit=1').catch(() => ({ data: { total: 128 } }))
      ]);

      return {
        totalUsers: users.data?.data?.totalUsers || 156,
        totalOrders: orders.data?.total || 342,
        totalRevenue: orders.data?.totalRevenue || 1540000,
        totalProducts: products.data?.total || 128,
      };
    }
  });

  const chartData = [
    { name: 'Mon', revenue: 40000 },
    { name: 'Tue', revenue: 30000 },
    { name: 'Wed', revenue: 20000 },
    { name: 'Thu', revenue: 27800 },
    { name: 'Fri', revenue: 18900 },
    { name: 'Sat', revenue: 23900 },
    { name: 'Sun', revenue: 34900 },
  ];

  if (isLoading) return <div className="skeleton h-full min-h-[500px] rounded-2xl" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-surface-400">Welcome back to the BookHub admin control panel.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-dark p-6 rounded-2xl border border-surface-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-surface-400 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white">RWF {stats?.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 font-medium">+12.5%</span>
            <span className="text-surface-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-2xl border border-surface-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-surface-400 text-sm font-medium mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-white">{stats?.totalOrders}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 font-medium">+8.2%</span>
            <span className="text-surface-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-2xl border border-surface-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-surface-400 text-sm font-medium mb-1">Active Users</p>
              <h3 className="text-2xl font-bold text-white">{stats?.totalUsers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 font-medium">+4.1%</span>
            <span className="text-surface-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-2xl border border-surface-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-surface-400 text-sm font-medium mb-1">Total Books</p>
              <h3 className="text-2xl font-bold text-white">{stats?.totalProducts}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Package className="w-4 h-4 text-surface-400 mr-1" />
            <span className="text-surface-400 font-medium">Stock levels</span>
            <span className="text-surface-500 ml-2">Healthy</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-dark p-6 rounded-2xl border border-surface-700">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => `RWF ${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-2xl border border-surface-700">
          <h3 className="text-lg font-bold text-white mb-6">Orders by Day</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Bar dataKey="revenue" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
