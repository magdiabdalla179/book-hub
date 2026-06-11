import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-900 border-t border-surface-800 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-brand rounded-xl">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">BookHub</span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed">
              Rwanda's premier online bookstore. Discover your next great read with AI-powered recommendations and seamless mobile money payments.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-surface-400 hover:text-brand-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-surface-400 hover:text-brand-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-surface-400 hover:text-brand-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/books" className="text-surface-400 hover:text-white transition-colors text-sm">Browse Books</Link></li>
              <li><Link to="/ai-chat" className="text-surface-400 hover:text-white transition-colors text-sm">AI Assistant</Link></li>
              <li><Link to="/books?category=fiction" className="text-surface-400 hover:text-white transition-colors text-sm">Fiction</Link></li>
              <li><Link to="/books?category=technology" className="text-surface-400 hover:text-white transition-colors text-sm">Technology</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Support</h3>
            <ul className="space-y-3">
              <li><Link to="/dashboard" className="text-surface-400 hover:text-white transition-colors text-sm">My Account</Link></li>
              <li><Link to="/dashboard?tab=orders" className="text-surface-400 hover:text-white transition-colors text-sm">Order Status</Link></li>
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors text-sm">Return Policy</a></li>
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors text-sm">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 shrink-0" />
                <span className="text-surface-400 text-sm">KG 7 Ave, Kigali Heights<br />Kigali, Rwanda</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 shrink-0" />
                <span className="text-surface-400 text-sm">+250 788 123 456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 shrink-0" />
                <span className="text-surface-400 text-sm">support@bookhub.rw</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-surface-500 text-sm">
            © {new Date().getFullYear()} BookHub. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-surface-500 text-xs">Accepted Payments:</span>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-[#ffcc00] text-[#000000] text-[10px] font-bold rounded">MTN MoMo</span>
              <span className="px-2 py-1 bg-[#ff0000] text-white text-[10px] font-bold rounded">Airtel Money</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
