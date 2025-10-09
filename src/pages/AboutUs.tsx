import { Link } from 'react-router-dom';
import { Building2, ArrowLeft, Users, Award, Globe, Shield, Zap, HeartHandshake } from 'lucide-react';

export function AboutUs() {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Enterprise-grade security measures protect your data and infrastructure 24/7.',
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Lightning-fast servers powered by Intel Xeon Gold processors and NVMe storage.',
    },
    {
      icon: HeartHandshake,
      title: 'Customer Focus',
      description: 'Dedicated support team available around the clock to assist you.',
    },
    {
      icon: Award,
      title: 'Reliability',
      description: '99.9% uptime SLA ensures your services are always available.',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Active Customers' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Support Available' },
    { value: '15+', label: 'Global Data Centers' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl shadow-2xl p-8 md:p-12 border border-cyan-500/30">
          <div className="flex items-center mb-6">
            <Building2 className="h-10 w-10 text-cyan-400 mr-4" />
            <h1 className="text-4xl font-bold text-white">About BIDUA Hosting</h1>
          </div>

          <div className="space-y-12 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
              <p className="mb-4 leading-relaxed">
                Founded in 2020, BIDUA Hosting emerged from a simple vision: to provide enterprise-grade cloud infrastructure that's accessible to businesses of all sizes. We recognized that many companies struggled with the complexity and cost of traditional hosting solutions, and we set out to change that.
              </p>
              <p className="mb-4 leading-relaxed">
                Today, we serve over 10,000 customers worldwide, from startups to Fortune 500 companies. Our state-of-the-art data centers span across 15 global locations, ensuring low latency and high availability for your applications no matter where your users are located.
              </p>
              <p className="leading-relaxed">
                What started as a small team of passionate engineers has grown into a comprehensive cloud solutions provider, offering everything from virtual private servers to dedicated infrastructure and managed services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Our Mission</h2>
              <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/50 rounded-lg p-6">
                <p className="text-lg text-white leading-relaxed">
                  To empower businesses with reliable, secure, and scalable cloud infrastructure that drives innovation and growth. We believe that world-class hosting should be accessible to everyone, backed by exceptional support and transparent pricing.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-500/60 transition"
                  >
                    <value.icon className="h-10 w-10 text-cyan-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-slate-300">{value.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6">By the Numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/50 rounded-lg p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-sm text-cyan-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Our Infrastructure</h2>
              <p className="mb-4 leading-relaxed">
                BIDUA Hosting operates on cutting-edge infrastructure designed for maximum performance and reliability:
              </p>
              <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3"></div>
                    <span><strong className="text-white">Tier 3+ Data Centers:</strong> Redundant power, cooling, and network connectivity ensure maximum uptime.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3"></div>
                    <span><strong className="text-white">Intel Xeon Gold Processors:</strong> Latest generation CPUs deliver exceptional compute performance.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3"></div>
                    <span><strong className="text-white">NVMe SSD Storage:</strong> Ultra-fast storage with read/write speeds up to 3,500 MB/s.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3"></div>
                    <span><strong className="text-white">10 Gbps Network:</strong> High-bandwidth connections ensure fast data transfer and low latency.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3"></div>
                    <span><strong className="text-white">Advanced DDoS Protection:</strong> Multi-layered security protects against attacks up to 1 Tbps.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3"></div>
                    <span><strong className="text-white">Automated Backups:</strong> Daily snapshots ensure your data is always recoverable.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Why Choose BIDUA Hosting?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Globe className="h-6 w-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Global Reach</h3>
                      <p className="text-sm">Deploy your services in 15+ locations worldwide for optimal performance.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-6 w-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Expert Support</h3>
                      <p className="text-sm">24/7 technical support from experienced cloud engineers.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award className="h-6 w-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Industry Recognition</h3>
                      <p className="text-sm">Award-winning infrastructure and customer service excellence.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Shield className="h-6 w-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Bank-Level Security</h3>
                      <p className="text-sm">Advanced security measures protect your data and infrastructure.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Zap className="h-6 w-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Instant Deployment</h3>
                      <p className="text-sm">Launch new servers in under 60 seconds with our automated platform.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <HeartHandshake className="h-6 w-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Transparent Pricing</h3>
                      <p className="text-sm">No hidden fees, predictable costs, and flexible billing options.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Get Started Today</h2>
              <p className="mb-6 leading-relaxed">
                Join thousands of satisfied customers who trust BIDUA Hosting for their cloud infrastructure. Whether you're launching a new project or migrating existing workloads, we're here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50"
                >
                  View Pricing Plans
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 border-2 border-cyan-500 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
                >
                  Contact Sales
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
