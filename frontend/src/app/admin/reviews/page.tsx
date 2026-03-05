'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Star, StarOff, Eye } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        i <= rating
          ? <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
          : <StarOff key={i} size={14} className="text-gray-300" />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating}</span>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

export default function ReviewsPage() {
  const { adminFetch } = useAdmin();
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<any>(null);
  const pageSize = 20;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (ratingFilter) params.set('min_rating', ratingFilter);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/reviews?${params}`);
      if (res.ok) { const d = await res.json(); setReviews(d.reviews || d); setTotal(d.total || (d.reviews || d).length); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, ratingFilter, adminFetch]);

  useEffect(() => { fetchReviews(); }, [page, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviews.filter(rv => rv.rating === r).length,
    pct: reviews.length ? Math.round(reviews.filter(rv => rv.rating === r).length / reviews.length * 100) : 0,
  }));

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews & Moderation</h2>
          <p className="text-sm text-gray-500">{total} total reviews</p>
        </div>
        <button onClick={fetchReviews} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-1">
          <p className="text-sm text-gray-500 mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
            <Star size={24} className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-3">
          <p className="text-sm text-gray-500 mb-3">Rating Distribution</p>
          <div className="space-y-1.5">
            {dist.map(d => (
              <div key={d.rating} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3">{d.rating}</span>
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-14 text-right">{d.count} ({d.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select value={ratingFilter} onChange={e => { setRatingFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}+ Stars</option>)}
        </select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div> : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No reviews found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'User', 'Rating', 'Comment', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">{r.product_name || `Product #${r.product_id}`}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.user_name || r.username || `User #${r.user_id}`}</td>
                    <td className="px-4 py-3"><RatingStars rating={r.rating} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[280px] truncate">{r.comment || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewing(r)} className="p-1.5 rounded hover:bg-gray-100"><Eye size={16} className="text-gray-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronLeft size={18} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Review Detail</h3>
            <p className="text-xs text-gray-400 mb-4">ID: {viewing.id}</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Product</span>
                <span className="text-sm font-medium text-gray-900">{viewing.product_name || `Product #${viewing.product_id}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">User</span>
                <span className="text-sm font-medium text-gray-900">{viewing.user_name || viewing.username || `User #${viewing.user_id}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Rating</span>
                <RatingStars rating={viewing.rating} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm text-gray-700">{formatDate(viewing.created_at)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">Comment</span>
                <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{viewing.comment || 'No comment provided'}</p>
              </div>
            </div>
            <button onClick={() => setViewing(null)} className="w-full mt-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
