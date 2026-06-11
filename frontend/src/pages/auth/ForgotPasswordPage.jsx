import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Reset link sent!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="p-2 bg-gradient-brand rounded-xl group-hover:shadow-glow transition-all duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white">BookHub</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Reset Password</h1>
          <p className="text-surface-400">We'll send you a link to reset your password</p>
        </div>

        <div className="glass-dark p-8 animate-slide-up">
          {isSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Check Your Email</h3>
              <p className="text-surface-300">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Link to="/login" className="btn-brand w-full block mt-6">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-brand w-full mt-6 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          )}

          {!isSent && (
            <p className="text-center text-surface-400 text-sm mt-6">
              Remembered your password?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Log in here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
