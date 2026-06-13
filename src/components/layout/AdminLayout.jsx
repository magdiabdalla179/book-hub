import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, ShoppingBag, Users, LayoutDashboard, Settings, Tags } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AdminLayout() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Books', path: '/admin/books', icon: BookOpen },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex pt-20">
        {/* Admin Sidebar */}
        <aside className="w-64 fixed top-20 bottom-0 left-0 bg-neutral-low border-r border-neutral-high overflow-y-auto hidden lg:block">
          <div className="p-6">
            <h2 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">
              Admin Controls
            </h2>
            <nav className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
