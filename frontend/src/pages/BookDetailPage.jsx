import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Star, Sparkles, BookOpen, User, Plus, Minus, Heart, Package, Download, CheckCircle, XCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

function FormatBadge({ format }) {
  if (format === 'both') {
    return (
      <div className="flex gap-1">
        <span className="badge-info uppercase tracking-wider flex items-center gap-1"><Package className="w-3 h-3" /> Physical</span>
        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/30 flex items-center gap-1"><Download className="w-3 h-3" /> E-Book</span>
      </div>
    );
  }
  const Icon = format === 'physical' ? Package : Download;
  const cls = format === 'physical'
    ? 'text-brand-400 bg-brand-400/10 border-brand-400/30'
    : 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  return (
    <span className={`badge-info uppercase tracking-wider flex items-center gap-1 ${cls}`}>
      <Icon className="w-3 h-3" /> {format === 'physical' ? 'Physical Book' : 'E-Book'}
    </span>
  );
}
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import BookCard from '../components/books/BookCard';

export default function BookDetailPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { addItem, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedFormat, setSelectedFormat] = useState('physical');

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    }
  });

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['book-summary', id],
    queryFn: async () => {
      const { data } = await api.post(`/ai/book-summary/${id}`);
      return data;
    },
    enabled: activeTab === 'ai-summary',
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}/reviews`);
      return data.data;
    }
  });

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/users/wishlist/toggle', { productId: id });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['wishlist']);
    },
    onError: () => toast.error('Please log in to add to wishlist')
  });

  if (isLoading) {
    return (
      <div className="min-h-screen page-bg pt-24 pb-20 section-container">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3 shrink-0 skeleton h-[500px] rounded-2xl" />
          <div className="flex-1 space-y-6">
            <div className="skeleton h-12 w-3/4 rounded-xl" />
            <div className="skeleton h-6 w-1/4 rounded-xl" />
            <div className="skeleton h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const book = data?.data;
  const related = data?.related;
  const effectivePrice = book.discountPrice ?? book.price;
  const physicalStock = book.physicalBook?.stock ?? 0;
  const isEbookSelected = book.format === 'ebook' || (book.format === 'both' && selectedFormat === 'ebook');
  const maxQty = isEbookSelected ? 1 : physicalStock;
  const isOutOfStock = !isEbookSelected && physicalStock === 0;

  const handleAddToCart = () => {
    addItem(book, quantity, book.format === 'both' ? selectedFormat : null);
    toast.success('Added to cart');
    openCart();
  };

  return (
    <div className="min-h-screen page-bg pt-24 pb-20">
      <div className="section-container">
        
        {/* Book Details Header */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-16">
          
          {/* Cover Image */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-brand-lg group">
              <img
                src={book.coverImage || '/placeholder-book.svg'}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button 
                onClick={() => toggleWishlist.mutate()}
                className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 hover:text-red-400 transition-all text-white border border-white/20 shadow-xl"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="badge-brand">{book.category?.name}</span>
                <FormatBadge format={book.format} />
                {book.discountPrice && <span className="badge-danger">On Sale</span>}
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-3 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-surface-400">By <span className="text-white font-medium">{book.author}</span></p>
            </div>

            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(book.ratingsAverage) ? 'fill-current' : 'text-surface-700'}`} />
                  ))}
                </div>
                <span className="text-white font-medium ml-1">{book.ratingsAverage?.toFixed(1) || '0.0'}</span>
                <span className="text-surface-500">({book.ratingsCount} reviews)</span>
              </div>
              <div className="w-px h-6 bg-surface-800" />
              <div className="text-surface-400">
                <span className="text-white font-medium">{book.salesCount}</span> copies sold
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-bold text-brand-400">
                  RWF {effectivePrice.toLocaleString()}
                </span>
                {book.discountPrice && (
                  <span className="text-xl text-surface-500 line-through mb-1">
                    RWF {book.price.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-surface-400 text-sm">Includes all applicable taxes</p>
            </div>

            {book.format === 'both' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-surface-300 mb-3">Choose Format</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedFormat('physical')}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedFormat === 'physical'
                        ? 'border-brand-400 bg-brand-400/10'
                        : 'border-surface-700 bg-surface-800/50 hover:border-surface-500'
                    }`}
                  >
                    <Package className={`w-5 h-5 ${selectedFormat === 'physical' ? 'text-brand-400' : 'text-surface-400'}`} />
                    <div className="text-left">
                      <p className={`font-medium ${selectedFormat === 'physical' ? 'text-white' : 'text-surface-300'}`}>Physical Copy</p>
                      <p className={`text-xs ${selectedFormat === 'physical' ? 'text-brand-400' : 'text-surface-500'}`}>2-5 Days Delivery</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedFormat('ebook')}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedFormat === 'ebook'
                        ? 'border-blue-400 bg-blue-400/10'
                        : 'border-surface-700 bg-surface-800/50 hover:border-surface-500'
                    }`}
                  >
                    <Download className={`w-5 h-5 ${selectedFormat === 'ebook' ? 'text-blue-400' : 'text-surface-400'}`} />
                    <div className="text-left">
                      <p className={`font-medium ${selectedFormat === 'ebook' ? 'text-white' : 'text-surface-300'}`}>E-Book</p>
                      <p className={`text-xs ${selectedFormat === 'ebook' ? 'text-blue-400' : 'text-surface-500'}`}>Instant Download</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {!isEbookSelected && physicalStock > 0 && (
              <p className="text-sm text-green-400 flex items-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4" /> In Stock ({physicalStock} available)
              </p>
            )}
            {!isEbookSelected && physicalStock === 0 && (
              <p className="text-sm text-red-400 flex items-center gap-1 mb-1">
                <XCircle className="w-4 h-4" /> Out of Stock
              </p>
            )}
            {isEbookSelected && book.ebook?.fileSize && (
              <p className="text-sm text-blue-400 flex items-center gap-1 mb-1">
                <Download className="w-4 h-4" /> File Size: {book.ebook.fileSize}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center bg-surface-800 rounded-xl p-1 border border-surface-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`p-3 text-surface-400 hover:text-white transition-colors ${isEbookSelected ? 'opacity-30 cursor-not-allowed' : ''}`}
                  disabled={isEbookSelected}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center text-white font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  className={`p-3 text-surface-400 hover:text-white transition-colors disabled:opacity-50 ${isEbookSelected ? 'opacity-30 cursor-not-allowed' : ''}`}
                  disabled={isEbookSelected || quantity >= maxQty}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-brand flex items-center justify-center gap-2 h-[56px] text-lg"
              >
                <ShoppingBag className="w-6 h-6" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>


          </div>
        </div>

        {/* Tabs Content */}
        <div className="mb-16">
          <div className="flex items-center gap-8 border-b border-surface-800 mb-8 overflow-x-auto">
            {[
              { id: 'description', label: 'Description', icon: BookOpen },
              { id: 'ai-summary', label: 'AI Summary', icon: Sparkles },
              { id: 'details', label: 'Product Details', icon: Star },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-brand-400 border-brand-400' 
                    : 'text-surface-400 border-transparent hover:text-white hover:border-surface-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none text-surface-300 leading-relaxed whitespace-pre-wrap">
                {book.description}
              </div>
            )}

            {activeTab === 'ai-summary' && (
              <div className="glass-dark p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-brand" />
                {isLoadingSummary ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-brand-400" /> BookBot's Summary
                    </h3>
                    <p className="text-surface-300 leading-relaxed whitespace-pre-wrap">
                      {summaryData?.summary || 'Unable to generate summary at this time.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {[
                  { label: 'ISBN', value: book.isbn || 'N/A' },
                  { label: 'Publisher', value: book.publisher || 'N/A' },
                  { label: 'Language', value: book.language },
                  { label: 'Pages', value: book.pages ? `${book.pages} pages` : 'N/A' },
                  { label: 'Publication Year', value: book.publishedYear || 'N/A' },
                  { label: 'Format Availability', value: <FormatBadge format={book.format} /> },
                  ...(book.format !== 'ebook' ? [{ label: 'Stock', value: book.physicalBook?.stock ?? 'N/A' }] : []),
                  ...(book.ebook?.fileSize ? [{ label: 'File Size', value: book.ebook.fileSize }] : []),
                  ...(book.physicalBook?.weight ? [{ label: 'Weight', value: `${book.physicalBook.weight} kg` }] : []),
                ].map((item, i) => (
                  <div key={i} className="flex justify-between p-4 bg-surface-800/50 rounded-xl border border-surface-700">
                    <span className="text-surface-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Customer Reviews</h2>
          {reviewsData?.length === 0 ? (
            <div className="glass-dark p-8 text-center rounded-2xl">
              <Star className="w-12 h-12 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400">No reviews yet. Be the first to review this book!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsData?.map((review) => (
                <div key={review._id} className="glass-dark p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-surface-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{review.user.name}</p>
                        <p className="text-xs text-surface-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-surface-700'}`} />
                      ))}
                    </div>
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded mb-3 border border-green-400/20">
                      Verified Purchase
                    </span>
                  )}
                  {review.title && <h4 className="font-semibold text-white mb-2">{review.title}</h4>}
                  <p className="text-surface-300 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Books */}
        {related?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-8">More from this Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {related.map((item) => (
                <BookCard key={item._id} book={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
