import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await api.post('/auth/login', formData);
      login(data.user, data.accessToken);
      toast.success('Welcome back!');
      
      // Redirect to admin if admin, else dashboard or previous page
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="p-2 bg-gradient-primary rounded-lg transition-all duration-300">
              <BookOpen className="w-6 h-6 text-on-surface" />
            </div>
            <span className="text-2xl font-display font-bold text-on-surface">BookHub</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2">Welcome Back</h1>
          <p className="text-on-surface-variant">Log in to access your books and orders</p>
        </div>

        <div className="glass-dark p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-on-surface">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dim">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Log In <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-on-surface-variant text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-dim font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
