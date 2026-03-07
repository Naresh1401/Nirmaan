'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { usePremium } from '@/context/PremiumContext';
import { MapPin, CreditCard, Truck, Shield, Calendar, Clock, CheckCircle2, ArrowLeft, Building2, Smartphone, ShoppingCart, Crown, Gift } from 'lucide-react';
import { useCartStore } from '@/hooks/useCart';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { isPremium, membershipTier, loyaltyPoints, benefits } = usePremium();
  const { items: cartItems, getTotal, getItemCount, clearCart } = useCartStore();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Peddapalli');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliverySlot, setDeliverySlot] = useState('morning');
  const [notes, setNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [applyPoints, setApplyPoints] = useState(false);
  const [pointsToApply, setPointsToApply] = useState(0);

  const subtotal = getTotal();
  // Premium discount
  const discountPercent = isPremium ? ((benefits as Record<string, unknown>)?.discount_percent as number ?? 0) : 0;
  const premiumDiscount = Math.round(subtotal * discountPercent / 100);
  const discountedSubtotal = subtotal - premiumDiscount;

  // Delivery fee based on tier
  const freeDeliveryThreshold = isPremium
    ? ((benefits as Record<string, unknown>)?.free_delivery_threshold as number ?? 10000)
    : 10000;
  const deliveryFee = freeDeliveryThreshold === 0 || discountedSubtotal >= freeDeliveryThreshold ? 0 : discountedSubtotal > 0 ? 300 : 0;

  const platformFee = Math.round(discountedSubtotal * 0.035);
  // maxPointsUsable: cap redeemable points so the discount can't exceed the order total.
  // 100 loyalty points = ₹1, so multiply total (in ₹) by 100 to get the equivalent points cap.
  const maxPointsUsable = loyaltyPoints ? Math.min(loyaltyPoints.available_points, Math.round((discountedSubtotal + deliveryFee + platformFee) * 100)) : 0;
  const loyaltyDiscount = applyPoints ? Math.round(pointsToApply / 100) : 0;
  const total = discountedSubtotal + deliveryFee + platformFee - loyaltyDiscount;
  const itemCount = getItemCount();

  const handlePlaceOrder = async () => {
    setProcessing(true);
    await new Promise(res => setTimeout(res, 1500));
    const id = 'NRM-' + Date.now().toString(36).toUpperCase();
    setOrderId(id);
    clearCart();
    setProcessing(false);
    setOrderPlaced(true);
  };

  const paymentLabel = () => {
    const m: Record<string, string> = { cod: 'Cash on Delivery', card: 'Credit/Debit Card', netbanking: 'Net Banking', upi: 'UPI Payment', phonepe: 'PhonePe', googlepay: 'Google Pay', credit: 'Business Credit' };
    return m[paymentMethod] || paymentMethod;
  };

  // If cart is empty and no order just placed, show empty state
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-xl border border-gray-100">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some items to your cart before checking out.</p>
            <Link href="/products" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-all inline-block">Browse Products</Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (orderPlaced) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-xl border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
            <p className="text-gray-500 mb-2">Order #{orderId}</p>
            <p className="text-gray-600 mb-6">Your construction materials are being prepared for delivery. You&apos;ll receive updates via SMS.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Amount</span><span className="font-bold">₹{total.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-medium">Same Day</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="font-medium">{paymentLabel()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Payment Status</span>
                <span className={`font-semibold ${paymentMethod === 'cod' ? 'text-yellow-600' : 'text-green-600'}`}>{paymentMethod === 'cod' ? 'Pay on Delivery' : 'Paid ✓'}</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-1"><Truck className="w-5 h-5 text-blue-600" /><span className="font-semibold text-blue-800 text-sm">Live Tracking Available</span></div>
              <p className="text-blue-600 text-xs">Track your delivery in real-time once the admin confirms and assigns a delivery partner.</p>
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
                    <select value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-gray-900" title="Select city">
                      <option>Peddapalli</option><option>Karimnagar</option><option>Ramagundam</option><option>Warangal</option><option>Hyderabad</option><option>Nizamabad</option>
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
                    <button key={s.value} onClick={() => setDeliverySlot(s.value)} className={`p-4 rounded-xl border-2 text-center transition-all ${deliverySlot === s.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`} title={`${s.label} slot`}>
                      <span className="text-2xl block mb-1">{s.icon}</span>
                      <p className="font-semibold text-sm text-gray-900">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-orange-500" /> Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay cash when materials are delivered to your site', icon: '💵', badge: 'Popular' },
                    { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay — secure 3D payment', icon: '💳', badge: '' },
                    { value: 'netbanking', label: 'Net Banking', desc: 'SBI, HDFC, ICICI, Axis & 50+ banks', icon: '🏦', badge: '' },
                    { value: 'upi', label: 'UPI (Any UPI App)', desc: 'Pay via any UPI app using your VPA/UPI ID', icon: '📱', badge: '' },
                    { value: 'phonepe', label: 'PhonePe', desc: 'Pay directly via PhonePe wallet or UPI', icon: '🟣', badge: '' },
                    { value: 'googlepay', label: 'Google Pay (GPay)', desc: 'Pay via Google Pay — fast & secure', icon: '🔵', badge: '' },
                    { value: 'credit', label: 'Business Credit (Buy Now, Pay Later)', desc: 'Pay in 30/60/90 days — for approved accounts only', icon: '🏛️', badge: '0% for 30 days' },
                  ].map(m => (
                    <label key={m.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === m.value ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={e => setPaymentMethod(e.target.value)} className="text-orange-500 focus:ring-orange-500 mt-0.5" />
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{m.label}</p>
                          {m.badge && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">{m.badge}</span>}
                        </div>
                        <p className="text-xs text-gray-500">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><CreditCard className="w-4 h-4" /> Card Details</h3>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Cardholder Name</label>
                      <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Card Number</label>
                      <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 tracking-wider" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Expiry (MM/YY)</label>
                        <input type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="12/28" maxLength={5} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">CVV</label>
                        <input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="•••" maxLength={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400"><Shield className="w-3.5 h-3.5" /><span>Secured with 256-bit SSL encryption & 3D Secure</span></div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Select Your Bank</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak', 'Bank of Baroda', 'PNB', 'Canara Bank'].map(b => (
                        <button key={b} onClick={() => setSelectedBank(b)} className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${selectedBank === b ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`} title={`Select ${b}`}>{b}</button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">You will be redirected to your bank&apos;s secure login page.</p>
                  </div>
                )}

                {/* UPI */}
                {paymentMethod === 'upi' && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Smartphone className="w-4 h-4" /> UPI Payment</h3>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Enter UPI ID / VPA</label>
                      <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi or 9876543210@paytm" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900" />
                    </div>
                    <p className="text-xs text-gray-400">A payment request will be sent to your UPI app. Approve within 5 minutes.</p>
                  </div>
                )}

                {/* PhonePe */}
                {paymentMethod === 'phonepe' && (
                  <div className="mt-5 p-5 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🟣</span>
                      <div>
                        <h3 className="font-semibold text-purple-900 text-sm">PhonePe Payment</h3>
                        <p className="text-xs text-purple-600">You will be redirected to PhonePe to complete payment of ₹{total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-purple-500">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Instant</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Cashback eligible</span>
                    </div>
                  </div>
                )}

                {/* Google Pay */}
                {paymentMethod === 'googlepay' && (
                  <div className="mt-5 p-5 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🔵</span>
                      <div>
                        <h3 className="font-semibold text-blue-900 text-sm">Google Pay</h3>
                        <p className="text-xs text-blue-600">You will be redirected to Google Pay to complete payment of ₹{total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-blue-500">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Instant</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Rewards eligible</span>
                    </div>
                  </div>
                )}

                {/* Business Credit */}
                {paymentMethod === 'credit' && (
                  <div className="mt-5 p-5 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏛️</span>
                      <div>
                        <h3 className="font-semibold text-amber-900 text-sm">Nirmaan Business Credit</h3>
                        <p className="text-xs text-amber-700">₹{total.toLocaleString('en-IN')} will be charged to your credit line. Pay within 30 days for 0% interest.</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">This Order</span><span className="font-bold text-orange-600">₹{total.toLocaleString('en-IN')}</span></div>
                      <p className="text-amber-600 text-[11px] mt-1">Credit details will be checked during order processing.</p>
                    </div>
                    <Link href="/credit" className="text-xs text-orange-600 font-semibold hover:underline">View Credit Dashboard →</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24 space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>

                {/* Premium Discount notice */}
                {isPremium && discountPercent > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                    <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-amber-700 font-medium">{discountPercent}% Premium discount applied!</span>
                  </div>
                )}

                {/* Loyalty Points */}
                {isPremium && loyaltyPoints && loyaltyPoints.available_points > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-purple-800">Loyalty Points</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyPoints}
                          onChange={(e) => {
                            setApplyPoints(e.target.checked);
                            if (e.target.checked) setPointsToApply(maxPointsUsable);
                            else setPointsToApply(0);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                    <p className="text-xs text-purple-600">
                      {loyaltyPoints.available_points.toLocaleString('en-IN')} pts available
                      {applyPoints && ` — ₹${loyaltyDiscount} discount applied`}
                    </p>
                    {applyPoints && (
                      <div className="mt-2">
                        <input
                          type="range"
                          min={0}
                          max={maxPointsUsable}
                          step={100}
                          value={pointsToApply}
                          onChange={(e) => setPointsToApply(Number(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                        <div className="flex justify-between text-[10px] text-purple-500 mt-0.5">
                          <span>0 pts</span>
                          <span className="font-bold">{pointsToApply} pts = ₹{Math.round(pointsToApply / 100)}</span>
                          <span>{maxPointsUsable} pts</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal ({itemCount} items)</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  {premiumDiscount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Premium Discount ({discountPercent}%)</span><span>-₹{premiumDiscount.toLocaleString('en-IN')}</span></div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                  {isPremium && freeDeliveryThreshold === 0 && (
                    <p className="text-[10px] text-amber-600 flex items-center gap-1"><Crown className="w-3 h-3" /> Free delivery included with your plan</p>
                  )}
                  <div className="flex justify-between"><span className="text-gray-500">Platform Fee</span><span>₹{platformFee.toLocaleString('en-IN')}</span></div>
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-purple-600"><span>Loyalty Points ({pointsToApply} pts)</span><span>-₹{loyaltyDiscount}</span></div>
                  )}
                  <div className="border-t pt-2 flex justify-between"><span className="font-bold text-lg">Total</span><span className="font-extrabold text-xl">₹{total.toLocaleString('en-IN')}</span></div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between"><span>Payment</span><span className="font-semibold text-gray-700">{paymentLabel()}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span className="font-semibold text-gray-700">{deliverySlot === 'morning' ? '6-10 AM' : deliverySlot === 'midday' ? '10 AM-2 PM' : deliverySlot === 'afternoon' ? '2-6 PM' : 'Flexible'}</span></div>
                </div>
                <button onClick={handlePlaceOrder} disabled={processing}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {processing ? (
                    <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing Payment...</>
                  ) : paymentMethod === 'cod' ? 'Place Order (Pay on Delivery)' : paymentMethod === 'credit' ? 'Place Order (Use Credit)' : `Pay ₹${total.toLocaleString('en-IN')} & Place Order`}
                </button>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Shield className="w-4 h-4 text-green-500" /><span>Protected by Nirmaan Quality Guarantee</span></div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Truck className="w-4 h-4 text-blue-500" /><span>Real-time GPS tracking after dispatch</span></div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-2 text-center">ACCEPTED PAYMENT METHODS</p>
                  <div className="flex items-center justify-center gap-3 text-xl">
                    <span title="Cash">💵</span><span title="Card">💳</span><span title="Net Banking">🏦</span><span title="UPI">📱</span><span title="PhonePe">🟣</span><span title="Google Pay">🔵</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
