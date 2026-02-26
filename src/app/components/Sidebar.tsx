import { LayoutDashboard, Users, UserPlus, Book, FileText, X, Menu, LogOut, User, Database, AlertCircle, Award, UserCog, PieChart, Smartphone, Shield } from 'lucide-react';
import { useState, useImperativeHandle, forwardRef } from 'react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  currentUser: string | null;
  onLogout: () => void;
}

export interface SidebarRef {
  toggleMobile: () => void;
}

export const Sidebar = forwardRef<SidebarRef, SidebarProps>(({ activePage, onNavigate, currentUser, onLogout }, ref) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    toggleMobile: () => setIsMobileOpen(prev => !prev)
  }));

  const isOwner = currentUser === 'william@boss.com';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'add-client', label: 'Add Client', icon: UserPlus },
    { id: 'missed-payments', label: 'Missed Payments', icon: AlertCircle },
    { id: 'user-performance', label: 'User Performance', icon: Award },
    ...(isOwner ? [{ id: 'client-allocation', label: 'Client Allocation', icon: UserCog }] : []),
    { id: 'cashbook', label: 'Cashbook', icon: Book },
    { id: 'history', label: 'Reports / History', icon: FileText },
    ...(isOwner ? [{ id: 'evaluation', label: 'Evaluation', icon: PieChart }] : []),
    { id: 'data-view', label: 'Data View', icon: Database },
    { id: 'admin-dashboard', label: 'SMS Admin', icon: Smartphone },
    ...(isOwner ? [{ id: 'user-management', label: 'User Management', icon: Shield }] : []),
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 gradient-primary rounded-xl shadow-2xl border-2 border-emerald-400 min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95 transition-all-smooth touch-feedback"
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 glass-dark border-r border-emerald-800 h-screen fixed left-0 top-0 flex flex-col z-40
        transition-all duration-300 ease-in-out shadow-2xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Brand with gradient */}
        <div className="p-6 border-b border-emerald-700 flex-shrink-0 bg-gradient-to-r from-emerald-600 to-green-600">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">GITALA BRANCH</h1>
          <p className="text-sm text-emerald-100 mt-1">Loan Management</p>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <li key={item.id} className="animate-slide-in-left" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all-smooth touch-feedback ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
                        : 'text-white hover:bg-emerald-700 active:bg-emerald-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info and Logout - Fixed at bottom */}
        <div className="p-4 border-t border-emerald-700 space-y-3 flex-shrink-0 bg-gradient-to-b from-transparent to-emerald-900/30">
          {/* Current User Display */}
          <div className="glass rounded-xl p-3 flex items-center gap-3 border border-emerald-600">
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-emerald-200">Logged in as</p>
              <p className="text-sm font-medium text-white truncate">{currentUser}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              onLogout();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all-smooth bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-lg hover:shadow-xl touch-feedback"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = 'Sidebar';