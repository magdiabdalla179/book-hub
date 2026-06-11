import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Star, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import BookCard from '../components/books/BookCard';

export default function HomePage() {
  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured');
      return data.data;
    }
  });

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 z-0" />
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/30 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen z-0" style={{ animationDelay: '1.5s' }} />

        <div className="section-container relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-brand-400" />
                AI-Powered Reading Experience
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
                Discover Your Next <br />
                <span className="gradient-text">Great Adventure.</span>
              </h1>
              <p className="text-lg text-surface-300 mb-8 max-w-2xl leading-relaxed">
                Rwanda's premier online bookstore. Get personalized AI recommendations, buy physical books, and download e-books instantly. Pay securely with MTN MoMo or Airtel Money.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/books" className="btn-brand flex items-center gap-2">
                  Browse Books <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/ai-chat" className="btn-outline border-white/20 text-white hover:bg-white/10 flex items-center gap-2">
                  <Bot className="w-5 h-5" /> Ask AI Assistant
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-surface-50 dark:bg-surface-900 border-y border-surface-200 dark:border-surface-800 relative z-10">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-white">AI Recommendations</h4>
                <p className="text-sm text-surface-500 dark:text-surface-400">Personalized book picks just for you</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-white">Secure Mobile Money</h4>
                <p className="text-sm text-surface-500 dark:text-surface-400">Pay with MTN MoMo & Airtel Money</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-white">Instant E-Books</h4>
                <p className="text-sm text-surface-500 dark:text-surface-400">Download and read immediately</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-20 section-container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-brand-500" /> Bestsellers
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-2">What everyone is reading right now.</p>
          </div>
          <Link to="/books?sort=-salesCount" className="text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredData?.bestSellers?.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-surface-50 dark:bg-surface-800/50">
        <div className="section-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-surface-900 dark:text-white">New Arrivals</h2>
              <p className="text-surface-500 dark:text-surface-400 mt-2">Fresh off the press.</p>
            </div>
            <Link to="/books?sort=-createdAt" className="text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredData?.newArrivals?.slice(0, 4).map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Need to import Bot at the top
import { Bot } from 'lucide-react';
