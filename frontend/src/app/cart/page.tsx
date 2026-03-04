'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Trash2, Minus, Plus, ShoppingCart, IndianRupee, ArrowRight, Package, Truck, Tag, ArrowLeft } from 'lucide-react';

interface CartItem {
  id: string; name: string; brand: string; supplier: string; price: number; mrp: number; quantity: number; unit: string; image: string; stock: number;
}

const initialCart: CartItem[] = [
  { id: '1', name: 'UltraTech Cement PPC (50kg)', brand: 'UltraTech', supplier: 'Peddapalli Traders', price: 385, mrp: 420, quantity: 10, unit: 'bag', image: '🏗️', stock: 250 },
  { id: '4', name: 'JSW TMT Steel Bar 8mm', brand: 'JSW', supplier: 'Sri Steel Works', price: 58000, mrp: 63000, quantity: 1, unit: 'ton', image: '🔩', stock: 45 },
  { id: '6', name: 'River Sand Fine Grade', brand: 'Natural', supplier: 'Godavari Sand Depot', price: 2800, mrp: 3200, quantity: 3, unit: 'ton', image: '⏳', stock: 500 },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)) } : item));
  };
  const removeItem = (id: string) => setCart(cart.filter(item => item.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = cart.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0);
  const deliveryFee = subtotal > 5000 ? 0 : 300;
  const platformFee = Math.round(subtotal * 0.035);
  const total = subtotal + deliveryFee + platformFee;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/products" className="text-gray-500 hover:text-orange-600"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-full">{cart.length} items</span>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Browse our products and add items to your cart</p>
              <Link href="/products" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-all">Browse Products</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-4">
                    <div className="bg-gray-50 rounded-xl w-24 h-24 flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">{item.image}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-orange-600 font-semibold">{item.brand}</p>
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Sold by: {item.supplier}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => updateQty(item.id, -1)} className="p-2 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                          <span className="px-4 font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-2 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-lg text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                          <div className="text-xs text-gray-400">₹{item.price.toLocaleString('en-IN')}/{item.unit}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal ({cart.length} items)</span><span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Platform Fee (3.5%)</span><span>₹{platformFee.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> Total Savings</span>
                      <span className="font-semibold">-₹{savings.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-extrabold text-xl flex items-center"><IndianRupee className="w-5 h-5" />{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Link href="/checkout" className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25">
                    Proceed to Checkout <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="mt-4 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-green-500" /> Free delivery on orders above ₹5,000</div>
                    <div className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /> Weight verification at delivery</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
