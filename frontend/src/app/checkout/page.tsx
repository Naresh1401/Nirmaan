'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/hooks/useCart';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [address, setAddress] = useState({ name: '', phone: '', address: '', city: 'Peddapalli', pincode: '', landmark: '' });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [deliveryType, setDeliveryType] = useState('standard');

  const subtotal = getTotal();
  const deliveryFee = deliveryType === 'express' ? 800 : deliveryType === 'urgent' ? 1500 : subtotal > 5000 ? 0 : 500;
  const platformFee = Math.round(subtotal * 0.02);
  const total = subtotal + deliveryFee + platformFee;

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 mb-2">Order #NRM-{Date.now().toString(36).toUpperCase()}</p>
          <p className="text-gray-500 mb-6">You&apos;ll receive a confirmation on your phone shortly.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/orders" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium">
              Track Order
            </Link>
            <Link href="/products" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <Link href="/products" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium">Browse Materials</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-4">
            {[{ n: 1, label: 'Delivery' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Review' }].map((s) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.n ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{s.n}</div>
                <span className={`text-sm ${step >= s.n ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s.label}</span>
                {s.n < 3 && <div className={`w-12 h-0.5 ${step > s.n ? 'bg-orange-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-4">📍 Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Full Name *" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="input-field" />
                  <input placeholder="Phone Number *" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="input-field" />
                  <input placeholder="Address / Site Location *" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className="input-field md:col-span-2" />
                  <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field" />
                  <input placeholder="Pincode *" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="input-field" />
                  <input placeholder="Landmark (optional)" value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} className="input-field md:col-span-2" />
                </div>

                {/* Delivery Type */}
                <h3 className="font-semibold text-gray-900 mt-6 mb-3">🚚 Delivery Speed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'standard', label: 'Standard', time: '24-48 hrs', fee: subtotal > 5000 ? 'FREE' : '₹500' },
                    { id: 'express', label: 'Express', time: '6-12 hrs', fee: '₹800' },
                    { id: 'urgent', label: 'Urgent', time: '2-4 hrs', fee: '₹1,500' },
                  ].map((d) => (
                    <button key={d.id} onClick={() => setDeliveryType(d.id)} className={`p-3 rounded-lg border-2 text-left ${deliveryType === d.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                      <p className="font-medium text-sm">{d.label}</p>
                      <p className="text-xs text-gray-500">{d.time}</p>
                      <p className="text-xs font-medium mt-1">{d.fee}</p>
                    </button>
                  ))}
                </div>

                <button onClick={() => setStep(2)} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg">
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-4">💳 Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'upi', label: 'UPI (GPay / PhonePe)', icon: '📱' },
                    { id: 'razorpay', label: 'Razorpay (Cards / Net Banking)', icon: '💳' },
                    { id: 'credit', label: 'Nirmaan Credit (Pay Later)', icon: '🏦' },
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                  ].map((pm) => (
                    <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} className={`w-full p-4 rounded-lg border-2 text-left flex items-center gap-3 ${paymentMethod === pm.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <span className="text-2xl">{pm.icon}</span>
                      <span className="font-medium text-gray-900">{pm.label}</span>
                      {paymentMethod === pm.id && <span className="ml-auto text-orange-500">✓</span>}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg">← Back</button>
                  <button onClick={() => setStep(3)} className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg">Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-4">📋 Review Order</h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-sm text-gray-900">Delivery Address</h3>
                  <p className="text-sm text-gray-600">{address.name}, {address.phone}</p>
                  <p className="text-sm text-gray-600">{address.address}, {address.city} - {address.pincode}</p>
                </div>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg">← Back</button>
                  <button onClick={handlePlaceOrder} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex-1">
                    Place Order — ₹{total.toLocaleString()}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
              <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Items ({items.length})</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Platform Fee</span><span>₹{platformFee}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
