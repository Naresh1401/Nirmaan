'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Phone, CreditCard, Truck, Shield, Calendar, Clock, IndianRupee, CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';

export default function CheckoutPage() {
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Peddapalli');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliverySlot, setDeliverySlot] = useState('morning');
  const [notes, setNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = 70050;
  const deliveryFee = 0;
  const platformFee = 2452;
  const total = subtotal + deliveryFee + platformFee;

  if (orderPlaced) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-xl border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
            <p className="text-gray-500 mb-2">Order #NRM-2026-X7K3P</p>
            <p className="text-gray-600 mb-8">Your construction materials are being prepared for delivery. You will receive updates via SMS.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Total Amount</span><span className="font-bold">₹{total.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-medium">Same Day</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="font-medium">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'credit' ? 'Business Credit' : 'Online Payment'}</span></div>
            </div>
            <div className="flex gap-3">
              <Link href="/orders" className="flex-1 bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-all">Track Order</Link>
              <Link href="/products" className="flex-1 border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/cart" className="text-gray-500 hover:text-orange-600"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-500" /> Delivery Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Site Address / Location</label>
                    <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} rows={3} placeholder="Enter your construction site address..." className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-gray-900" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                    <select value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-gray-900">
                      <option>Peddapalli</option><option>Karimnagar</option><option>Ramagundam</option><option>Warangal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Pincode</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="505172" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-gray-900" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Special Instructions</label>
                    <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Contact site supervisor Ramesh at site" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-gray-900" />
                  </div>
                </div>
              </div>

              {/* Delivery Slot */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500" /> Delivery Slot</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'morning', label: 'Morning', time: '6 AM - 10 AM', icon: '🌅' },
                    { value: 'midday', label: 'Midday', time: '10 AM - 2 PM', icon: '☀️' },
                    { value: 'afternoon', label: 'Afternoon', time: '2 PM - 6 PM', icon: '🌤️' },
                    { value: 'anytime', label: 'Any Time', time: 'Flexible', icon: '📦' },
                  ].map(s => (
                    <button key={s.value} onClick={() => setDeliverySlot(s.value)} className={`p-4 rounded-xl border-2 text-center transition-all ${deliverySlot === s.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <span className="text-2xl block mb-1">{s.icon}</span>
                      <p className="font-semibold text-sm text-gray-900">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-orange-500" /> Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when materials are delivered', icon: '💵' },
                    { value: 'online', label: 'Pay Online (UPI / Card)', desc: 'Razorpay secure payment', icon: '💳' },
                    { value: 'credit', label: 'Business Credit', desc: 'Pay in 30/60/90 days (for approved accounts)', icon: '🏦' },
                  ].map(m => (
                    <label key={m.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === m.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={e => setPaymentMethod(e.target.value)} className="text-orange-500 focus:ring-orange-500" />
                      <span className="text-2xl">{m.icon}</span>
                      <div><p className="font-semibold text-gray-900">{m.label}</p><p className="text-xs text-gray-500">{m.desc}</p></div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal (3 items)</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-medium">FREE</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Platform Fee</span><span>₹{platformFee.toLocaleString('en-IN')}</span></div>
                  <div className="border-t pt-2 flex justify-between"><span className="font-bold text-lg">Total</span><span className="font-extrabold text-xl">₹{total.toLocaleString('en-IN')}</span></div>
                </div>

                <button onClick={() => setOrderPlaced(true)} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
                  Place Order
                </button>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Your order is protected by Nirmaan Quality Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
