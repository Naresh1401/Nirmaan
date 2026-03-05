'use client';

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Package, Truck, CheckCircle2, MapPin, Phone, Clock, ArrowLeft, IndianRupee, Star, Camera, Calendar, Navigation, AlertCircle, CreditCard, Shield, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OrderDetail {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  items: { name: string; qty: number; price: number }[];
  tracking: { label: string; time: string; done: boolean; desc?: string }[];
  driver?: { name: string; phone: string; vehicle: string; vehicleType: string; eta: string };
  address: { line1: string; line2: string };
  deliverySlot: string;
  deliveredAt?: string;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    params.then(p => {
      setOrderId(p.id);
      fetchOrder(p.id);
    });
  }, [params]);

  const fetchOrder = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrder({
          id: data.id || data.order_id || id,
          status: data.status || 'pending',
          paymentMethod: data.payment_method || 'N/A',
          paymentStatus: data.payment_status || 'N/A',
          total: data.total || 0,
          items: data.items?.map((i: any) => ({ name: i.product_name || i.name, qty: i.quantity, price: i.price })) || [],
          tracking: data.tracking || [
            { label: 'Order Placed', time: new Date(data.created_at).toLocaleString('en-IN'), done: true, desc: 'Your order has been received' },
          ],
          driver: data.driver || undefined,
          address: data.address || { line1: data.delivery_address || 'Address not set', line2: '' },
          deliverySlot: data.delivery_slot || 'N/A',
          deliveredAt: data.delivered_at,
        });
      }
    } catch {
      // Order not found or API unavailable
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading order details...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 max-w-md w-full">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Order Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">We couldn&apos;t find order &quot;{orderId}&quot;. It may not exist or you might not have access to it.</p>
            <Link href="/orders" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-all inline-block">View My Orders</Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const isLive = order.status === 'in_transit';
  const isDelivered = order.status === 'delivered';

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrder(orderId).finally(() => setRefreshing(false));
  };

  const statusBadge = () => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-orange-100 text-orange-700',
      in_transit: 'bg-blue-100 text-blue-700', delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: 'Pending', confirmed: 'Confirmed', in_transit: 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled',
    };
    return <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors[order.status] || 'bg-gray-100 text-gray-700'}`}>{labels[order.status] || order.status}</span>;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/orders" className="text-gray-500 hover:text-orange-600"><ArrowLeft className="w-5 h-5" /></Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order {orderId}</h1>
                <p className="text-sm text-gray-500">Track your delivery in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge()}
              <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh tracking">
                <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Live Tracking Banner (for in-transit orders) */}
          {isLive && order.driver && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="font-bold text-sm tracking-wide">LIVE TRACKING</span>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">ETA: {order.driver.eta}</span>
              </div>

              {/* Simulated Map */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{order.driver.name}</p>
                      <p className="text-blue-200 text-xs">{order.driver.vehicleType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-200">Vehicle</p>
                    <p className="font-mono font-bold text-sm">{order.driver.vehicle}</p>
                  </div>
                </div>

                {/* Progress visualization */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">📦</div>
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full w-[70%] relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <Navigation className="w-2.5 h-2.5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">📍</div>
                  </div>
                  <div className="flex justify-between text-[10px] text-blue-200 mt-1">
                    <span>Supplier Pickup</span>
                    <span>Your Site</span>
                  </div>
                </div>
              </div>

              {/* Driver actions */}
              <div className="flex gap-2">
                <a href={`tel:${order.driver.phone}`} className="flex-1 bg-white/20 hover:bg-white/30 rounded-xl py-3 text-center font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                  <Phone className="w-4 h-4" /> Call Driver
                </a>
                <button className="flex-1 bg-white/20 hover:bg-white/30 rounded-xl py-3 text-center font-semibold text-sm flex items-center justify-center gap-2 transition-colors" title="Open map">
                  <MapPin className="w-4 h-4" /> Open Map
                </button>
              </div>
            </div>
          )}

          {/* Delivered Banner */}
          {isDelivered && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 mb-6 text-white flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-lg">Successfully Delivered!</p>
                <p className="text-green-100 text-sm">{order.deliveredAt} · Materials verified at your site</p>
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-orange-500" /> Delivery Tracking
              </h2>
              {isLive && <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" /> Updating live</span>}
            </div>
            <div className="relative">
              {order.tracking.map((step, i) => (
                <div key={i} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.done ? 'bg-green-500 border-green-500 text-white' :
                      i === order.tracking.findIndex(s => !s.done) ? 'bg-white border-orange-500 text-orange-500 animate-pulse' :
                      'bg-gray-100 border-gray-200 text-gray-300'
                    }`}>
                      {step.done ? <CheckCircle2 className="w-5 h-5" /> :
                       i === order.tracking.findIndex(s => !s.done) ? <Clock className="w-5 h-5" /> :
                       <div className="w-3 h-3 bg-gray-200 rounded-full" />}
                    </div>
                    {i < order.tracking.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-1 ${step.done ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-2 flex-1">
                    <p className={`font-semibold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    <p className="text-sm text-gray-500">{step.time}</p>
                    {step.desc && <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-orange-500" /> Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-2xl">📦</span>
                    <div className="flex-1"><p className="font-medium text-gray-900 text-sm">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.qty}</p></div>
                    <span className="font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span><span className="flex items-center"><IndianRupee className="w-4 h-4" />{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Payment Info */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-orange-500" /> Payment Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-semibold text-gray-900">{order.paymentMethod}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span>
                    <span className={`font-semibold ${order.paymentStatus === 'Paid' ? 'text-green-600' : order.paymentStatus === 'Refunded' ? 'text-red-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-orange-500" /> Delivery Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="font-medium text-gray-900">{order.address.line1}</p><p className="text-gray-500">{order.address.line2}</p></div></div>
                  {order.driver && (
                    <div className="flex items-start gap-3"><Truck className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="font-medium text-gray-900">{order.driver.name} ({order.driver.vehicle})</p><p className="text-gray-500">{order.driver.vehicleType}</p></div></div>
                  )}
                  <div className="flex items-start gap-3"><Calendar className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="font-medium text-gray-900">{isDelivered ? `Delivered: ${order.deliveredAt}` : `Slot: ${order.deliverySlot}`}</p></div></div>
                </div>
              </div>

              {/* Quality Verification (shown only if delivered) */}
              {isDelivered && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-green-500" /> Quality Verification</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl"><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="text-green-700 font-medium">Weight verified at delivery ✓</span></div>
                    <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl"><Camera className="w-5 h-5 text-green-600" /><span className="text-green-700 font-medium">Delivery photo uploaded ✓</span></div>
                    <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl"><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="text-green-700 font-medium">Material quality certified ✓</span></div>
                  </div>
                </div>
              )}

              {/* Rate Order (shown only if delivered) */}
              {isDelivered && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3">Rate this Order</h3>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-8 h-8 text-gray-300 hover:text-orange-400 cursor-pointer transition-colors" />)}
                  </div>
                  <textarea placeholder="Share your experience..." rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900" />
                  <button className="mt-3 bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-all text-sm">Submit Review</button>
                </div>
              )}

              {/* Help / Support */}
              {!isDelivered && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                  <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Need Help?</h3>
                  <p className="text-orange-700 text-sm mb-3">Having issues with your order? Contact our support team.</p>
                  <div className="flex gap-2">
                    <a href="tel:1800NIRMAAN" className="flex-1 bg-orange-500 text-white font-semibold text-sm py-2.5 rounded-xl text-center hover:bg-orange-600 transition-colors">Call Support</a>
                    <button className="flex-1 border border-orange-300 text-orange-700 font-semibold text-sm py-2.5 rounded-xl text-center hover:bg-orange-100 transition-colors">Chat with Us</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
