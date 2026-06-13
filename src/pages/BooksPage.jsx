import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Search, Star, Loader2, BookOpen } from 'lucide-react';
import api from '../lib/axios';
import BookCard from '../components/books/BookCard';

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filters state mapping directly to URL params
  const currentCategory = searchParams.get('category') || '';
  const currentFormat = searchParams.get('format') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    }
  });

  // Fetch Products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', currentCategory, currentFormat, currentSort, searchQuery, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentCategory) params.append('category', currentCategory);
      if (currentFormat) params.append('format', currentFormat);
      if (currentSort) params.append('sort', currentSort);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage);
      params.append('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      return data;
    }
  });

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter change
    newParams.set('page', 1);
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    handleFilterChange('search', query);
  };

  return (
    <div className="min-h-screen page-bg pt-24 pb-20">
      <div className="section-container">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-on-surface">Browse Books</h1>
            <p className="text-on-surface-variant mt-1">
              {productsData?.total || 0} books found
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search titles, authors..."
                className="input-field pl-10"
              />
            </form>
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="md:hidden btn-outline px-4 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="glass-dark p-6 sticky top-24 space-y-8">
              
              {/* Sort */}
              <div>
                <h3 className="text-on-surface font-semibold mb-3">Sort By</h3>
                <select
                  value={currentSort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full bg-neutral-high border border-outline-variant rounded-lg p-2.5 text-on-surface outline-none focus:border-primary"
                >
                  <option value="-createdAt">Newest Arrivals</option>
                  <option value="-salesCount">Best Sellers</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-ratingsAverage">Top Rated</option>
                </select>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-on-surface font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={!currentCategory}
                      onChange={() => handleFilterChange('category', '')}
                      className="w-4 h-4 text-primary bg-neutral-high border-outline-variant focus:ring-primary"
                    />
                    <span className="text-on-surface group-hover:text-on-surface transition-colors">All Categories</span>
                  </label>
                  {categoriesData?.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={currentCategory === cat._id}
                        onChange={() => handleFilterChange('category', cat._id)}
                        className="w-4 h-4 text-primary bg-neutral-high border-outline-variant focus:ring-primary"
                      />
                      <span className="text-on-surface group-hover:text-on-surface transition-colors flex-1">{cat.name}</span>
                      <span className="text-xs text-outline bg-neutral-high px-2 py-0.5 rounded-full">
                        {cat.productCount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <h3 className="text-on-surface font-semibold mb-3">Format</h3>
                <div className="space-y-2">
                  {['', 'physical', 'ebook', 'both'].map((format) => (
                    <label key={format} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="format"
                        checked={currentFormat === format}
                        onChange={() => handleFilterChange('format', format)}
                        className="w-4 h-4 text-primary bg-neutral-high border-outline-variant focus:ring-primary"
                      />
                      <span className="text-on-surface group-hover:text-on-surface transition-colors capitalize">
                        {format || 'All Formats'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton h-80"></div>
                ))}
              </div>
            ) : productsData?.data?.length === 0 ? (
              <div className="glass-dark p-12 text-center flex flex-col items-center justify-center">
                <BookOpen className="w-16 h-16 text-outline mb-4" />
                <h3 className="text-xl font-bold text-on-surface mb-2">No books found</h3>
                <p className="text-on-surface-variant">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="btn-outline mt-6"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productsData?.data.map((book) => (
                    <BookCard key={book._id} book={book} />
                  ))}
                </div>

                {/* Pagination */}
                {productsData?.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handleFilterChange('page', currentPage - 1)}
                      className="px-4 py-2 rounded-lg bg-neutral-low text-on-surface border border-neutral-high disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-high"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-on-surface flex items-center">
                      Page {currentPage} of {productsData.totalPages}
                    </span>
                    <button
                      disabled={currentPage === productsData.totalPages}
                      onClick={() => handleFilterChange('page', currentPage + 1)}
                      className="px-4 py-2 rounded-lg bg-neutral-low text-on-surface border border-neutral-high disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-high"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
