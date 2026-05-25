// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiHome, 
  FiShoppingCart, 
  FiHelpCircle, 
  FiUser,
  FiArrowUpRight
} from 'react-icons/fi';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn 
} from 'react-icons/fa';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-12 border-b border-gray-800">
          
          {/* Brand and Description */}
          <div className="md:col-span-2 space-y-4">
            <Link 
              to="/" 
              className="text-3xl font-black text-amber-400 tracking-tight block hover:opacity-90 transition-opacity"
            >
              mboakako
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Your one-stop marketplace for fashion, electronics, and lifestyle products across Cameroon. Connecting buyers and sellers securely anywhere, anytime.
            </p>
            
            {/* Social Media Network Links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <FaFacebookF className="w-4 h-4" />, href: "https://facebook.com", label: "Facebook" },
                { icon: <FaTwitter className="w-4 h-4" />, href: "https://twitter.com", label: "Twitter" },
                { icon: <FaInstagram className="w-4 h-4" />, href: "https://instagram.com", label: "Instagram" },
                { icon: <FaLinkedinIn className="w-4 h-4" />, href: "https://linkedin.com", label: "LinkedIn" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-amber-500 hover:text-gray-900 rounded-xl transition-all duration-200 shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links Grid Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
              Shop
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/", label: "Home", icon: <FiHome className="w-3.5 h-3.5" /> },
                { to: "/market", label: "Marketplace", icon: <FiShoppingBag className="w-3.5 h-3.5" /> },
                { to: "/cart", label: "Cart", icon: <FiShoppingCart className="w-3.5 h-3.5" /> }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors group py-0.5"
                  >
                    <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-amber-400">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links Grid Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/faqs", label: "FAQs", icon: <FiHelpCircle className="w-3.5 h-3.5" /> },
                { to: "/dashboard", label: "My Orders", icon: <FiUser className="w-3.5 h-3.5" /> }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors group py-0.5"
                  >
                    <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-amber-400">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Sub-Footer Meta Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-gray-500">
          <p>© {currentYear} Mboakako. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-gray-400 transition-colors flex items-center gap-0.5">
              Privacy Policy <FiArrowUpRight className="w-3 h-3" />
            </a>
            <a href="#terms" className="hover:text-gray-400 transition-colors flex items-center gap-0.5">
              Terms of Service <FiArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};