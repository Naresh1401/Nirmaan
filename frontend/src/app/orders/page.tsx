'use client';

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Package, Truck, Clock, CheckCircle2, MapPin, IndianRupee, ChevronRight, XCircle, Eye, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Order {
  id: string; date: string; status: string; items: number; total: number;
  delivery: string; statusColor: string; products: string[];
  paymentMethod: string; paymentStatus: string;
  driver?: { name: string; phone: string; vehicle: string; eta: string };
  trackingProgress?: number;
}

const statusColorMap: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  in_transit: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = { delivered: 'Delivered', in_transit: 'In Transit', confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled' };
const statusIcons: Record<string, React.ElementType> = { delivered: CheckCircle2, in_transit: Truck, confirmed: Clock, pending: Package, cancelled: XCircle };

export default function OrdersPage() {
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch real orders from API
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.map((o: any) => ({
            id: o.id || o.order_id,
            date: new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: o.status,
            items: o.items?.length || 0,
            total: o.total || 0,
            delivery: o.status === 'delivered' ? `Delivered` : o.status === 'in_transit' ? 'On the way' : o.status === 'confirmed' ? 'Confirmed — preparing' : o.status === 'pending' ? 'Awaiting confirmation' : o.status === 'cancelled' ? 'Cancelled' : o.status,
            statusColor: statusColorMap[o.status] || 'bg-gray-100 text-gray-700',
            products: o.items?.map((i: any) => `${i.product_name || i.name} x${i.quantity}`) || [],
            paymentMethod: o.payment_method || 'N/A',
            paymentStatus: o.payment_status || 'N/A',
          })));
        }
      } catch {
        // API not available — no orders to show
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title={`Filter ${f}`}>
                  {f === 'all' ? 'All' : statusLabels[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading your orders...</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1">When you place an order, it will show up here.</p>
                <Link href="/products" className="text-orange-600 font-semibold text-sm hover:underline mt-2 inline-block">Browse Products →</Link>
              </div>
            )}

            {filtered.map(order => {
              const Icon = statusIcons[order.status] || Package;
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{order.id}</h3>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.statusColor}`}>{statusLabels[order.status]}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{order.date} · {order.items} items</p>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-lg text-gray-900 flex items-center"><IndianRupee className="w-4 h-4" />{order.total.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-gray-400 mt-0.5">{order.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {order.products.map((p, i) => (
                        <span key={i} className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-lg">{p}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{order.delivery}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-orange-600 font-semibold">
                        <Eye className="w-4 h-4" /> View Details
                      </div>
                    </div>
                  </div>

                  {/* Live tracking banner for in-transit orders */}
                  {order.status === 'in_transit' && order.driver && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Navigation className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Live Tracking — {order.driver.name}</p>
                            <p className="text-blue-100 text-xs">{order.driver.vehicle} · ETA: {order.driver.eta}</p>
                          </div>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          LIVE
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                        <div className="bg-white h-full rounded-full transition-all" style={{ width: `${order.trackingProgress || 0}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-blue-100 mt-1">
                        <span>Picked Up</span>
                        <span>In Transit</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}

                  {/* Pending notice */}
                  {order.status === 'pending' && (
                    <div className="bg-yellow-50 px-5 py-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700 font-medium">Awaiting admin confirmation — you&apos;ll be notified once confirmed</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
