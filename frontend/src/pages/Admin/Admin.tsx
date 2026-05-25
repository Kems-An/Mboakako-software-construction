// src/pages/Admin/Admin.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminProducts, createProduct, deleteProduct } from '../../services/products';
import type { Product } from '../../types/database';
import { formatPrice } from '../../utils/helpers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/index';

const CATEGORIES = [
  'Shoes','Bags','Jewelries','Topwear','Bottomwear','Perfume','Fragrance',
  'Bodywash','Backpacks','Belts','Headwear','Innerwear','Wallets','Nails',
  'Eyewear','Ties','Gadget','Furniture','Afro','Flip',
];

interface ProductForm {
  title: string; description: string; price: string;
  stock: string; image_url: string; category: string;
}

const emptyForm: ProductForm = {
  title: '', description: '', price: '', stock: '', image_url: '', category: CATEGORIES[0],
};

const Admin: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<ProductForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/'); return; }
    loadProducts();
  }, [user, isAdmin, navigate]);

  const loadProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAdminProducts(user.id);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof ProductForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError('');
    try {
      await createProduct({
        title:       form.title,
        description: form.description,
        price:       parseFloat(form.price),
        stock:       parseInt(form.stock, 10),
        image_url:   form.image_url,
        category:    form.category,
        admin_id:    user.id,
        is_active:   true,
      });
      setForm(emptyForm);
      setShowForm(false);
      await loadProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Manage your products</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Product'}
          </Button>
        </div>

        {/* Add product form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">New Product</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Title" value={form.title} onChange={set('title')} required />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={set('category')}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Price (XAF)" type="number" value={form.price} onChange={set('price')} required min="0" />
              <Input label="Stock" type="number" value={form.stock} onChange={set('stock')} required min="0" />
              <div className="sm:col-span-2">
                <Input label="Image URL" type="url" value={form.image_url} onChange={set('image_url')} required />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={3}
                  required
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products table */}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No products yet. Add your first product above.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="h-10 w-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-500' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default Admin;
