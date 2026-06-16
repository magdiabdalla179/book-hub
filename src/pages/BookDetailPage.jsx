import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Star, Sparkles, BookOpen, User, Plus, Minus, Heart, Package, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

function FormatBadge({ format }) {
  if (format === 'both') {
    return (
      <div className="flex gap-1">
        <span className="badge-info uppercase tracking-wider flex items-center gap-1"><Package className="w-3 h-3" /> Physical</span>
        <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/30 flex items-center gap-1"><Download className="w-3 h-3" /> E-Book</span>
      </div>
    );
  }
  const Icon = format === 'physical' ? Package : Download;
  const cls = format === 'physical'
    ? 'text-primary bg-primary/10 border-brand-400/30'
    : 'text-secondary bg-secondary/10 border-secondary/30';
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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

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

  const submitReview = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Review submitted!');
      setReviewRating(5);
      setReviewTitle('');
      setReviewComment('');
      queryClient.invalidateQueries(['reviews', id]);
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        toast.error('You have already reviewed this book.');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen page-bg pt-24 pb-20 section-container">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3 shrink-0 skeleton h-[500px] rounded-lg" />
          <div className="flex-1 space-y-6">
            <div className="skeleton h-12 w-3/4 rounded-lg" />
            <div className="skeleton h-6 w-1/4 rounded-lg" />
            <div className="skeleton h-32 w-full rounded-lg" />
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
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden  group">
              <img
                src={book.coverImage || '/placeholder-book.svg'}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button 
                onClick={() => toggleWishlist.mutate()}
                className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 hover:text-error transition-all text-on-surface border border-white/20 shadow-xl"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="badge-primary">{book.category?.name}</span>
                <FormatBadge format={book.format} />
                {book.discountPrice && <span className="badge-danger">On Sale</span>}
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-on-surface mb-3 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-on-surface-variant">By <span className="text-on-surface font-medium">{book.author}</span></p>
            </div>

            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-neutral-low">
              <div className="flex items-center gap-2">
                <div className="flex text-tertiary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(book.ratingsAverage) ? 'fill-current' : 'text-neutral-high'}`} />
                  ))}
                </div>
                <span className="text-on-surface font-medium ml-1">{book.ratingsAverage?.toFixed(1) || '0.0'}</span>
                <span className="text-outline">({book.ratingsCount} reviews)</span>
              </div>
              <div className="w-px h-6 bg-neutral-low" />
              <div className="text-on-surface-variant">
                <span className="text-on-surface font-medium">{book.salesCount}</span> copies sold
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-bold text-primary">
                  RWF {effectivePrice.toLocaleString()}
                </span>
                {book.discountPrice && (
                  <span className="text-xl text-outline line-through mb-1">
                    RWF {book.price.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-on-surface-variant text-sm">Includes all applicable taxes</p>
            </div>

            {book.format === 'both' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-3">Choose Format</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedFormat('physical')}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === 'physical'
                        ? 'border-brand-400 bg-primary/10'
                        : 'border-neutral-high bg-neutral-low/50 hover:border-outline'
                    }`}
                  >
                    <Package className={`w-5 h-5 ${selectedFormat === 'physical' ? 'text-primary' : 'text-on-surface-variant'}`} />
                    <div className="text-left">
                      <p className={`font-medium ${selectedFormat === 'physical' ? 'text-on-surface' : 'text-on-surface'}`}>Physical Copy</p>
                      <p className={`text-xs ${selectedFormat === 'physical' ? 'text-primary' : 'text-outline'}`}>2-5 Days Delivery</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedFormat('ebook')}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === 'ebook'
                        ? 'border-blue-400 bg-secondary/10'
                        : 'border-neutral-high bg-neutral-low/50 hover:border-outline'
                    }`}
                  >
                    <Download className={`w-5 h-5 ${selectedFormat === 'ebook' ? 'text-secondary' : 'text-on-surface-variant'}`} />
                    <div className="text-left">
                      <p className={`font-medium ${selectedFormat === 'ebook' ? 'text-on-surface' : 'text-on-surface'}`}>E-Book</p>
                      <p className={`text-xs ${selectedFormat === 'ebook' ? 'text-secondary' : 'text-outline'}`}>Instant Download</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {!isEbookSelected && physicalStock > 0 && (
              <p className="text-sm text-primary-dim flex items-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4" /> In Stock ({physicalStock} available)
              </p>
            )}
            {!isEbookSelected && physicalStock === 0 && (
              <p className="text-sm text-error flex items-center gap-1 mb-1">
                <XCircle className="w-4 h-4" /> Out of Stock
              </p>
            )}
            {isEbookSelected && book.ebook?.fileSize && (
              <p className="text-sm text-secondary flex items-center gap-1 mb-1">
                <Download className="w-4 h-4" /> File Size: {book.ebook.fileSize}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center bg-neutral-low rounded-lg p-1 border border-neutral-high">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`p-3 text-on-surface-variant hover:text-on-surface transition-colors ${isEbookSelected ? 'opacity-30 cursor-not-allowed' : ''}`}
                  disabled={isEbookSelected}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center text-on-surface font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  className={`p-3 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50 ${isEbookSelected ? 'opacity-30 cursor-not-allowed' : ''}`}
                  disabled={isEbookSelected || quantity >= maxQty}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-primary flex items-center justify-center gap-2 h-[56px] text-lg"
              >
                <ShoppingBag className="w-6 h-6" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>


          </div>
        </div>

        {/* Tabs Content */}
        <div className="mb-16">
          <div className="flex items-center gap-8 border-b border-neutral-low mb-8 overflow-x-auto">
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
                    ? 'text-primary border-brand-400' 
                    : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none text-on-surface leading-relaxed whitespace-pre-wrap">
                {book.description}
              </div>
            )}

            {activeTab === 'ai-summary' && (
              <div className="glass-dark p-8 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-primary" />
                {isLoadingSummary ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" /> BookBot's Summary
                    </h3>
                    <p className="text-on-surface leading-relaxed whitespace-pre-wrap">
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
                  <div key={i} className="flex justify-between p-4 bg-neutral-low/50 rounded-lg border border-neutral-high">
                    <span className="text-on-surface-variant">{item.label}</span>
                    <span className="text-on-surface font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-on-surface mb-8">Customer Reviews</h2>
          {reviewsData?.length === 0 ? (
            <div className="glass-dark p-8 text-center rounded-lg">
              <Star className="w-12 h-12 text-outline mx-auto mb-3" />
              <p className="text-on-surface-variant">No reviews yet. Be the first to review this book!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsData?.map((review) => (
                <div key={review._id} className="glass-dark p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-high flex items-center justify-center">
                        <User className="w-5 h-5 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{review.user.name}</p>
                        <p className="text-xs text-outline">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-tertiary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-high'}`} />
                      ))}
                    </div>
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-primary-dim bg-green-400/10 px-2 py-0.5 rounded mb-3 border border-green-400/20">
                      Verified Purchase
                    </span>
                  )}
                  {review.title && <h4 className="font-semibold text-on-surface mb-2">{review.title}</h4>}
                  <p className="text-on-surface text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {isAuthenticated && (
            <div className="glass-dark p-8 rounded-lg mt-8 max-w-2xl">
              <h3 className="text-xl font-semibold text-on-surface mb-6">Write a Review</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)}>
                        <Star className={`w-8 h-8 transition-colors ${star <= reviewRating ? 'fill-tertiary text-tertiary' : 'text-neutral-high'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Title (optional)</label>
                  <input
                    type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)}
                    className="input-field" placeholder="Summarize your review" maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Comment</label>
                  <textarea
                    value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                    className="input-field min-h-[120px]" placeholder="What did you think of this book?"
                    required
                  />
                </div>
                <button
                  onClick={() => submitReview.mutate()}
                  disabled={!reviewComment.trim() || submitReview.isPending}
                  className="btn-primary px-8"
                >
                  {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Related Books */}
        {related?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-on-surface mb-8">More from this Category</h2>
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
