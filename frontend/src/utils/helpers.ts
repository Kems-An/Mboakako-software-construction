// src/utils/helpers.ts
// Shared utility functions

/** Format a number as XAF (CFA Franc) currency */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a date string to a readable locale format */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-CM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

/** Truncate text to a given character limit with ellipsis */
export function truncate(text: string, limit: number): string {
  return text.length <= limit ? text : `${text.slice(0, limit)}…`;
}

/** Build Supabase storage public URL for an image bucket path */
export function getStorageUrl(path: string, bucket = 'product-images'): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/** Generate star array for rating display */
export function getStars(rating: number): Array<'full' | 'half' | 'empty'> {
  const stars: Array<'full' | 'half' | 'empty'> = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full');
    else if (rating >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

/** Capitalize first letter of a string */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Slugify a string for URL usage */
export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

/** Get order status badge color */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800',
    paid:      'bg-emerald-100 text-emerald-800',
    shipped:   'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
}
