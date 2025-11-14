import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Server, Check, CreditCard, FileText, ChevronRight, ChevronLeft,
  Cpu, MemoryStick, HardDrive, Network, Clock, Shield, 
  User, Mail, Phone, MapPin, Building, Globe, Tag, Percent,
  Lock, Plus, Minus, Zap, Database, ShieldCheck
} from 'lucide-react';

interface ServerConfig {
  planName: string;
  planType: string;
  vcpu: number;
  ram: number;
  storage: number;
  bandwidth: number;
  billingCycle: string;
  monthlyPrice: number;
  totalPrice: number;
  discount: number;
  extraStorage?: number;
  extraBandwidth?: number;
  // New configuration options
  operatingSystem?: string;
  datacenter?: string;
  hostname?: string;
  rootPassword?: string;
  additionalIPv4?: number;
  backupService?: boolean;
  managedService?: boolean;
  ddosProtection?: string;
}

interface BillingInfo {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  password?: string;
  confirmPassword?: string;
  additionalNotes?: string;
  newsletter?: boolean;
  promotional?: boolean;
}

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: '',
    company: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    taxId: '',
    password: '',
    confirmPassword: '',
    additionalNotes: '',
    newsletter: false,
    promotional: false
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Configuration options state
  const [operatingSystem, setOperatingSystem] = useState('ubuntu-22.04');
  const [datacenter, setDatacenter] = useState('noida-india');
  const [hostname, setHostname] = useState('');
  const [rootPassword, setRootPassword] = useState('');
  const [additionalIPv4, setAdditionalIPv4] = useState(0);
  const [backupService, setBackupService] = useState(false);
  const [managedService, setManagedService] = useState(false);
  const [ddosProtection, setDdosProtection] = useState('basic');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/login?redirect=/checkout', { replace: true });
      return;
    }

    // Get server configuration from navigation state
    const config = location.state?.serverConfig as ServerConfig;
    if (!config) {
      // Redirect to pricing if no config
      navigate('/pricing', { replace: true });
      return;
    }

    setServerConfig(config);
  }, [user, location.state, navigate]);

  useEffect(() => {
    // Update billing info when profile loads
    if (profile) {
      setBillingInfo(prev => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        email: profile.email || prev.email
      }));
    }
  }, [profile]);

  const steps = [
    { number: 1, title: 'Review Configuration', icon: Server },
    { number: 2, title: 'Billing & Payment', icon: CreditCard },
    { number: 3, title: 'Confirmation', icon: Check }
  ];

  // Calculate add-ons cost
  const calculateAddOnsCost = () => {
    let addOnsCost = 0;
    
    if (additionalIPv4 > 0) {
      addOnsCost += additionalIPv4 * 200;
    }
    if (backupService) {
      addOnsCost += 500;
    }
    if (managedService) {
      addOnsCost += 2000;
    }
    if (ddosProtection === 'advanced') {
      addOnsCost += 1000;
    } else if (ddosProtection === 'enterprise') {
      addOnsCost += 3000;
    }
    
    return addOnsCost;
  };

  // Calculate subtotal including add-ons
  const calculateSubtotal = () => {
    if (!serverConfig) return 0;
    return serverConfig.monthlyPrice + calculateAddOnsCost();
  };

  // Calculate tax (18% GST for India)
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discountedAmount = subtotal - promoDiscount;
    return billingInfo.country === 'India' ? Math.round(discountedAmount * 0.18) : 0;
  };

  // Calculate final total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal - promoDiscount + tax;
  };

  // Validate promo code
  const handleApplyPromoCode = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoDiscount(Math.round(calculateSubtotal() * 0.10));
      alert('Promo code applied! 10% discount');
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setPromoDiscount(Math.round(calculateSubtotal() * 0.20));
      alert('Promo code applied! 20% discount');
    } else {
      alert('Invalid promo code');
      setPromoDiscount(0);
    }
  };

  const handleInputChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOrder = async () => {
    if (!serverConfig || !agreeToTerms) return;

    setProcessing(true);
    try {
      // TODO: Integrate with backend orders API
      console.log('Creating order:', { serverConfig, billingInfo });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Move to confirmation step
      setCurrentStep(3);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!serverConfig) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-100">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex flex-col items-center ${index > 0 ? 'ml-8' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep >= step.number
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-cyan-400' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 mt-${index === 0 ? '[-20px]' : '0'} ${
                    currentStep > step.number ? 'bg-cyan-600' : 'bg-slate-700'
                  }`} style={{ marginTop: '-20px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-2xl border-2 border-cyan-500/30 p-8">
              {/* Step 1: Review Configuration */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Server className="h-6 w-6 text-cyan-400 mr-3" />
                    Configure Your Server
                  </h2>

                  <div className="space-y-6">
                    {/* Server Specs */}
                    <div className="bg-slate-950 rounded-xl p-6 border border-cyan-500/30">
                      <h3 className="text-xl font-bold text-white mb-4">{serverConfig.planName}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Cpu className="h-5 w-5 text-cyan-400" />
                          <div>
                            <p className="text-xs text-slate-400">vCPU Cores</p>
                            <p className="text-white font-semibold">{serverConfig.vcpu}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MemoryStick className="h-5 w-5 text-green-400" />
                          <div>
                            <p className="text-xs text-slate-400">RAM</p>
                            <p className="text-white font-semibold">{serverConfig.ram}GB</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <HardDrive className="h-5 w-5 text-orange-400" />
                          <div>
                            <p className="text-xs text-slate-400">Storage</p>
                            <p className="text-white font-semibold">{serverConfig.storage}GB NVMe SSD</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Network className="h-5 w-5 text-purple-400" />
                          <div>
                            <p className="text-xs text-slate-400">Bandwidth</p>
                            <p className="text-white font-semibold">{serverConfig.bandwidth}TB</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operating System */}
                    <div className="bg-slate-950 rounded-xl p-6 border border-cyan-500/30">
                      <label className="block font-bold text-white mb-4">
                        <Globe className="h-5 w-5 inline text-cyan-400 mr-2" />
                        Operating System
                      </label>
                      <select
                        value={operatingSystem}
                        onChange={(e) => setOperatingSystem(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="ubuntu-22.04">Ubuntu 22.04 LTS (Popular)</option>
                        <option value="ubuntu-20.04">Ubuntu 20.04 LTS</option>
                        <option value="centos-8">CentOS 8</option>
                        <option value="debian-11">Debian 11</option>
                        <option value="rocky-linux-9">Rocky Linux 9</option>
                        <option value="windows-server-2022">Windows Server 2022 (+₹1,500/mo)</option>
                        <option value="windows-server-2019">Windows Server 2019 (+₹1,500/mo)</option>
                      </select>
                    </div>

                    {/* Datacenter Location */}
                    <div className="bg-slate-950 rounded-xl p-6 border border-cyan-500/30">
                      <label className="block font-bold text-white mb-4">
                        <MapPin className="h-5 w-5 inline text-cyan-400 mr-2" />
                        Datacenter Location
                      </label>
                      <select
                        value={datacenter}
                        onChange={(e) => setDatacenter(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="noida-india">🇮🇳 Noida, India</option>
                        <option value="milton-keynes-uk">🇬🇧 Milton Keynes, United Kingdom</option>
                        <option value="singapore" disabled>🇸🇬 Singapore (Coming Soon)</option>
                      </select>
                    </div>

                    {/* Server Configuration */}
                    <div className="bg-slate-950 rounded-xl p-6 border border-cyan-500/30">
                      <h4 className="font-bold text-white mb-4">Server Configuration</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Hostname <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={hostname}
                            onChange={(e) => setHostname(e.target.value)}
                            placeholder="server1.example.com"
                            className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            required
                          />
                          <p className="text-xs text-slate-400 mt-1">Fully qualified domain name for your server</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Root Password <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="password"
                            value={rootPassword}
                            onChange={(e) => setRootPassword(e.target.value)}
                            placeholder="Enter strong password"
                            className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            required
                          />
                          <p className="text-xs text-slate-400 mt-1">Minimum 8 characters with uppercase, lowercase, number, and special character</p>
                        </div>
                      </div>
                    </div>

                    {/* Add-ons */}
                    <div className="bg-slate-950 rounded-xl p-6 border border-cyan-500/30">
                      <h4 className="font-bold text-white mb-4 flex items-center">
                        <Plus className="h-5 w-5 text-cyan-400 mr-2" />
                        Add-ons & Upgrades
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Additional IPv4 */}
                        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                          <div className="flex-1">
                            <p className="font-medium text-white">Additional IPv4 Addresses</p>
                            <p className="text-sm text-slate-400">₹200/month per IP</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setAdditionalIPv4(Math.max(0, additionalIPv4 - 1))}
                              className="w-8 h-8 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-white font-semibold w-8 text-center">{additionalIPv4}</span>
                            <button
                              onClick={() => setAdditionalIPv4(Math.min(10, additionalIPv4 + 1))}
                              className="w-8 h-8 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 flex items-center justify-center"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Backup Service */}
                        <label className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700 cursor-pointer hover:border-cyan-500/50">
                          <div className="flex-1">
                            <p className="font-medium text-white flex items-center">
                              <Database className="h-4 w-4 mr-2 text-blue-400" />
                              Automated Daily Backups
                            </p>
                            <p className="text-sm text-slate-400">Daily backups with 7-day retention - ₹500/month</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={backupService}
                            onChange={(e) => setBackupService(e.target.checked)}
                            className="w-5 h-5 text-cyan-600 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                          />
                        </label>

                        {/* Managed Service */}
                        <label className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700 cursor-pointer hover:border-cyan-500/50">
                          <div className="flex-1">
                            <p className="font-medium text-white flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                              Managed Server Service
                            </p>
                            <p className="text-sm text-slate-400">Expert management, monitoring, and support - ₹2,000/month</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={managedService}
                            onChange={(e) => setManagedService(e.target.checked)}
                            className="w-5 h-5 text-cyan-600 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                          />
                        </label>

                        {/* DDoS Protection */}
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                          <p className="font-medium text-white mb-3 flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2 text-green-400" />
                            DDoS Protection
                          </p>
                          <div className="space-y-2">
                            <label className="flex items-center p-3 bg-slate-950 rounded cursor-pointer hover:bg-slate-800">
                              <input
                                type="radio"
                                name="ddos"
                                value="basic"
                                checked={ddosProtection === 'basic'}
                                onChange={(e) => setDdosProtection(e.target.value)}
                                className="w-4 h-4 text-cyan-600 bg-slate-900 border-slate-700"
                              />
                              <span className="ml-3 text-white text-sm">Basic (Included) - Standard protection</span>
                            </label>
                            <label className="flex items-center p-3 bg-slate-950 rounded cursor-pointer hover:bg-slate-800">
                              <input
                                type="radio"
                                name="ddos"
                                value="advanced"
                                checked={ddosProtection === 'advanced'}
                                onChange={(e) => setDdosProtection(e.target.value)}
                                className="w-4 h-4 text-cyan-600 bg-slate-900 border-slate-700"
                              />
                              <span className="ml-3 text-white text-sm">Advanced (+₹1,000/mo) - Up to 100 Gbps protection</span>
                            </label>
                            <label className="flex items-center p-3 bg-slate-950 rounded cursor-pointer hover:bg-slate-800">
                              <input
                                type="radio"
                                name="ddos"
                                value="enterprise"
                                checked={ddosProtection === 'enterprise'}
                                onChange={(e) => setDdosProtection(e.target.value)}
                                className="w-4 h-4 text-cyan-600 bg-slate-900 border-slate-700"
                              />
                              <span className="ml-3 text-white text-sm">Enterprise (+₹3,000/mo) - Unlimited with real-time mitigation</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Billing Cycle */}
                    <div className="bg-slate-950 rounded-xl p-6 border border-cyan-500/30">
                      <h4 className="font-bold text-white mb-4 flex items-center">
                        <Clock className="h-5 w-5 text-cyan-400 mr-2" />
                        Billing Cycle
                      </h4>
                      <p className="text-lg text-white capitalize">{serverConfig.billingCycle}</p>
                      {serverConfig.discount > 0 && (
                        <p className="text-sm text-green-400 mt-2">
                          <Percent className="h-4 w-4 inline mr-1" />
                          Saving ₹{serverConfig.discount.toLocaleString()} with {serverConfig.billingCycle} billing
                        </p>
                      )}
                    </div>

                    {/* Included Features */}
                    <div className="bg-slate-950 rounded-xl p-6 border border-cyan-500/30">
                      <h4 className="font-bold text-white mb-4 flex items-center">
                        <Shield className="h-5 w-5 text-cyan-400 mr-2" />
                        Included Features
                      </h4>
                      <ul className="grid grid-cols-2 gap-3">
                        {[
                          'Full Root Access',
                          'Console Access',
                          'Basic DDoS Protection',
                          '99.9% Uptime SLA',
                          '24/7 Support',
                          'IPv4 & IPv6',
                          'NVMe SSD Storage',
                          'Free Setup'
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center text-sm text-slate-300">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={!hostname || !rootPassword}
                    className="mt-8 w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-4 rounded-lg font-bold hover:from-cyan-500 hover:to-teal-500 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Billing
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              )}

              {/* Step 2: Billing & Payment */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <CreditCard className="h-6 w-6 text-cyan-400 mr-3" />
                    Billing & Payment Information
                  </h2>

                  <form className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            <User className="h-4 w-4 inline mr-1" />
                            Full Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={billingInfo.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Building className="h-4 w-4 inline mr-1" />
                            Company Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={billingInfo.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Mail className="h-4 w-4 inline mr-1" />
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="email"
                            value={billingInfo.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Phone className="h-4 w-4 inline mr-1" />
                            Phone Number <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="tel"
                            value={billingInfo.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Billing Address</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            Street Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={billingInfo.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="123 Main Street"
                            className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            value={billingInfo.addressLine2}
                            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                            placeholder="Apartment, suite, etc."
                            className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              City <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="New Delhi"
                              className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              State/Province <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              placeholder="Delhi"
                              className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Postal Code <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.postalCode}
                              onChange={(e) => handleInputChange('postalCode', e.target.value)}
                              placeholder="110001"
                              className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              <Globe className="h-4 w-4 inline mr-1" />
                              Country <span className="text-red-400">*</span>
                            </label>
                            <select
                              value={billingInfo.country}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                              className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                              required
                            >
                              <option value="India">India</option>
                              <option value="United States">United States</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Canada">Canada</option>
                              <option value="Australia">Australia</option>
                              <option value="Singapore">Singapore</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              <FileText className="h-4 w-4 inline mr-1" />
                              GST/Tax ID (Optional)
                            </label>
                            <input
                              type="text"
                              value={billingInfo.taxId}
                              onChange={(e) => handleInputChange('taxId', e.target.value)}
                              placeholder="22AAAAA0000A1Z5"
                              className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            />
                            <p className="text-xs text-slate-400 mt-1">Enter your GSTIN for GST invoice</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Security (for new customers) */}
                    {!user && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <Lock className="h-5 w-5 text-cyan-400 mr-2" />
                          Account Security
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Password <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="password"
                              value={billingInfo.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="Create strong password"
                              className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Confirm Password <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="password"
                              value={billingInfo.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              placeholder="Re-enter password"
                              className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 text-cyan-400 mr-2" />
                        Payment Method
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-start p-4 bg-slate-950 border-2 border-cyan-500/30 rounded-lg cursor-pointer hover:border-cyan-500 transition-all">
                          <input
                            type="radio"
                            name="payment"
                            value="razorpay"
                            checked={paymentMethod === 'razorpay'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mt-1 w-5 h-5 text-cyan-600 bg-slate-900 border-slate-700"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-white">Credit/Debit Card, UPI, NetBanking</p>
                            <p className="text-sm text-slate-400">Secure payment powered by Razorpay</p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Visa</span>
                              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Mastercard</span>
                              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">UPI</span>
                              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Wallets</span>
                            </div>
                          </div>
                          <Check className={`h-5 w-5 ${paymentMethod === 'razorpay' ? 'text-cyan-400' : 'text-transparent'}`} />
                        </label>

                        <label className="flex items-start p-4 bg-slate-950 border-2 border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500 transition-all">
                          <input
                            type="radio"
                            name="payment"
                            value="bank_transfer"
                            checked={paymentMethod === 'bank_transfer'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mt-1 w-5 h-5 text-cyan-600 bg-slate-900 border-slate-700"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-white">Bank Transfer / NEFT / RTGS</p>
                            <p className="text-sm text-slate-400">Manual payment via bank transfer (1-2 business days)</p>
                          </div>
                          <Check className={`h-5 w-5 ${paymentMethod === 'bank_transfer' ? 'text-cyan-400' : 'text-transparent'}`} />
                        </label>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={billingInfo.additionalNotes}
                        onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                        placeholder="Any special instructions or requirements..."
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                      <p className="text-xs text-slate-400 mt-1">{billingInfo.additionalNotes?.length || 0}/500 characters</p>
                    </div>

                    {/* Marketing Preferences */}
                    <div className="bg-slate-950 rounded-lg p-6 border border-cyan-500/30">
                      <h3 className="text-lg font-bold text-white mb-4">Communication Preferences</h3>
                      <div className="space-y-3">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={billingInfo.newsletter}
                            onChange={(e) => handleInputChange('newsletter', e.target.checked ? 'true' : 'false')}
                            className="mt-1 w-5 h-5 text-cyan-600 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                          />
                          <span className="text-sm text-slate-300">Send me newsletters and product updates</span>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={billingInfo.promotional}
                            onChange={(e) => handleInputChange('promotional', e.target.checked ? 'true' : 'false')}
                            className="mt-1 w-5 h-5 text-cyan-600 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                          />
                          <span className="text-sm text-slate-300">Send me promotional offers and discounts</span>
                        </label>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="bg-slate-950 rounded-lg p-6 border border-cyan-500/30">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="mt-1 w-5 h-5 text-cyan-600 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm text-slate-300">
                          I have read and agree to the{' '}
                          <a href="/terms" target="_blank" className="text-cyan-400 hover:underline">Terms of Service</a>,{' '}
                          <a href="/privacy" target="_blank" className="text-cyan-400 hover:underline">Privacy Policy</a>, and{' '}
                          <a href="/sla" target="_blank" className="text-cyan-400 hover:underline">Service Level Agreement</a>
                          <span className="text-red-400"> *</span>
                        </span>
                      </label>
                    </div>
                  </form>

                  <div className="mt-8 flex space-x-4">
                    <button
                      onClick={handlePreviousStep}
                      className="flex-1 bg-slate-800 text-white px-6 py-4 rounded-lg font-bold hover:bg-slate-700 transition-all flex items-center justify-center"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      Back
                    </button>
                    <button
                      onClick={handleCompleteOrder}
                      disabled={!agreeToTerms || processing}
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-4 rounded-lg font-bold hover:from-cyan-500 hover:to-teal-500 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          Complete Order - ₹{calculateTotal().toLocaleString()}
                          <ChevronRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h2>
                  <p className="text-lg text-slate-300 mb-8">
                    Your server is being provisioned. You'll receive an email shortly with access details.
                  </p>
                  
                  <div className="bg-slate-950 rounded-xl p-6 border border-cyan-500/30 max-w-md mx-auto mb-8">
                    <p className="text-sm text-slate-400 mb-2">Order Number</p>
                    <p className="text-2xl font-bold text-cyan-400">#ORD-{Date.now().toString().slice(-8)}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-teal-500 transition-all"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/servers')}
                      className="px-8 py-4 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all"
                    >
                      View My Servers
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl border-2 border-cyan-500/30 p-6 sticky top-4">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Base Plan ({serverConfig.billingCycle})</span>
                  <span className="text-white font-semibold">₹{serverConfig.monthlyPrice.toLocaleString()}/mo</span>
                </div>

                {/* Add-ons */}
                {additionalIPv4 > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Additional IPv4 ({additionalIPv4}x)</span>
                    <span className="text-white font-semibold">+₹{(additionalIPv4 * 200).toLocaleString()}/mo</span>
                  </div>
                )}
                
                {backupService && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Daily Backup Service</span>
                    <span className="text-white font-semibold">+₹500/mo</span>
                  </div>
                )}
                
                {managedService && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Managed Service</span>
                    <span className="text-white font-semibold">+₹2,000/mo</span>
                  </div>
                )}

                {ddosProtection !== 'basic' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      {ddosProtection === 'advanced' ? 'Advanced' : 'Enterprise'} DDoS Protection
                    </span>
                    <span className="text-white font-semibold">
                      +₹{(ddosProtection === 'advanced' ? 1000 : 3000).toLocaleString()}/mo
                    </span>
                  </div>
                )}

                {/* Promo Code - Only show in step 2 */}
                {currentStep === 2 && (
                  <div className="pt-4 border-t border-slate-700">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Tag className="h-4 w-4 inline mr-1" />
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="WELCOME10"
                        className="flex-1 px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-lg text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                      <button
                        onClick={handleApplyPromoCode}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-500 transition-all"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Try: WELCOME10 or SAVE20</p>
                  </div>
                )}

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white">₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-400 mb-2">
                      <span>Promo Discount</span>
                      <span>-₹{promoDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  {billingInfo.country === 'India' && (
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>IGST @ 18%</span>
                      <span className="text-white">₹{calculateTax().toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300">Total Amount</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">₹{calculateTotal().toLocaleString()}</div>
                    <div className="text-sm text-cyan-400">₹{calculateSubtotal().toLocaleString()}/mo effective</div>
                  </div>
                </div>
              </div>

              {/* Configuration Summary */}
              {currentStep >= 1 && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-4">
                  <p className="text-xs font-bold text-cyan-100 mb-2">Configuration</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {operatingSystem && <li>• OS: {operatingSystem.replace('-', ' ').toUpperCase()}</li>}
                    {datacenter && <li>• Location: {datacenter === 'noida-india' ? 'Noida, India' : 'Milton Keynes, UK'}</li>}
                    {hostname && <li>• Hostname: {hostname}</li>}
                  </ul>
                </div>
              )}

              {/* What's Next */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-xs text-cyan-100 mb-2">
                  <strong>What happens next?</strong>
                </p>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Server deployment within 5 minutes</li>
                  <li>• Email with access credentials</li>
                  <li>• Invoice generated automatically</li>
                  <li>• 24/7 support available</li>
                </ul>
              </div>

              {/* Support Contact */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Need help?</p>
                <p className="text-xs text-cyan-400">📞 +91 120 416 8464</p>
                <p className="text-xs text-cyan-400">✉️ support@bidua.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
