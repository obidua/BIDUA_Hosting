import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Server, Shield, Clock, Network, Zap, Award, CheckCircle, Database, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PricingCard } from '../components/PricingCard';

type BillingCycle = 'monthly' | 'quarterly' | 'semiannually' | 'annually' | 'biennially' | 'triennially';

interface Product {
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
}

export function Pricing() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedType, setSelectedType] = useState(typeParam || 'general_purpose');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const planTypes = [
    { id: 'general_purpose', name: 'General Purpose VM', icon: Server, color: 'blue' },
    { id: 'cpu_optimized', name: 'CPU Optimized VM', icon: Zap, color: 'orange' },
    { id: 'memory_optimized', name: 'Memory Optimized VM', icon: Database, color: 'green' },
  ];

  const billingCycles = [
    { id: 'monthly' as BillingCycle, name: 'Monthly', discount: 0 },
    { id: 'quarterly' as BillingCycle, name: 'Quarterly', discount: 5 },
    { id: 'semiannually' as BillingCycle, name: 'Semi-Annually', discount: 10 },
    { id: 'annually' as BillingCycle, name: 'Annually', discount: 15 },
    { id: 'biennially' as BillingCycle, name: 'Biennially', discount: 20 },
    { id: 'triennially' as BillingCycle, name: 'Triennially', discount: 25 },
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedType]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', selectedType)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const selectedPlanType = planTypes.find(type => type.id === selectedType);

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-100">
              Cloud Solutions Pricing
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              Enterprise-grade cloud servers powered by Intel® Xeon® Gold Processors
            </p>
            <p className="text-lg text-blue-200 mb-8">
              Deploy in 5 minutes • Full Root Access • 1TB Bandwidth • 99.9% Uptime SLA
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-blue-300" />
                <span>Noida, India</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-blue-300" />
                <span>Milton Keynes, UK</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <Clock className="h-4 w-4 text-blue-300" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Configuration</h2>
            <p className="text-lg text-gray-600">Select billing cycle and server type to view pricing</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex flex-wrap items-center bg-white rounded-xl p-2 shadow-lg border border-gray-200 gap-2">
              {billingCycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => setBillingCycle(cycle.id)}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    billingCycle === cycle.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {cycle.name}
                  {cycle.discount > 0 && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      billingCycle === cycle.id ? 'bg-white/20' : 'bg-green-100 text-green-700'
                    }`}>
                      Save {cycle.discount}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {planTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all shadow-md ${
                  selectedType === type.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <type.icon className="h-6 w-6" />
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {selectedPlanType?.name} Plans
            </h2>
            <p className="text-lg text-gray-600">
              All prices reduced by 10% • Pricing shown per month
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <PricingCard
                  key={product.id}
                  product={product}
                  billingCycle={billingCycle}
                  popular={index === 1}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Plans Include
            </h2>
            <p className="text-lg text-gray-600">Enterprise features included at no extra cost</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'DDoS Protection', desc: 'Advanced threat mitigation' },
              { icon: Clock, title: '99.9% Uptime SLA', desc: 'Guaranteed availability' },
              { icon: Server, title: 'SSD Storage', desc: 'High-performance NVMe' },
              { icon: Network, title: 'IPv4 & IPv6', desc: 'Dual-stack networking' },
              { icon: Zap, title: '5-Minute Deployment', desc: 'Rapid provisioning' },
              { icon: Award, title: 'Intel Xeon Gold', desc: 'Enterprise processors' },
              { icon: CheckCircle, title: 'Free Upgrades', desc: 'Flexible scaling options' },
              { icon: Database, title: 'Automated Backups', desc: 'Daily snapshots included' },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-200">
                <feature.icon className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
