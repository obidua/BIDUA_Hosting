import { Link } from 'react-router-dom';
import { Server, Shield, Zap, Clock, Globe, Headphones as HeadphonesIcon, CheckCircle, TrendingUp } from 'lucide-react';

export function Home() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'NVMe SSD storage and high-performance processors for blazing fast speeds',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Advanced DDoS protection and enterprise-grade security measures',
    },
    {
      icon: Clock,
      title: '99.9% Uptime',
      description: 'Guaranteed uptime with redundant infrastructure and monitoring',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Multiple data centers worldwide for optimal performance',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Expert support team available around the clock to help you',
    },
    {
      icon: TrendingUp,
      title: 'Easy Scaling',
      description: 'Seamlessly upgrade resources as your business grows',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Servers' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '150+', label: 'Countries' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="bg-white">
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Enterprise Cloud Hosting Solutions
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              High-performance cloud servers with unmatched reliability and security. Deploy in seconds, scale effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pricing"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105"
              >
                View Pricing
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition border-2 border-blue-400"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BIDUA Hosting?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for developers, trusted by enterprises. Experience cloud hosting that scales with your ambitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cloud Server Solutions
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect configuration for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition border-2 border-transparent hover:border-blue-500">
              <div className="text-center mb-6">
                <Server className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">General Purpose</h3>
                <p className="text-gray-600">Balanced CPU and memory for most workloads</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Starting from 2 vCPU</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Up to 16GB RAM</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">NVMe SSD Storage</span>
                </li>
              </ul>
              <Link
                to="/pricing?type=general_purpose"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                View Plans
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition border-2 border-transparent hover:border-blue-500">
              <div className="text-center mb-6">
                <Zap className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">CPU Optimized</h3>
                <p className="text-gray-600">High-performance computing workloads</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Up to 32 vCPU</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Dedicated CPU cores</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced CPU features</span>
                </li>
              </ul>
              <Link
                to="/pricing?type=cpu_optimized"
                className="block w-full text-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
              >
                View Plans
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition border-2 border-transparent hover:border-blue-500">
              <div className="text-center mb-6">
                <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Memory Optimized</h3>
                <p className="text-gray-600">Memory-intensive applications</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Up to 256GB RAM</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">High memory-to-CPU ratio</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Perfect for databases</span>
                </li>
              </ul>
              <Link
                to="/pricing?type=memory_optimized"
                className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Deploy your first server in minutes. No credit card required for signup.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
