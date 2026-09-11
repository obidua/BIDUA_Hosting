import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import {
  Server, Shield, Zap, Globe, Headphones as HeadphonesIcon,
  CheckCircle, TrendingUp, Cpu, Database, ChevronDown, Star,
  Gauge, Lock,
} from 'lucide-react';
import { Seo, faqJsonLd } from '../components/Seo';

/* ---------- Animation helpers ---------- */

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

/* ---------- Data ---------- */

const features = [
  { icon: Zap, title: 'Lightning Fast NVMe', description: 'NVMe SSD storage paired with Intel Xeon Gold processors for blazing-fast I/O and compute performance.' },
  { icon: Shield, title: 'Enterprise Security', description: 'Always-on DDoS protection, isolated network segments and hardened infrastructure out of the box.' },
  { icon: Gauge, title: '99.9% Uptime SLA', description: 'Redundant power, network and storage with proactive monitoring — backed by a real SLA.' },
  { icon: Globe, title: 'Global Network', description: 'Deploy across 150+ countries with a low-latency backbone built for Indian and global workloads.' },
  { icon: HeadphonesIcon, title: '24/7 Expert Support', description: 'Real engineers on chat and tickets — average first response under 15 minutes, day or night.' },
  { icon: TrendingUp, title: 'Scale in One Click', description: 'Upgrade vCPU, RAM and storage instantly. No redeploys, no downtime, no reinstallation.' },
];

const stats = [
  { value: 50000, suffix: '+', label: 'Active Servers' },
  { value: 150, suffix: '+', label: 'Countries Served' },
  { value: 15, suffix: ' min', label: 'Avg. Response Time' },
  { value: 7, suffix: ' days', label: 'Money-Back Guarantee' },
];

const solutions = [
  {
    icon: Server,
    title: 'General Purpose',
    tagline: 'Balanced CPU & RAM for most workloads',
    items: ['Starting from 2 vCPU', 'Up to 256GB RAM', 'NVMe SSD Storage'],
    to: '/pricing?type=general_purpose',
    gradient: 'from-cyan-500 to-teal-500',
    glow: 'hover:shadow-cyan-500/25',
    border: 'hover:border-cyan-400/60',
  },
  {
    icon: Cpu,
    title: 'CPU Optimized',
    tagline: 'Dedicated cores for compute-heavy apps',
    items: ['Up to 32 vCPU', 'Dedicated CPU cores', 'High clock speed'],
    to: '/pricing?type=cpu_optimized',
    gradient: 'from-orange-500 to-red-500',
    glow: 'hover:shadow-orange-500/25',
    border: 'hover:border-orange-400/60',
  },
  {
    icon: Database,
    title: 'Memory Optimized',
    tagline: 'High RAM for databases & caches',
    items: ['Up to 384GB RAM', 'High memory-to-CPU ratio', 'Perfect for databases'],
    to: '/pricing?type=memory_optimized',
    gradient: 'from-emerald-500 to-green-500',
    glow: 'hover:shadow-emerald-500/25',
    border: 'hover:border-emerald-400/60',
  },
  {
    icon: Lock,
    title: 'Dedicated Servers',
    tagline: 'Single-tenant bare-metal power',
    items: ['AMD EPYC & Intel Gold', 'Full root access', 'Private VLAN'],
    to: '/dedicated-servers',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'hover:shadow-violet-500/25',
    border: 'hover:border-violet-400/60',
  },
];

const faqs = [
  { question: 'What is BIDUA Hosting?', answer: 'BIDUA Hosting is an Indian cloud infrastructure provider offering enterprise-grade cloud servers (VPS), CPU/memory optimized instances and dedicated servers with 99.9% uptime SLA, NVMe SSD storage, DDoS protection and 24/7 expert support.' },
  { question: 'How much does a cloud server cost?', answer: 'Cloud servers start at just ₹1,478/month for a General Purpose 4GB instance (2 vCPU, 4GB RAM, 80GB NVMe SSD). Longer billing cycles get up to 35% discount. All plans include 1TB bandwidth, IPv4, console access and full root access.' },
  { question: 'Do you provide DDoS protection?', answer: 'Yes. Every BIDUA cloud server includes always-on DDoS protection at the network layer at no extra cost, along with isolated networking and hardened infrastructure.' },
  { question: 'Can I upgrade my server later?', answer: 'Absolutely. You can upgrade vCPU, RAM and storage in one click from your dashboard without redeploys or downtime. Your data, IP and configuration stay intact.' },
  { question: 'What operating systems are supported?', answer: 'We support all major Linux distributions (Ubuntu, Debian, CentOS, AlmaLinux, Rocky Linux) and Windows Server images. You can also mount your own ISO for custom installations.' },
  { question: 'Is there a money-back guarantee?', answer: 'Yes, we offer a 7-day money-back guarantee on all cloud server plans. If you are not satisfied, contact our support team for a full refund — no questions asked.' },
];

const testimonials = [
  { name: 'Rohit Sharma', role: 'CTO, FinTech Startup', text: 'Moved our entire production stack to BIDUA. Migration took an afternoon and our p95 latency dropped 40%. Support actually knows what they are doing.' },
  { name: 'Priya Nair', role: 'Founder, D2C Brand', text: 'Their dashboard is the simplest I have used — spinning up a staging server takes under a minute. Pricing is transparent, no surprise invoices.' },
  { name: 'Amit Verma', role: 'DevOps Lead, SaaS Company', text: 'Memory-optimized instances run our Redis and Postgres clusters flawlessly. Uptime has been rock solid for 14 months straight.' },
];

/* ---------- Component ---------- */

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-slate-950">
      <Seo
        title="BIDUA Hosting - Enterprise Cloud Servers, VPS & Dedicated Hosting India"
        description="High-performance cloud servers with 99.9% uptime SLA, NVMe SSD storage, DDoS protection and 24/7 expert support. Plans start at ₹1,478/month. Deploy in seconds."
        path="/"
        keywords="cloud hosting india, vps hosting, dedicated servers, cloud server price, best vps hosting india"
        jsonLd={[orgJsonLd(), faqJsonLd(faqs)]}
      />

      {/* ===== HERO ===== */}
      <section className="relative text-white py-24 md:py-36 overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[130px]" />
          <div className="absolute -bottom-40 left-0 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: 'linear-gradient(rgba(148,163,184,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.12) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 backdrop-blur-md text-cyan-300 text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              Now deploying on Intel Xeon Gold infrastructure
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
            >
              Enterprise Cloud Hosting,
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Built for Scale.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-2xl mb-10 text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              High-performance cloud servers with unmatched reliability and security.
              Deploy in seconds, scale effortlessly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/pricing"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-cyan-500/40 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  View Pricing
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/calculator"
                className="px-8 py-4 rounded-xl font-semibold text-cyan-300 transition-all duration-300 border border-cyan-400/40 bg-cyan-400/5 backdrop-blur-md hover:bg-cyan-400/15 hover:border-cyan-300/60 hover:scale-[1.03]"
              >
                Estimate Cost
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm text-slate-500"
            >
              7-day money-back guarantee · No setup fees · Cancel anytime
            </motion.p>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-14 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Reveal key={index} delay={index * 0.08} className="text-center">
                <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-500 font-medium text-sm md:text-base">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose BIDUA Hosting?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built for developers, trusted by enterprises. Experience cloud hosting that scales with your ambitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className=" p-8 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition border-2 border-cyan-500 backdrop-blur-sm"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-500/20 rounded-lg mb-4">
                  <feature.icon className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cloud Server Solutions
            </h2>
            <p className="text-xl text-slate-400">
              Choose the perfect configuration for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-8 rounded-xl shadow-lg hover:shadow-cyan-500/30 transition border-2 border-cyan-500/30 hover:border-cyan-500">
              <div className="text-center mb-6">
                <Server className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">General Purpose</h3>
                <p className="text-slate-400">Balanced CPU and memory for most workloads</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Starting from 2 vCPU</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Up to 16GB RAM</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">NVMe SSD Storage</span>
                </li>
              </ul>
              <Link
                to="/pricing?type=general_purpose"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-400 hover:to-teal-400 transition font-semibold shadow-lg shadow-cyan-500/50"
              >
                View Plans
              </Link>
            </div>

            <div className="bg-slate-950 p-8 rounded-xl shadow-lg hover:shadow-orange-500/30 transition border-2 border-orange-500/30 hover:border-orange-500">
              <div className="text-center mb-6">
                <Zap className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">CPU Optimized</h3>
                <p className="text-slate-400">High-performance computing workloads</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Up to 32 vCPU</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Dedicated CPU cores</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Advanced CPU features</span>
                </li>
              </ul>
              <Link
                to="/pricing?type=cpu_optimized"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-400 hover:to-red-400 transition font-semibold shadow-lg shadow-orange-500/50"
              >
                View Plans
              </Link>
            </div>

            <div className="bg-slate-950 p-8 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition border-2 border-emerald-500/30 hover:border-emerald-500">
              <div className="text-center mb-6">
                <TrendingUp className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Memory Optimized</h3>
                <p className="text-slate-400">Memory-intensive applications</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Up to 256GB RAM</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">High memory-to-CPU ratio</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Perfect for databases</span>
                </li>
              </ul>
              <Link
                to="/pricing?type=memory_optimized"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-400 hover:to-green-400 transition font-semibold shadow-lg shadow-emerald-500/50"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20  text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-cyan-100">
            Deploy your first server in minutes. No credit card required for signup.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition transform hover:scale-105 shadow-lg shadow-cyan-500/50"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
