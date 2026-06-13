import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Download, Package, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import api from '../lib/axios';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!orderData) return null;

  const hasEbooks = orderData.items.some(i => i.format === 'ebook' || i.format === 'both');
  const hasPhysical = orderData.items.some(i => i.format === 'physical' || i.format === 'both');

  const handleDownload = async (productId, title) => {
    try {
      const { data } = await api.get(`/orders/${orderId}/ebooks/${productId}/download`);
      if (data.downloadUrl) {
        // Open signed URL in new tab to trigger download
        window.open(data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <div className="min-h-screen page-bg pt-24 pb-20">
      <div className="section-container max-w-4xl">
        
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-xl text-surface-300">Thank you for your order, {orderData.user?.name.split(' ')[0]}</p>
          <p className="text-surface-400 mt-2">A confirmation email has been sent to {orderData.user?.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 animate-slide-up">
            
            {/* E-Book Downloads Section */}
            {hasEbooks && (
              <div className="glass-dark p-8 rounded-lg border border-brand-500/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Download className="w-6 h-6 text-primary" /> Your Digital Books
                </h2>
                <div className="space-y-4">
                  {orderData.items
                    .filter(item => item.format === 'ebook' || item.format === 'both')
                    .map(item => (
                      <div key={item._id} className="flex items-center justify-between p-4 bg-neutral-low rounded-lg">
                        <div className="flex items-center gap-4">
                          <img src={item.coverImage} alt={item.title} className="w-12 h-16 object-cover rounded shadow" />
                          <div>
                            <h4 className="font-semibold text-white">{item.title}</h4>
                            <p className="text-sm text-surface-400">PDF / EPUB Format</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDownload(item.product, item.title)}
                          className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Physical Delivery Info */}
            {hasPhysical && (
              <div className="glass-dark p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Package className="w-6 h-6 text-surface-400" /> Delivery Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neutral-low p-6 rounded-lg border border-neutral-high">
                  <div>
                    <h4 className="text-sm font-medium text-surface-400 mb-2">Shipping Address</h4>
                    <p className="text-white font-medium">{orderData.shippingAddress.fullName}</p>
                    <p className="text-surface-300 text-sm mt-1">{orderData.shippingAddress.address}</p>
                    <p className="text-surface-300 text-sm">{orderData.shippingAddress.city}</p>
                    <p className="text-surface-300 text-sm">{orderData.shippingAddress.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-surface-400 mb-2">Estimated Delivery</h4>
                    <p className="text-white font-medium text-lg">2-5 Business Days</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold uppercase rounded border border-primary/30">
                      Status: Processing
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/dashboard" className="btn-primary flex-1 text-center">
                View My Account
              </Link>
              <Link to="/books" className="btn-outline flex-1 text-center flex justify-center items-center gap-2">
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* Sidebar / Receipt */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass-dark p-6 rounded-lg sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg">Order Receipt</h3>
                <span className="text-sm text-surface-400">#{orderData.orderNumber}</span>
              </div>
              
              <div className="space-y-4 mb-6">
                {orderData.items.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-surface-300 line-clamp-1 pr-4">
                      {item.quantity}x {item.title}
                    </span>
                    <span className="text-white shrink-0">
                      RWF {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-y border-neutral-low mb-4">
                <div className="flex justify-between text-sm text-surface-400">
                  <span>Subtotal</span>
                  <span className="text-white">RWF {orderData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-surface-400">
                  <span>Shipping</span>
                  <span className="text-white">
                    {orderData.shippingCost === 0 ? 'Free' : `RWF ${orderData.shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-surface-400">
                  <span>Tax (18%)</span>
                  <span className="text-white">RWF {orderData.tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-white">Total Paid</span>
                <span className="text-2xl font-bold text-primary">RWF {orderData.total.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-surface-500 justify-center">
                Payment Method: <span className="uppercase font-bold text-surface-300">{orderData.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
