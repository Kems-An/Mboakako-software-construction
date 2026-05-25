// src/pages/Dashboard/Dashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../services/orders';
import { supabase } from '../../services/supabase';
import type { Order } from '../../types/database';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import { Spinner, Badge } from '../../components/ui/index';
import { 
  FiPackage, 
  FiCheckCircle, 
  FiClock, 
  FiCreditCard, 
  FiLogOut, 
  FiUser, 
  FiShoppingBag,
  FiCalendar,
  FiAward,
  FiCamera
} from 'react-icons/fi';

const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'profile'>('orders');
  
  // Local state for tracking avatar changes dynamically
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fallback to auth metadata username if database profile record has not resolved yet
  const dynamicUsername = profile?.username ?? user?.user_metadata?.username ?? 'User';

  useEffect(() => {
    if (!user) { 
      navigate('/login'); 
      return; 
    }
    getUserOrders(user.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));

    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [user, navigate, profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      if (!user) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      // Upload file to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL configuration link
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      /// Update public string on the user's metadata profiles table matching the auth reference id
const { error: updateError } = await (supabase
  .from('profiles')
  .update as any)({ avatar_url: publicUrl })
  .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total_amount, 0);

  if (!user) return null;

  const stats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: <FiPackage className="w-5 h-5 text-blue-500" />,
      bg: 'bg-blue-50/50' 
    },
    { 
      label: 'Completed', 
      value: orders.filter((o) => o.status === 'delivered').length, 
      icon: <FiCheckCircle className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-50/50' 
    },
    { 
      label: 'Pending', 
      value: orders.filter((o) => o.status === 'pending').length, 
      icon: <FiClock className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-50/50' 
    },
    { 
      label: 'Total Spent', 
      value: formatPrice(totalSpent), 
      icon: <FiCreditCard className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-indigo-50/50' 
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hidden File Input for Avatar Processing */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />

        {/* Profile Welcome Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div 
              onClick={triggerFileInput}
              className="group relative h-14 w-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white text-xl font-black shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={dynamicUsername} className="h-full w-full object-cover group-hover:opacity-70 transition-opacity" />
              ) : (
                dynamicUsername[0]?.toUpperCase() ?? 'U'
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <FiCamera className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Welcome back, {dynamicUsername}
              </h1>
              <p className="text-sm font-medium text-gray-400 mt-0.5">{profile?.email ?? user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 border border-red-100
                       rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 self-start sm:self-center"
          >
            <FiLogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Dashboard Analytics Widgets Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon, bg }) => (
            <div 
              key={label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between group hover:border-amber-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
                <div className={`p-2 rounded-xl ${bg} transition-colors`}>
                  {icon}
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight break-words">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Dynamic Section Control Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8 max-w-xs">
          {(['orders', 'profile'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                tab === t
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t === 'orders' ? <FiPackage className="w-4 h-4" /> : <FiUser className="w-4 h-4" />}
              {t}
            </button>
          ))}
        </div>

        {/* Orders History Tab Workspace */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
                <div className="h-12 w-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No orders discovered</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">You haven&apos;t placed any orders on the market yet.</p>
                <Link
                  to="/market"
                  className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl font-bold tracking-wide shadow-md shadow-amber-500/10 transition-all text-sm"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hidden sm:block">
                        <FiPackage className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge className={`${getStatusColor(order.status)} font-bold text-[11px] uppercase tracking-wide px-2.5 py-0.5`}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:gap-6 border-t border-gray-50 pt-3 sm:pt-0 sm:border-0">
                      <span className="text-xs text-gray-400 font-medium block sm:hidden">Total Amount</span>
                      <span className="text-lg font-black text-gray-900 tracking-tight">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Personal Profile Info Tab Workspace */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-md animate-fade-in">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
              <div 
                onClick={triggerFileInput}
                className="group relative h-16 w-16 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner cursor-pointer"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={dynamicUsername} className="h-full w-full object-cover group-hover:opacity-70 transition-opacity" />
                ) : (
                  <span className="text-2xl font-black text-amber-600">
                    {dynamicUsername[0]?.toUpperCase() ?? 'U'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <FiCamera className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-black text-lg text-gray-900 tracking-tight">{dynamicUsername}</h2>
                <p className="text-sm font-medium text-gray-400 mb-2">{profile?.email ?? user.email}</p>
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-amber-100">
                  <FiAward className="w-3 h-3" />
                  {profile?.role ?? 'customer'}
                </span>
              </div>
            </div>

            <dl className="space-y-4 text-sm">
              <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                <dt className="font-medium text-gray-400 flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  Member since
                </dt>
                <dd className="font-bold text-gray-800">
                  {profile ? formatDate(profile.created_at) : '—'}
                </dd>
              </div>
              <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                <dt className="font-medium text-gray-400 flex items-center gap-1.5">
                  <FiPackage className="w-4 h-4 text-gray-400" />
                  Orders placed
                </dt>
                <dd className="font-bold text-gray-800 bg-amber-100/60 text-amber-800 px-2.5 py-0.5 rounded-md">
                  {orders.length}
                </dd>
              </div>
            </dl>
          </div>
        )}

      </div>
    </main>
  );
};

export default Dashboard;