import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, subtotal } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-900 border-l border-surface-700 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-surface-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-brand-400" />
                <h2 className="text-xl font-display font-bold text-white">Your Cart</h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 bg-surface-800 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-surface-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Your cart is empty</h3>
                    <p className="text-surface-400 mt-1">Looks like you haven't added any books yet.</p>
                  </div>
                  <button
                    onClick={() => { closeCart(); navigate('/books'); }}
                    className="btn-outline mt-4"
                  >
                    Browse Books
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product._id} className="flex gap-4 p-4 glass-dark rounded-xl">
                    <img
                      src={item.product.coverImage || '/placeholder-book.svg'}
                      alt={item.product.title}
                      className="w-20 h-28 object-cover rounded-lg shadow-md"
                    />
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-white line-clamp-1">{item.product.title}</h4>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="text-surface-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-surface-400">{item.product.author}</p>
                        <span className="text-[10px] uppercase font-bold text-surface-500 bg-surface-800 px-1.5 py-0.5 rounded border border-surface-700">
                          {item.selectedFormat || item.product.format}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3 bg-surface-800 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className={`p-1 text-surface-400 hover:text-white ${item.selectedFormat === 'ebook' ? 'opacity-30 cursor-not-allowed' : ''}`}
                            disabled={item.selectedFormat === 'ebook'}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className={`p-1 text-surface-400 hover:text-white ${item.selectedFormat === 'ebook' ? 'opacity-30 cursor-not-allowed' : ''}`}
                            disabled={item.selectedFormat === 'ebook'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-bold text-brand-400">
                          RWF {((item.product.discountPrice ?? item.product.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-surface-800 bg-surface-900/90 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-surface-300">Subtotal</span>
                  <span className="text-xl font-bold text-white">RWF {subtotal().toLocaleString()}</span>
                </div>
                <p className="text-xs text-surface-500 mb-6">Shipping and taxes calculated at checkout.</p>
                <button
                  onClick={handleCheckout}
                  className="btn-brand w-full flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
