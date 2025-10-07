import { useState } from 'react';
import { Server, Zap, Database, Cpu, MemoryStick, HardDrive, Network, Calculator, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

type PlanType = 'general_purpose' | 'cpu_optimized' | 'memory_optimized';
type BillingCycle = 'monthly' | 'quarterly' | 'semiannually' | 'annually' | 'biennially' | 'triennially';

interface PlanConfig {
  ram: number;
  vcpu: number;
  storage: number;
  basePrice: number;
}

const planConfigurations: Record<PlanType, Record<number, PlanConfig>> = {
  general_purpose: {
    4: { ram: 4, vcpu: 2, storage: 80, basePrice: 1120 },
    8: { ram: 8, vcpu: 4, storage: 160, basePrice: 2240 },
    16: { ram: 16, vcpu: 6, storage: 320, basePrice: 4080 },
    32: { ram: 32, vcpu: 8, storage: 480, basePrice: 6720 },
    48: { ram: 48, vcpu: 10, storage: 512, basePrice: 8848 },
    64: { ram: 64, vcpu: 12, storage: 640, basePrice: 11360 },
    96: { ram: 96, vcpu: 16, storage: 740, basePrice: 15760 },
    128: { ram: 128, vcpu: 16, storage: 840, basePrice: 19360 },
    256: { ram: 256, vcpu: 24, storage: 1280, basePrice: 35520 }
  },
  cpu_optimized: {
    4: { ram: 4, vcpu: 2, storage: 80, basePrice: 1520 },
    8: { ram: 8, vcpu: 4, storage: 160, basePrice: 3040 },
    16: { ram: 16, vcpu: 6, storage: 320, basePrice: 5280 },
    32: { ram: 32, vcpu: 8, storage: 480, basePrice: 8320 },
    48: { ram: 48, vcpu: 10, storage: 512, basePrice: 10848 },
    64: { ram: 64, vcpu: 12, storage: 640, basePrice: 13760 },
    96: { ram: 96, vcpu: 16, storage: 740, basePrice: 18960 },
    128: { ram: 128, vcpu: 16, storage: 840, basePrice: 22560 },
    256: { ram: 256, vcpu: 24, storage: 1280, basePrice: 40320 }
  },
  memory_optimized: {
    8: { ram: 8, vcpu: 1, storage: 80, basePrice: 1320 },
    16: { ram: 16, vcpu: 2, storage: 160, basePrice: 2640 },
    32: { ram: 32, vcpu: 4, storage: 320, basePrice: 5280 },
    64: { ram: 64, vcpu: 6, storage: 480, basePrice: 9520 },
    96: { ram: 96, vcpu: 8, storage: 512, basePrice: 13248 },
    128: { ram: 128, vcpu: 10, storage: 640, basePrice: 17360 },
    192: { ram: 192, vcpu: 12, storage: 740, basePrice: 24560 },
    256: { ram: 256, vcpu: 16, storage: 840, basePrice: 32160 },
    384: { ram: 384, vcpu: 24, storage: 1280, basePrice: 48320 }
  }
};

const billingCycles: Record<BillingCycle, { name: string; months: number; discount: number }> = {
  monthly: { name: 'Monthly', months: 1, discount: 0 },
  quarterly: { name: 'Quarterly', months: 3, discount: 10 },
  semiannually: { name: 'Semi-Annually', months: 6, discount: 15 },
  annually: { name: 'Annually', months: 12, discount: 20 },
  biennially: { name: 'Biennially', months: 24, discount: 25 },
  triennially: { name: 'Triennially', months: 36, discount: 35 }
};

const planTypeInfo = {
  general_purpose: {
    name: 'General Purpose VM',
    icon: Server,
    color: 'cyan',
    description: 'Balanced resources for web apps and development'
  },
  cpu_optimized: {
    name: 'CPU Optimized VM',
    icon: Zap,
    color: 'orange',
    description: 'Dedicated CPU for compute-intensive tasks'
  },
  memory_optimized: {
    name: 'Memory Optimized VM',
    icon: Database,
    color: 'green',
    description: 'High RAM for databases and caching'
  }
};

export function PlanCalculator() {
  const [planType, setPlanType] = useState<PlanType>('general_purpose');
  const [selectedRam, setSelectedRam] = useState<number>(8);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [extraStorage, setExtraStorage] = useState<number>(0);
  const [extraBandwidth, setExtraBandwidth] = useState<number>(0);

  const availableRamOptions = Object.keys(planConfigurations[planType]).map(Number).sort((a, b) => a - b);
  const currentConfig = planConfigurations[planType][selectedRam];
  const cycleInfo = billingCycles[billingCycle];

  const STORAGE_PRICE_PER_GB = 2;
  const BANDWIDTH_PRICE_PER_TB = 100;

  const calculatePricing = () => {
    const baseMonthly = currentConfig.basePrice;
    const storageAddon = extraStorage * STORAGE_PRICE_PER_GB;
    const bandwidthAddon = extraBandwidth * BANDWIDTH_PRICE_PER_TB;

    const monthlyTotal = baseMonthly + storageAddon + bandwidthAddon;
    const totalBeforeDiscount = monthlyTotal * cycleInfo.months;
    const discount = (totalBeforeDiscount * cycleInfo.discount) / 100;
    const totalAfterDiscount = totalBeforeDiscount - discount;
    const effectiveMonthly = totalAfterDiscount / cycleInfo.months;

    return {
      baseMonthly,
      storageAddon,
      bandwidthAddon,
      monthlyTotal,
      totalBeforeDiscount,
      discount,
      totalAfterDiscount,
      effectiveMonthly,
      savingsPercent: cycleInfo.discount
    };
  };

  const pricing = calculatePricing();

  const handleReset = () => {
    setPlanType('general_purpose');
    setSelectedRam(8);
    setBillingCycle('monthly');
    setExtraStorage(0);
    setExtraBandwidth(0);
  };

  const planInfo = planTypeInfo[planType];
  const PlanIcon = planInfo.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
            <Calculator className="h-8 w-8 text-cyan-400" />
            <span>Custom Server Calculator</span>
          </h2>
          <p className="text-slate-400">Configure your perfect server and see real-time pricing</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-cyan-400 rounded-lg hover:bg-slate-700 transition border border-cyan-500/30"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Server className="h-5 w-5 text-cyan-400" />
              <span>Plan Type</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(planTypeInfo) as PlanType[]).map((type) => {
                const info = planTypeInfo[type];
                const TypeIcon = info.icon;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setPlanType(type);
                      const firstRam = Object.keys(planConfigurations[type])[0];
                      setSelectedRam(Number(firstRam));
                    }}
                    className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
                      planType === type
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-cyan-500/30'
                    }`}
                  >
                    <TypeIcon className="h-8 w-8" />
                    <span className="font-semibold text-sm text-center">{info.name}</span>
                    <span className="text-xs opacity-80 text-center">{info.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <MemoryStick className="h-5 w-5 text-cyan-400" />
              <span>RAM Configuration</span>
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select RAM: {selectedRam}GB
              </label>
              <input
                type="range"
                min={0}
                max={availableRamOptions.length - 1}
                value={availableRamOptions.indexOf(selectedRam)}
                onChange={(e) => setSelectedRam(availableRamOptions[parseInt(e.target.value)])}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                {availableRamOptions.map((ram) => (
                  <span key={ram}>{ram}GB</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-slate-800 p-3 rounded-lg border border-cyan-500/20">
                <Cpu className="h-5 w-5 text-cyan-400 mb-1" />
                <div className="text-xs text-slate-400">vCPU</div>
                <div className="text-lg font-bold text-white">{currentConfig.vcpu}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-cyan-500/20">
                <MemoryStick className="h-5 w-5 text-green-400 mb-1" />
                <div className="text-xs text-slate-400">RAM</div>
                <div className="text-lg font-bold text-white">{currentConfig.ram}GB</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-cyan-500/20">
                <HardDrive className="h-5 w-5 text-orange-400 mb-1" />
                <div className="text-xs text-slate-400">Storage</div>
                <div className="text-lg font-bold text-white">{currentConfig.storage}GB</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-cyan-500/20">
                <Network className="h-5 w-5 text-purple-400 mb-1" />
                <div className="text-xs text-slate-400">Bandwidth</div>
                <div className="text-lg font-bold text-white">1TB</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Add-ons</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Extra Storage: +{extraStorage}GB (₹{STORAGE_PRICE_PER_GB}/GB/month)
                </label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={50}
                  value={extraStorage}
                  onChange={(e) => setExtraStorage(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Extra Bandwidth: +{extraBandwidth}TB (₹{BANDWIDTH_PRICE_PER_TB}/TB/month)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={extraBandwidth}
                  onChange={(e) => setExtraBandwidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Billing Cycle</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(billingCycles) as BillingCycle[]).map((cycle) => {
                const info = billingCycles[cycle];
                return (
                  <button
                    key={cycle}
                    onClick={() => setBillingCycle(cycle)}
                    className={`p-3 rounded-lg transition-all ${
                      billingCycle === cycle
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-cyan-500/30'
                    }`}
                  >
                    <div className="font-semibold text-sm">{info.name}</div>
                    {info.discount > 0 && (
                      <div className={`text-xs mt-1 ${billingCycle === cycle ? 'opacity-80' : 'text-green-400'}`}>
                        Save {info.discount}%
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-gradient-to-br from-cyan-900 to-slate-900 rounded-xl p-6 border-2 border-cyan-500 shadow-lg shadow-cyan-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <PlanIcon className="h-6 w-6 text-cyan-400" />
                <span>Price Summary</span>
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Base Plan</span>
                  <span className="text-white font-semibold">₹{pricing.baseMonthly.toLocaleString()}/mo</span>
                </div>
                {pricing.storageAddon > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Extra Storage</span>
                    <span className="text-white font-semibold">₹{pricing.storageAddon.toLocaleString()}/mo</span>
                  </div>
                )}
                {pricing.bandwidthAddon > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Extra Bandwidth</span>
                    <span className="text-white font-semibold">₹{pricing.bandwidthAddon.toLocaleString()}/mo</span>
                  </div>
                )}
              </div>

              <div className="border-t border-cyan-500/30 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Subtotal ({cycleInfo.months} months)</span>
                  <span className="text-white">₹{pricing.totalBeforeDiscount.toLocaleString()}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-400">Discount ({pricing.savingsPercent}%)</span>
                    <span className="text-green-400">-₹{pricing.discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-950 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-slate-300">Total Price</span>
                  <span className="text-3xl font-bold text-white">₹{Math.round(pricing.totalAfterDiscount).toLocaleString()}</span>
                </div>
                <div className="text-sm text-cyan-400">
                  ₹{Math.round(pricing.effectiveMonthly).toLocaleString()}/month effective
                </div>
              </div>

              <Link
                to="/signup"
                className="block w-full text-center px-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-bold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50"
              >
                Deploy This Configuration
              </Link>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-cyan-500/30">
              <h4 className="font-bold text-white mb-3">Comparison Across Cycles</h4>
              <div className="space-y-2 text-sm">
                {(Object.keys(billingCycles) as BillingCycle[]).map((cycle) => {
                  const info = billingCycles[cycle];
                  const cyclePrice = pricing.monthlyTotal * info.months;
                  const cycleDiscount = (cyclePrice * info.discount) / 100;
                  const finalPrice = cyclePrice - cycleDiscount;

                  return (
                    <div key={cycle} className={`flex justify-between p-2 rounded ${billingCycle === cycle ? 'bg-cyan-600/20' : ''}`}>
                      <span className="text-slate-300">{info.name}</span>
                      <span className="text-white font-semibold">₹{Math.round(finalPrice).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
