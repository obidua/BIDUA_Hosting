import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Shield, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

export function Cart() {
  const { items, itemCount, total, loading, removeItem, updateItem } = useCart();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (itemId: string) => {
    setRemoving(itemId);
    await removeItem(itemId);
    setRemoving(null);
  };

  const handleQuantityChange = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    await updateItem(itemId, { quantity: newQty });
  };

  const getBillingCycleDisplay = (cycle: string) => {
    const labels: Record<string, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly (3 Months)',
      semiannually: 'Semi-Annually (6 Months)',
      annually: 'Annually (12 Months)',
      biennially: 'Biennially (24 Months)',
      triennially: 'Triennially (36 Months)',
    };
    return labels[cycle] || cycle;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Your Cart</h1>
              <p className="text-blue-200">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
            <Package className="h-20 w-20 text-blue-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-blue-200 mb-8">
              Start building your cloud infrastructure today
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition transform hover:scale-105 shadow-lg"
            >
              Browse Plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-blue-200">
                            {getBillingCycleDisplay(item.billing_cycle)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={removing === item.id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-blue-300 mb-1">vCPU</p>
                          <p className="text-white font-semibold">{item.product?.vcpu}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-blue-300 mb-1">RAM</p>
                          <p className="text-white font-semibold">{item.product?.ram}GB</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-blue-300 mb-1">Storage</p>
                          <p className="text-white font-semibold">{item.product?.storage}GB</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-blue-300 mb-1">Bandwidth</p>
                          <p className="text-white font-semibold">{item.product?.bandwidth}TB</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-white font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-blue-200">
                            ₹{item.monthly_price.toLocaleString()}/month
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 sticky top-6">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-blue-200">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>Tax</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between text-white">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-2xl font-bold">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition transform hover:scale-105 shadow-lg mb-4"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>

                <Link
                  to="/pricing"
                  className="block w-full text-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition"
                >
                  Continue Shopping
                </Link>

                <div className="mt-6 pt-6 border-t border-white/20 space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-blue-200">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span>Secure checkout process</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-blue-200">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span>Instant server deployment</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-blue-200">
                    <Package className="h-5 w-5 text-blue-400" />
                    <span>24/7 support included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
