import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Calendar, Settings, FileText, LogOut, Menu, X, ChevronRight, BarChart3, Layers, DollarSign } from 'lucide-react';

const LOGO_COLOR = "https://customer-assets.emergentagent.com/job_c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/artifacts/995ub22h_Color%20Half%20Logo.png";

const sidebarLinks = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Leads', path: '/admin/leads', icon: Users },
  { label: 'Consultations', path: '/admin/consultations', icon: Calendar },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Content', path: '/admin/content', icon: Layers },
  { label: 'Investment Config', path: '/admin/investment-config', icon: DollarSign },
  { label: 'Configuration', path: '/admin/config', icon: Settings },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  // Get breadcrumb
  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, i) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
      path: '/' + parts.slice(0, i + 1).join('/')
    }));
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200 fixed h-full z-40" data-testid="admin-sidebar">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-100">
          <img src={LOGO_COLOR} alt="MedPreneur" className="h-8" />
          <span className="text-xs font-medium text-primary bg-primary-50 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" data-testid="admin-nav">
          {sidebarLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'text-primary bg-primary-50'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                }`}
                data-testid={`admin-nav-${link.label.toLowerCase()}`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            data-testid="admin-logout-btn"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl" data-testid="mobile-admin-sidebar">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">
              <img src={LOGO_COLOR} alt="MedPreneur" className="h-8" />
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {sidebarLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isActive(link.path)
                        ? 'text-primary bg-primary-50'
                        : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 md:px-6" data-testid="admin-topbar">
          <button
            className="lg:hidden p-2 text-slate-600 hover:text-primary mr-3"
            onClick={() => setSidebarOpen(true)}
            data-testid="admin-mobile-menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            {getBreadcrumb().map((crumb, i) => (
              <React.Fragment key={crumb.path}>
                {i > 0 && <ChevronRight size={14} className="text-slate-300" />}
                <span className={i === getBreadcrumb().length - 1 ? 'text-slate-900 font-medium' : ''}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
