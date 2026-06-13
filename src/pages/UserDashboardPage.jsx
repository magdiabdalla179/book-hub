import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Package, Heart, Settings, BookOpen, Clock, Download, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { data: myOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my');
      return data.data;
    }
  });

  const { data: wishlist, isLoading: loadingWishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/users/wishlist');
      return data.data;
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'library', label: 'My Library (E-Books)', icon: BookOpen },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleDownload = async (orderId, productId) => {
    try {
      const { data } = await api.get(`/orders/${orderId}/ebooks/${productId}/download`);
      if (data.downloadUrl) window.open(data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Download failed');
    }
  };

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="min-h-screen page-bg pt-24 pb-20">
      <div className="section-container">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="glass-dark p-6 rounded-lg sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{user?.name}</h3>
                  <p className="text-xs text-surface-400 truncate w-32">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                        isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-neutral-low border border-transparent'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 glass-dark p-6 sm:p-8 rounded-lg min-h-[600px]">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-8">
                <h2 className="text-2xl font-bold text-white mb-6">Welcome Back, {user?.name.split(' ')[0]}!</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-neutral-low p-6 rounded-lg border border-neutral-high">
                    <Package className="w-8 h-8 text-primary mb-4" />
                    <h4 className="text-surface-400 text-sm mb-1">Total Orders</h4>
                    <span className="text-2xl font-bold text-white">{myOrders?.length || 0}</span>
                  </div>
                  <div className="bg-neutral-low p-6 rounded-lg border border-neutral-high">
                    <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
                    <h4 className="text-surface-400 text-sm mb-1">E-Books Owned</h4>
                    <span className="text-2xl font-bold text-white">
                      {myOrders?.reduce((acc, order) => acc + order.items.filter(i => i.format !== 'physical').length, 0) || 0}
                    </span>
                  </div>
                  <div className="bg-neutral-low p-6 rounded-lg border border-neutral-high">
                    <Heart className="w-8 h-8 text-red-400 mb-4" />
                    <h4 className="text-surface-400 text-sm mb-1">Wishlist Items</h4>
                    <span className="text-2xl font-bold text-white">{wishlist?.length || 0}</span>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                    <button onClick={() => setTab('orders')} className="text-sm text-primary hover:text-primary-dim">View All</button>
                  </div>
                  <div className="space-y-4">
                    {loadingOrders ? (
                      <div className="skeleton h-24" />
                    ) : myOrders?.slice(0, 2).map((order) => (
                      <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-low rounded-lg border border-neutral-high gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">#{order.orderNumber}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              order.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              order.orderStatus === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-primary/20 text-primary border border-primary/30'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-surface-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary mb-1">RWF {order.total.toLocaleString()}</p>
                          <p className="text-xs text-surface-400">{order.items.length} items</p>
                        </div>
                      </div>
                    ))}
                    {myOrders?.length === 0 && <p className="text-surface-400 text-sm">No orders yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
                <div className="space-y-6">
                  {myOrders?.map((order) => (
                    <div key={order._id} className="bg-neutral-low rounded-lg border border-neutral-high overflow-hidden">
                      <div className="bg-neutral/50 p-4 border-b border-neutral-high flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Order Number</p>
                          <p className="font-bold text-white">#{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Date</p>
                          <p className="text-white text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Total</p>
                          <p className="text-primary font-bold">RWF {order.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Status</p>
                          <span className={`text-xs uppercase font-bold px-2 py-1 rounded inline-block ${
                            order.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            'bg-primary/20 text-primary'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        {order.items.map((item) => (
                          <div key={item._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 border-b border-neutral-high/50 last:border-0">
                            <img src={item.coverImage} alt={item.title} className="w-12 h-16 object-cover rounded shadow" />
                            <div className="flex-1">
                              <h4 className="font-medium text-white text-sm line-clamp-1">{item.title}</h4>
                              <p className="text-xs text-surface-400">{item.format} • Qty: {item.quantity}</p>
                            </div>
                            <span className="text-white text-sm font-medium">RWF {item.subtotal.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {myOrders?.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                      <p className="text-surface-400 mb-4">You haven't placed any orders yet.</p>
                      <Link to="/books" className="btn-primary">Browse Books</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Library Tab (E-Books) */}
            {activeTab === 'library' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">My Digital Library</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myOrders?.flatMap(order => 
                    order.items
                      .filter(item => item.format !== 'physical')
                      .map(item => (
                        <div key={`${order._id}-${item._id}`} className="bg-neutral-low rounded-lg p-4 border border-neutral-high flex gap-4">
                          <img src={item.coverImage} alt={item.title} className="w-16 h-24 object-cover rounded shadow-md" />
                          <div className="flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-white text-sm line-clamp-2 leading-tight mb-1">{item.title}</h4>
                              <p className="text-xs text-surface-400">Order: #{order.orderNumber}</p>
                            </div>
                            <button
                              onClick={() => handleDownload(order._id, item.product)}
                              className="btn-outline py-1.5 px-3 text-xs flex items-center justify-center gap-1.5 w-fit"
                            >
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                  {(!myOrders || myOrders.every(o => !o.items.some(i => i.format !== 'physical'))) && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-neutral-high rounded-lg">
                      <Download className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                      <p className="text-surface-400 mb-4">Your digital library is empty.</p>
                      <Link to="/books?format=ebook" className="btn-primary">Shop E-Books</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">My Wishlist</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlist?.map((book) => (
                    <Link key={book._id} to={`/books/${book._id}`} className="group relative">
                      <div className="aspect-[2/3] rounded-lg overflow-hidden mb-3">
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 p-1.5 bg-red-500/20 backdrop-blur text-red-500 rounded-full border border-red-500/30">
                          <Heart className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                      <h4 className="font-medium text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h4>
                      <p className="text-xs text-surface-400 mt-1">RWF {(book.discountPrice ?? book.price).toLocaleString()}</p>
                    </Link>
                  ))}
                  {wishlist?.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Heart className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                      <p className="text-surface-400 mb-4">Your wishlist is empty.</p>
                      <Link to="/books" className="btn-primary">Browse Books</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="animate-fade-in max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="bg-neutral-low p-6 rounded-lg border border-neutral-high">
                    <h3 className="font-semibold text-white mb-4 border-b border-neutral-high pb-2">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-400 mb-1">Full Name</label>
                        <input type="text" className="input-field" defaultValue={user?.name} disabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-400 mb-1">Email</label>
                        <input type="email" className="input-field" defaultValue={user?.email} disabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-400 mb-1">Phone</label>
                        <input type="text" className="input-field" defaultValue={user?.phone} disabled />
                      </div>
                      <p className="text-xs text-surface-500 mt-2">* Please contact support to change your email or phone number.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}
