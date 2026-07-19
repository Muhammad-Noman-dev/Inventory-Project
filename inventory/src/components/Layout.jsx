import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, TrendingUp, FileText,
  Users, Settings, Menu, X, ChevronLeft, Boxes, BarChart3
} from 'lucide-react';
import logo from '../assets/logo.png'


const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Products', path: '/products' },
  {
    icon: Boxes,
    label: "Product Inventory",
    path: "/product-inventory",
  },
  { icon: Tags, label: 'Categories', path: '/categories' },
  { icon: TrendingUp, label: 'Stock', path: '/stock' },
  { icon: FileText, label: 'Invoices', path: '/invoices' },
  { icon: FileText, label: 'Invoice List', path: '/invoices-list' },
  { icon: BarChart3, label: 'Invoice Summary', path: '/invoice-summary' },
  { icon: Users, label: 'Analytics', path: '/analytics' }
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop + Tablet */}
      <div
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 shadow-sm
          ${sidebarOpen ? 'w-72' : 'w-20'}`}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`flex items-center transition-opacity ${!sidebarOpen && 'hidden'}`}>
              <img
                src={logo}
                alt="Inventory Logo"
                className="h-14 w-auto text-bold"
              />
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 text-left transition-all group
                  ${active
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <div className={`transition-colors ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  <item.icon size={22} />
                </div>
                {sidebarOpen && (
                  <span className="font-medium text-[15px]">{item.label}</span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-20 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 lg:hidden transition-opacity duration-300
          ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`bg-white w-72 h-full shadow-2xl transform transition-transform duration-300 ease-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Mobile Header */}
          <div className="p-6 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Inventory Logo" className="h-10 w-auto" />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Menu */}
          <nav className="p-4">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1 text-left text-[15px] font-medium
                    ${active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <item.icon size={22} className={active ? 'text-blue-600' : 'text-gray-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar (Mobile) */}
        <div className="lg:hidden bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Inventory Logo" className="h-8 w-auto" />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;