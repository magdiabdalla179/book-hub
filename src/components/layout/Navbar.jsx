import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Sun, Moon, Search, BookOpen, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const { toggleCart, itemCount } = useCartStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
    { name: 'AI Chat', path: '/ai-chat' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        isScrolled ? 'bg-neutral/80 backdrop-blur-lg border-b border-neutral-high/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-primary rounded-lg transition-all duration-300">
              <BookOpen className="w-6 h-6 text-on-surface" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">BookHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-on-surface hover:text-on-surface font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Search & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search books, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-neutral-low/50 border border-neutral-high rounded-full text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
              />
            </form>

            <button
              onClick={toggleTheme}
              className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleCart}
              className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {itemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-surface text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral">
                  {itemCount()}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 relative group">
                <button
                  onClick={() => navigate(isAdmin() ? '/admin' : '/dashboard')}
                  className="flex items-center gap-2 text-on-surface hover:text-on-surface transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-high flex items-center justify-center overflow-hidden border border-outline-variant">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 glass-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <Link to={isAdmin() ? '/admin' : '/dashboard'} className="block px-4 py-2 text-sm text-on-surface hover:text-on-surface hover:bg-neutral-high/50">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error hover:text-error hover:bg-error/10"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-on-surface hover:text-on-surface text-sm font-medium transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="bg-primary hover:bg-primary text-primary-on text-sm font-medium px-4 py-2 rounded-full transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button
              onClick={toggleCart}
              className="relative p-2 text-on-surface-variant hover:text-on-surface"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-surface text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-on-surface-variant hover:text-on-surface"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-neutral border-b border-neutral-low"
          >
            <div className="px-4 py-6 space-y-4">
              <form onSubmit={handleSearch} className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-low border border-neutral-high rounded-lg text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
                />
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg text-on-surface hover:text-on-surface font-medium py-2"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-neutral-low flex flex-col gap-4">
                 <button
                  onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-3 text-on-surface hover:text-on-surface py-2"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>

                {isAuthenticated ? (
                  <>
                    <Link
                      to={isAdmin() ? '/admin' : '/dashboard'}
                      onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-on-surface hover:text-on-surface py-2"
                    >
                      <User className="w-5 h-5" /> Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}
                      className="flex items-center gap-3 text-error hover:text-error py-2 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-outline text-center"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-primary text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
