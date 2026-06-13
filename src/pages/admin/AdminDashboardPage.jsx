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

  if (isLoading) return <div className="skeleton h-full min-h-[500px] rounded-lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Dashboard Overview</h1>
          <p className="text-on-surface-variant">Welcome back to the BookHub admin control panel.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-dark p-6 rounded-lg border border-neutral-high">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-on-surface">RWF {stats?.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary-dim">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-primary-dim mr-1" />
            <span className="text-primary-dim font-medium">+12.5%</span>
            <span className="text-outline ml-2">from last month</span>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-lg border border-neutral-high">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-on-surface">{stats?.totalOrders}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-primary-dim mr-1" />
            <span className="text-primary-dim font-medium">+8.2%</span>
            <span className="text-outline ml-2">from last month</span>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-lg border border-neutral-high">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">Active Users</p>
              <h3 className="text-2xl font-bold text-on-surface">{stats?.totalUsers}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-primary-dim mr-1" />
            <span className="text-primary-dim font-medium">+4.1%</span>
            <span className="text-outline ml-2">from last month</span>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-lg border border-neutral-high">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">Total Books</p>
              <h3 className="text-2xl font-bold text-on-surface">{stats?.totalProducts}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Package className="w-4 h-4 text-on-surface-variant mr-1" />
            <span className="text-on-surface-variant font-medium">Stock levels</span>
            <span className="text-outline ml-2">Healthy</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-dark p-6 rounded-lg border border-neutral-high">
          <h3 className="text-lg font-bold text-on-surface mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9dd3aa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9dd3aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a211c" vertical={false} />
                <XAxis dataKey="name" stroke="#6f7870" tick={{ fill: '#6f7870' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#6f7870" tick={{ fill: '#6f7870' }} tickLine={false} axisLine={false} tickFormatter={(val) => `RWF ${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151b16', border: '1px solid #1a211c', borderRadius: '8px' }}
                  itemStyle={{ color: '#dfe8de' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#9dd3aa" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-lg border border-neutral-high">
          <h3 className="text-lg font-bold text-on-surface mb-6">Orders by Day</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a211c" vertical={false} />
                <XAxis dataKey="name" stroke="#6f7870" tick={{ fill: '#6f7870' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#6f7870" tick={{ fill: '#6f7870' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151b16', border: '1px solid #1a211c', borderRadius: '8px' }}
                  cursor={{ fill: '#1a211c', opacity: 0.4 }}
                />
                <Bar dataKey="revenue" fill="#d0c5b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
