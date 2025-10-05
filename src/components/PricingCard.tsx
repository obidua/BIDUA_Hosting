import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Cpu, MemoryStick, HardDrive, Network, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface PricingCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    vcpu: number;
    ram: number;
    storage: number;
    bandwidth: number;
    features: string[];
    specifications: {
      prices: {
        monthly: number;
        quarterly: number;
        semiannually: number;
        annually: number;
        biennially: number;
        triennially: number;
      };
    };
  };
  billingCycle: 'monthly' | 'quarterly' | 'semiannually' | 'annually' | 'biennially' | 'triennially';
  popular?: boolean;
}

export function PricingCard({ product, billingCycle, popular }: PricingCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const calculateDisplayPrice = () => {
    const basePrice = product.specifications.prices[billingCycle];
    if (billingCycle === 'monthly') {
      return basePrice;
    }
    const months = billingCycle === 'quarterly' ? 3 : billingCycle === 'semiannually' ? 6 : billingCycle === 'annually' ? 12 : billingCycle === 'biennially' ? 24 : 36;
    return Math.round(basePrice / months);
  };

  const getTotalPrice = () => {
    return product.specifications.prices[billingCycle];
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAdding(true);
    const success = await addToCart(
      product.id,
      billingCycle,
      getTotalPrice(),
      calculateDisplayPrice()
    );

    if (success) {
      setTimeout(() => {
        navigate('/cart');
      }, 500);
    } else {
      setAdding(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl ${
        popular ? 'ring-2 ring-blue-600' : 'border border-gray-200'
      }`}
    >
      {popular && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2.5 text-sm font-bold">
          MOST POPULAR
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
          <div className="text-right">
            <div className="text-sm text-gray-500 line-through">
              ₹{Math.round(calculateDisplayPrice() / 0.9)}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">
              ₹{calculateDisplayPrice().toLocaleString()}
            </span>
            <span className="text-gray-600 ml-2">/month</span>
          </div>
          {billingCycle !== 'monthly' && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              Total: ₹{getTotalPrice().toLocaleString()} for {billingCycle}
            </p>
          )}
        </div>

        <div className="space-y-3 mb-6 border-t border-b border-gray-100 py-4">
          <div className="flex items-center text-sm">
            <Cpu className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
            <span className="font-semibold text-gray-700">{product.vcpu} vCPU</span>
          </div>
          <div className="flex items-center text-sm">
            <MemoryStick className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            <span className="font-semibold text-gray-700">{product.ram}GB RAM</span>
          </div>
          <div className="flex items-center text-sm">
            <HardDrive className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
            <span className="font-semibold text-gray-700">{product.storage}GB SSD</span>
          </div>
          <div className="flex items-center text-sm">
            <Network className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
            <span className="font-semibold text-gray-700">{product.bandwidth}TB Bandwidth</span>
          </div>
        </div>

        <ul className="space-y-2 mb-6">
          {product.features.slice(4).map((feature, i) => (
            <li key={i} className="flex items-start text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`flex items-center justify-center w-full px-6 py-3.5 rounded-lg font-bold transition-all ${
            popular
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {adding ? (
            <>
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
