// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  FiShoppingCart, 
  FiChevronDown, 
  FiGrid, 
  FiShield, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiHome,
  FiShoppingBag,
  FiHelpCircle
} from 'react-icons/fi';

export const Navbar: React.FC = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setDropdownOpen(false);
      setMobileOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <FiHome className="w-4 h-4" /> },
    { to: '/market', label: 'Shop', icon: <FiShoppingBag className="w-4 h-4" /> },
    { to: '/faqs', label: 'FAQs', icon: <FiHelpCircle className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-lg border-b border-gray-100/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl md:text-3xl font-black text-amber-500 tracking-tighter group-hover:text-amber-600 transition-colors">
              mboastore
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100/60 p-1 rounded-xl">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Side Control Panel */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-gray-600 hover:text-amber-600 hover:bg-amber-50/60 active:scale-95 transition-all duration-200"
              aria-label="View Shopping Cart"
            >
              <FiShoppingCart className="h-5 w-5 stroke-[2.2]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 min-w-[18px] px-1 flex items-center justify-center
                                 bg-amber-500 text-white text-[10px] rounded-full font-black ring-2 ring-white animate-fade-in">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Authentication States */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 bg-white
                              text-sm font-bold text-gray-700 hover:border-gray-200 hover:shadow-sm transition-all duration-200 ${
                                dropdownOpen ? 'ring-2 ring-amber-500/20 border-amber-200' : ''
                              }`}
                >
                  <div className="h-7 w-7 rounded-xl bg-amber-100 border border-amber-200/40 flex items-center justify-center font-black text-amber-700 text-xs shadow-inner">
                    {profile?.username?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate">{profile?.username ?? 'Account'}</span>
                  <FiChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-amber-500' : ''}`} />
                </button>

                {/* Account Action Menu Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100/80 shadow-xl py-1.5 z-50 transform origin-top-right transition-all duration-200">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1 hidden sm:block">
                      <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{profile?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <FiGrid className="w-4 h-4 text-gray-400" />
                      Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50/50 transition-colors"
                      >
                        <FiShield className="w-4 h-4 text-amber-500" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="h-px bg-gray-100 my-1.5" />
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl transition-all shadow-md shadow-amber-500/10 text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Responsive Menu Switch */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
              aria-label="Toggle navigation drawer"
            >
              {mobileOpen ? <FiX className="h-5 w-5 stroke-[2.2]" /> : <FiMenu className="h-5 w-5 stroke-[2.2]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1 bg-white animate-fade-in">
            {navLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'text-gray-700 hover:bg-gray-50/80 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-gray-400 font-normal">{icon}</span>
                {label}
              </NavLink>
            ))}

            {!user && (
              <div className="pt-4 pb-2 px-4 border-t border-gray-50 space-y-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invisible Outside Click Handler Mask for Desktop Dropdown */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setDropdownOpen(false)} />
      )}
    </nav>
  );
};