import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft, Package, Download } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, updateItemFormat, subtotal, tax, shippingCost, total } = useCartStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen page-bg pt-24 pb-20">
      <div className="section-container">
        
        <div className="mb-8">
          <Link to="/books" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium mb-4">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-brand-500" /> Shopping Cart
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="glass-dark p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-surface-800 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-surface-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-surface-400 mb-8 max-w-md">
              Looks like you haven't added any books to your cart yet. Explore our collection and find your next great read!
            </p>
            <Link to="/books" className="btn-brand px-8">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div key={item.product._id} className="glass-dark p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-6">
                  <div className="w-24 sm:w-32 shrink-0">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                      <img
                        src={item.product.coverImage || '/placeholder-book.svg'}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white leading-tight mb-1">
                          {item.product.title}
                        </h3>
                        <p className="text-surface-400 text-sm">{item.product.author}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-surface-500 bg-surface-800 px-2 py-1 rounded border border-surface-700">
                          {item.selectedFormat || item.product.format}
                        </span>
                        {item.product.format === 'both' && (
                          <button
                            onClick={() => updateItemFormat(item.product._id, item.selectedFormat === 'physical' ? 'ebook' : 'physical')}
                            className="text-[10px] uppercase font-bold text-brand-400 hover:text-brand-300 bg-brand-400/10 px-2 py-1 rounded border border-brand-400/30 transition-colors"
                          >
                            Switch to {item.selectedFormat === 'physical' ? 'E-book' : 'Physical'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-auto pt-4 border-t border-surface-800/50">
                      <div className="flex items-center bg-surface-800 rounded-xl p-1 border border-surface-700">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className={`p-2 text-surface-400 hover:text-white transition-colors ${item.selectedFormat === 'ebook' ? 'opacity-30 cursor-not-allowed' : ''}`}
                          disabled={item.selectedFormat === 'ebook'}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className={`p-2 text-surface-400 hover:text-white transition-colors ${item.selectedFormat === 'ebook' ? 'opacity-30 cursor-not-allowed' : ''}`}
                          disabled={item.selectedFormat === 'ebook'}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="p-2 text-surface-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors ml-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="ml-auto text-right">
                        <div className="text-sm text-surface-400 mb-0.5">
                          {item.quantity} × RWF {(item.product.discountPrice ?? item.product.price).toLocaleString()}
                        </div>
                        <div className="text-xl font-bold text-brand-400">
                          RWF {((item.product.discountPrice ?? item.product.price) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="glass-dark p-6 rounded-2xl sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-surface-300">
                    <span>Subtotal</span>
                    <span className="text-white">RWF {subtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-surface-300">
                    <span>Shipping</span>
                    <span className="text-white">
                      {shippingCost() === 0 ? 'Free (E-books only)' : `RWF ${shippingCost().toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-surface-300">
                    <span>Tax (18%)</span>
                    <span className="text-white">RWF {tax().toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-surface-800">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-white">Total</span>
                      <span className="text-3xl font-bold text-brand-400">RWF {total().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="btn-brand w-full flex items-center justify-center gap-2 h-[56px] text-lg"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/MTN_Logo.svg/512px-MTN_Logo.svg.png" alt="MTN MoMo" className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 transition-all" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Airtel_Logo.svg/512px-Airtel_Logo.svg.png" alt="Airtel Money" className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 transition-all" />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
