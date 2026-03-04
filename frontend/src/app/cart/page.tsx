'use client';

import Link from 'next/link';
import { useCartStore } from '@/hooks/useCart';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add construction materials to get started</p>
          <Link href="/products" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium">
            Browse Materials
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const deliveryFee = subtotal > 5000 ? 0 : 500;
  const platformFee = Math.round(subtotal * 0.02);
  const total = subtotal + deliveryFee + platformFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 text-sm">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">📦</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.supplier || 'Nirmaan Marketplace'}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">₹{item.price} <span className="text-xs text-gray-400 font-normal">/{item.unit || 'unit'}</span></p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">−</button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">+</button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm hover:underline mt-1">Remove</button>
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="text-red-500 text-sm hover:underline">
              Clear entire cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium">{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform Fee (2%)</span>
                  <span className="font-medium">₹{platformFee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-lg">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {deliveryFee === 0 && (
                <p className="text-xs text-green-600 mt-3 bg-green-50 p-2 rounded-lg text-center">
                  🎉 Free delivery on orders above ₹5,000!
                </p>
              )}

              <Link href="/checkout" className="block w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg text-center transition-colors">
                Proceed to Checkout
              </Link>

              <Link href="/products" className="block text-center text-sm text-orange-600 hover:underline mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
