import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Server, Zap, Database, MapPin, Clock, Shield, Award, HardDrive, Cpu, MemoryStick, Network } from 'lucide-react';

type BillingCycle = 'monthly' | 'quarterly' | 'semiannually' | 'annually' | 'biennially' | 'triennially';

interface Plan {
  name: string;
  ram: number;
  vcpu: number;
  storage: number;
  bandwidth: number;
  prices: {
    monthly: number;
    quarterly: number;
    semiannually: number;
    annually: number;
    biennially: number;
    triennially: number;
  };
  features: string[];
  popular?: boolean;
}

export function Pricing() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedType, setSelectedType] = useState(typeParam || 'general_purpose');

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

  const plans: Record<string, Plan[]> = {
    general_purpose: [
      {
        name: 'G.4GB',
        ram: 4,
        vcpu: 2,
        storage: 80,
        bandwidth: 1,
        prices: {
          monthly: 1008,
          quarterly: 2900,
          semiannually: 5450,
          annually: 10300,
          biennially: 19350,
          triennially: 27500,
        },
        features: ['2 vCPU', '4GB RAM', '80GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'G.8GB',
        ram: 8,
        vcpu: 4,
        storage: 160,
        bandwidth: 1,
        prices: {
          monthly: 2016,
          quarterly: 5800,
          semiannually: 10900,
          annually: 20600,
          biennially: 38700,
          triennially: 55000,
        },
        features: ['4 vCPU', '8GB RAM', '160GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
        popular: true,
      },
      {
        name: 'G.16GB',
        ram: 16,
        vcpu: 6,
        storage: 320,
        bandwidth: 1,
        prices: {
          monthly: 3672,
          quarterly: 10550,
          semiannually: 19900,
          annually: 37550,
          biennially: 70600,
          triennially: 100500,
        },
        features: ['6 vCPU', '16GB RAM', '320GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'G.32GB',
        ram: 32,
        vcpu: 8,
        storage: 640,
        bandwidth: 1,
        prices: {
          monthly: 6048,
          quarterly: 17400,
          semiannually: 32750,
          annually: 61850,
          biennially: 116250,
          triennially: 165500,
        },
        features: ['8 vCPU', '32GB RAM', '640GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'G.48GB',
        ram: 48,
        vcpu: 10,
        storage: 960,
        bandwidth: 1,
        prices: {
          monthly: 7963,
          quarterly: 22900,
          semiannually: 43100,
          annually: 81350,
          biennially: 152950,
          triennially: 217750,
        },
        features: ['10 vCPU', '48GB RAM', '960GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'G.64GB',
        ram: 64,
        vcpu: 12,
        storage: 1280,
        bandwidth: 1,
        prices: {
          monthly: 10224,
          quarterly: 29400,
          semiannually: 55350,
          annually: 104450,
          biennially: 196350,
          triennially: 279500,
        },
        features: ['12 vCPU', '64GB RAM', '1280GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'G.96GB',
        ram: 96,
        vcpu: 16,
        storage: 1920,
        bandwidth: 1,
        prices: {
          monthly: 14184,
          quarterly: 40800,
          semiannually: 76800,
          annually: 144900,
          biennially: 272400,
          triennially: 387750,
        },
        features: ['16 vCPU', '96GB RAM', '1920GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'G.128GB',
        ram: 128,
        vcpu: 20,
        storage: 2560,
        bandwidth: 1,
        prices: {
          monthly: 17424,
          quarterly: 50150,
          semiannually: 94400,
          annually: 178200,
          biennially: 335000,
          triennially: 476750,
        },
        features: ['20 vCPU', '128GB RAM', '2560GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'G.256GB',
        ram: 256,
        vcpu: 24,
        storage: 5120,
        bandwidth: 1,
        prices: {
          monthly: 31968,
          quarterly: 91950,
          semiannually: 173100,
          annually: 326700,
          biennially: 614250,
          triennially: 874750,
        },
        features: ['24 vCPU', '256GB RAM', '5120GB SSD Storage', '1TB Bandwidth', 'IPv4 Address', 'Console Access', 'Full Root Access'],
      },
    ],
    cpu_optimized: [
      {
        name: 'C.4GB',
        ram: 4,
        vcpu: 4,
        storage: 80,
        bandwidth: 1,
        prices: {
          monthly: 1512,
          quarterly: 4350,
          semiannually: 8200,
          annually: 15450,
          biennially: 29050,
          triennially: 41250,
        },
        features: ['4 Dedicated vCPU', '4GB RAM', '80GB SSD Storage', '1TB Bandwidth', 'Intel® Xeon® Gold', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'C.8GB',
        ram: 8,
        vcpu: 8,
        storage: 160,
        bandwidth: 1,
        prices: {
          monthly: 3024,
          quarterly: 8700,
          semiannually: 16400,
          annually: 30900,
          biennially: 58100,
          triennially: 82500,
        },
        features: ['8 Dedicated vCPU', '8GB RAM', '160GB SSD Storage', '1TB Bandwidth', 'Intel® Xeon® Gold', 'Console Access', 'Full Root Access'],
        popular: true,
      },
      {
        name: 'C.16GB',
        ram: 16,
        vcpu: 16,
        storage: 320,
        bandwidth: 1,
        prices: {
          monthly: 6048,
          quarterly: 17400,
          semiannually: 32750,
          annually: 61850,
          biennially: 116250,
          triennially: 165500,
        },
        features: ['16 Dedicated vCPU', '16GB RAM', '320GB SSD Storage', '1TB Bandwidth', 'Intel® Xeon® Gold', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'C.32GB',
        ram: 32,
        vcpu: 32,
        storage: 640,
        bandwidth: 1,
        prices: {
          monthly: 12096,
          quarterly: 34800,
          semiannually: 65500,
          annually: 123700,
          biennially: 232500,
          triennially: 331000,
        },
        features: ['32 Dedicated vCPU', '32GB RAM', '640GB SSD Storage', '1TB Bandwidth', 'Intel® Xeon® Gold', 'Console Access', 'Full Root Access'],
      },
    ],
    memory_optimized: [
      {
        name: 'M.8GB',
        ram: 8,
        vcpu: 2,
        storage: 160,
        bandwidth: 1,
        prices: {
          monthly: 1512,
          quarterly: 4350,
          semiannually: 8200,
          annually: 15450,
          biennially: 29050,
          triennially: 41250,
        },
        features: ['2 vCPU', '8GB RAM', '160GB SSD Storage', '1TB Bandwidth', 'High Memory Ratio', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'M.16GB',
        ram: 16,
        vcpu: 4,
        storage: 320,
        bandwidth: 1,
        prices: {
          monthly: 3024,
          quarterly: 8700,
          semiannually: 16400,
          annually: 30900,
          biennially: 58100,
          triennially: 82500,
        },
        features: ['4 vCPU', '16GB RAM', '320GB SSD Storage', '1TB Bandwidth', 'High Memory Ratio', 'Console Access', 'Full Root Access'],
        popular: true,
      },
      {
        name: 'M.32GB',
        ram: 32,
        vcpu: 8,
        storage: 640,
        bandwidth: 1,
        prices: {
          monthly: 6048,
          quarterly: 17400,
          semiannually: 32750,
          annually: 61850,
          biennially: 116250,
          triennially: 165500,
        },
        features: ['8 vCPU', '32GB RAM', '640GB SSD Storage', '1TB Bandwidth', 'High Memory Ratio', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'M.64GB',
        ram: 64,
        vcpu: 16,
        storage: 1280,
        bandwidth: 1,
        prices: {
          monthly: 12096,
          quarterly: 34800,
          semiannually: 65500,
          annually: 123700,
          biennially: 232500,
          triennially: 331000,
        },
        features: ['16 vCPU', '64GB RAM', '1280GB SSD Storage', '1TB Bandwidth', 'High Memory Ratio', 'Console Access', 'Full Root Access'],
      },
      {
        name: 'M.128GB',
        ram: 128,
        vcpu: 24,
        storage: 2560,
        bandwidth: 1,
        prices: {
          monthly: 24192,
          quarterly: 69600,
          semiannually: 131000,
          annually: 247400,
          biennially: 465000,
          triennially: 662000,
        },
        features: ['24 vCPU', '128GB RAM', '2560GB SSD Storage', '1TB Bandwidth', 'High Memory Ratio', 'Console Access', 'Full Root Access'],
      },
    ],
  };

  const currentPlans = plans[selectedType as keyof typeof plans];
  const selectedPlanType = planTypes.find(type => type.id === selectedType);

  const calculateDisplayPrice = (plan: Plan) => {
    const basePrice = plan.prices[billingCycle];
    if (billingCycle === 'monthly') {
      return basePrice;
    }
    const months = billingCycle === 'quarterly' ? 3 : billingCycle === 'semiannually' ? 6 : billingCycle === 'annually' ? 12 : billingCycle === 'biennially' ? 24 : 36;
    return Math.round(basePrice / months);
  };

  const getTotalPrice = (plan: Plan) => {
    return plan.prices[billingCycle];
  };

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
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
                    ? `bg-${type.color}-600 text-white shadow-lg scale-105`
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl ${
                  plan.popular ? 'ring-2 ring-blue-600' : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2.5 text-sm font-bold">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">
                        ₹{Math.round(calculateDisplayPrice(plan) / 0.9)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        ₹{calculateDisplayPrice(plan).toLocaleString()}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    {billingCycle !== 'monthly' && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        Total: ₹{getTotalPrice(plan).toLocaleString()} for {billingCycle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6 border-t border-b border-gray-100 py-4">
                    <div className="flex items-center text-sm">
                      <Cpu className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-gray-700">{plan.vcpu} vCPU</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MemoryStick className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-gray-700">{plan.ram}GB RAM</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <HardDrive className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-gray-700">{plan.storage}GB SSD</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Network className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-gray-700">{plan.bandwidth}TB Bandwidth</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(4).map((feature, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className={`block w-full text-center px-6 py-3.5 rounded-lg font-bold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Deploy Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
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

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose the Right Plan for Your Needs
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-200">
              <Server className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">General Purpose VM</h3>
              <p className="text-gray-700 mb-4">
                Balanced CPU and memory resources perfect for web applications, development environments, and small to medium databases.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Web hosting and CMS platforms</li>
                <li>• Application development</li>
                <li>• Small business workloads</li>
                <li>• Testing and staging environments</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-2 border-orange-200">
              <Zap className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">CPU Optimized VM</h3>
              <p className="text-gray-700 mb-4">
                Dedicated CPU cores with high-performance Intel Xeon processors for compute-intensive applications and workloads.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Video encoding and rendering</li>
                <li>• Scientific computing</li>
                <li>• High-traffic web servers</li>
                <li>• Batch processing workloads</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-200">
              <Database className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Memory Optimized VM</h3>
              <p className="text-gray-700 mb-4">
                High memory-to-CPU ratio designed for memory-intensive applications, large databases, and in-memory processing.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Large database systems</li>
                <li>• In-memory caching (Redis, Memcached)</li>
                <li>• Big data analytics</li>
                <li>• SAP HANA and enterprise apps</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-xl mb-3 text-blue-100">
            Contact our sales team for enterprise pricing, custom configurations, and dedicated support
          </p>
          <p className="text-lg mb-8 text-blue-200">
            📞 +91 120 416 8464 • Mon-Sat 9:00-18:00
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition transform hover:scale-105 shadow-lg"
          >
            Contact Sales Team
          </Link>
        </div>
      </section>
    </div>
  );
}
