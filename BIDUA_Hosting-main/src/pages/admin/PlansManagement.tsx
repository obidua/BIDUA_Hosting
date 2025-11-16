import { useState, useEffect } from 'react';
import { Package, Search, RefreshCw, Plus, Edit, Trash2, Eye, Zap } from 'lucide-react';
import api from '../../lib/api';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

interface PlanData {
  id: number;
  name: string;
  slug: string;
  description: string;
  vcpu: number;
  ram_gb: number;
  storage_gb: number;
  bandwidth_gb: number;
  base_price: number;
  is_active: boolean;
  features: string[];
  created_at: string;
}

interface AddonData {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

export function PlansManagement() {
  const [activeTab, setActiveTab] = useState<'plans' | 'addons'>('plans');
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [addons, setAddons] = useState<AddonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [editingAddon, setEditingAddon] = useState<AddonData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    vcpu: 1,
    ram_gb: 1,
    storage_gb: 20,
    bandwidth_gb: 1000,
    base_price: 0,
    is_active: true,
    features: '',
  });
  const [addonFormData, setAddonFormData] = useState({
    name: '',
    slug: '',
    category: 'STORAGE',
    description: '',
    price: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansResponse, addonsResponse] = await Promise.all([
        api.request('/api/v1/admin/plans', { method: 'GET' }),
        api.request('/api/v1/addons', { method: 'GET' })
      ]);
      setPlans(Array.isArray(plansResponse) ? plansResponse : []);
      setAddons(Array.isArray(addonsResponse) ? addonsResponse : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setPlans([]);
      setAddons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'plans') {
        const planData = {
          ...formData,
          features: formData.features.split('\n').filter(f => f.trim()),
        };

        if (editingPlan) {
          await api.request(`/api/v1/admin/plans/${editingPlan.id}`, {
            method: 'PUT',
            body: JSON.stringify(planData),
          });
        } else {
          await api.request('/api/v1/admin/plans', {
            method: 'POST',
            body: JSON.stringify(planData),
          });
        }
        alert(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
      } else {
        if (editingAddon) {
          await api.request(`/api/v1/admin/addons/${editingAddon.id}`, {
            method: 'PUT',
            body: JSON.stringify(addonFormData),
          });
        } else {
          await api.request('/api/v1/admin/addons', {
            method: 'POST',
            body: JSON.stringify(addonFormData),
          });
        }
        alert(editingAddon ? 'Addon updated successfully' : 'Addon created successfully');
      }
      
      await fetchData();
      setShowAddModal(false);
      setEditingPlan(null);
      setEditingAddon(null);
      resetForms();
    } catch (error) {
      console.error('Error saving:', error);
      alert(`Failed to save ${activeTab === 'plans' ? 'plan' : 'addon'}`);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab === 'plans' ? 'plan' : 'addon'}?`)) return;
    try {
      const endpoint = activeTab === 'plans' ? `/api/v1/admin/plans/${itemId}` : `/api/v1/admin/addons/${itemId}`;
      await api.request(endpoint, { method: 'DELETE' });
      await fetchData();
      alert(`${activeTab === 'plans' ? 'Plan' : 'Addon'} deleted successfully`);
    } catch (error) {
      console.error('Error deleting:', error);
      alert(`Failed to delete ${activeTab === 'plans' ? 'plan' : 'addon'}`);
    }
  };

  const resetForms = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      vcpu: 1,
      ram_gb: 1,
      storage_gb: 20,
      bandwidth_gb: 1000,
      base_price: 0,
      is_active: true,
      features: '',
    });
    setAddonFormData({
      name: '',
      slug: '',
      category: 'STORAGE',
      description: '',
      price: 0,
      is_active: true,
    });
  };

  const openEditPlanModal = (plan: PlanData) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      vcpu: plan.vcpu,
      ram_gb: plan.ram_gb,
      storage_gb: plan.storage_gb,
      bandwidth_gb: plan.bandwidth_gb,
      base_price: plan.base_price,
      is_active: plan.is_active,
      features: (plan.features || []).join('\n'),
    });
    setActiveTab('plans');
    setShowAddModal(true);
  };

  const openEditAddonModal = (addon: AddonData) => {
    setEditingAddon(addon);
    setAddonFormData({
      name: addon.name,
      slug: addon.slug,
      category: addon.category,
      description: addon.description || '',
      price: addon.price,
      is_active: addon.is_active,
    });
    setActiveTab('addons');
    setShowAddModal(true);
  };

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAddons = addons.filter(addon =>
    addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addon.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const addonCategories = ['STORAGE', 'BANDWIDTH', 'IP_ADDRESS', 'CONTROL_PANEL', 'BACKUP', 'SSL', 'SUPPORT', 'MANAGEMENT', 'SECURITY'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={activeTab === 'plans' ? 'Plans Management' : 'Addons Management'}
        description={activeTab === 'plans' ? 
          'Control every hosting package, pricing tier, and feature bundle before it reaches customers.' :
          'Manage additional services and features that can be added to hosting plans.'
        }
        actions={
          <>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 hover:bg-slate-900/70 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                if (activeTab === 'plans') {
                  resetForms();
                  setEditingPlan(null);
                  setEditingAddon(null);
                } else {
                  resetForms();
                  setEditingAddon(null);
                  setEditingPlan(null);
                }
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-400 hover:to-blue-400 transition shadow-lg shadow-cyan-500/30"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'plans' ? 'Plan' : 'Addon'}
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeTab === 'plans'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Plans
          </div>
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeTab === 'addons'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Addons
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900 shadow-[0_15px_45px_rgba(2,6,23,0.7)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'plans' ? 'plans' : 'addons'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
              <p className="text-sm text-slate-400">Total Plans</p>
              <p className="text-2xl font-bold text-white">{plans.length}</p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
              <p className="text-sm text-slate-400">Active Plans</p>
              <p className="text-2xl font-bold text-emerald-400">{plans.filter(p => p.is_active).length}</p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
              <p className="text-sm text-slate-400">Avg Price</p>
              <p className="text-2xl font-bold text-cyan-300">
                {formatCurrency(plans.length ? plans.reduce((s, p) => s + p.base_price, 0) / plans.length : 0)}
              </p>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-slate-950/60 rounded-2xl border border-slate-900 overflow-hidden shadow-[0_12px_35px_rgba(2,6,23,0.7)]">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-sm text-slate-500">{plan.slug}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                      plan.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm">{plan.description || 'No description'}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>vCPU</span>
                      <span className="font-semibold text-white">{plan.vcpu} cores</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>RAM</span>
                      <span className="font-semibold text-white">{plan.ram_gb} GB</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Storage</span>
                      <span className="font-semibold text-white">{plan.storage_gb} GB SSD</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Bandwidth</span>
                      <span className="font-semibold text-white">{plan.bandwidth_gb} GB</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-4">
                    <p className="text-2xl font-bold text-cyan-300">{formatCurrency(plan.base_price)}</p>
                    <p className="text-xs text-slate-500">per month</p>
                  </div>
                </div>

                <div className="bg-slate-900/70 px-6 py-3 flex justify-end gap-2 border-t border-slate-900">
                  <button
                    onClick={() => openEditPlanModal(plan)}
                    className="p-2 text-cyan-300 hover:bg-cyan-500/10 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-900 shadow-[0_12px_35px_rgba(2,6,23,0.7)]">
              <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>No plans found</p>
            </div>
          )}
        </>
      )}

      {/* Addons Tab */}
      {activeTab === 'addons' && (
        <>
          {/* Addon Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
              <p className="text-sm text-slate-400">Total Addons</p>
              <p className="text-2xl font-bold text-white">{addons.length}</p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
              <p className="text-sm text-slate-400">Active Addons</p>
              <p className="text-2xl font-bold text-emerald-400">{addons.filter(a => a.is_active).length}</p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
              <p className="text-sm text-slate-400">Avg Price</p>
              <p className="text-2xl font-bold text-cyan-300">
                {formatCurrency(addons.length ? addons.reduce((s, a) => s + a.price, 0) / addons.length : 0)}
              </p>
            </div>
          </div>

          {/* Addons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAddons.map((addon) => (
              <div key={addon.id} className="bg-slate-950/60 rounded-2xl border border-slate-900 overflow-hidden shadow-[0_12px_35px_rgba(2,6,23,0.7)]">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{addon.name}</h3>
                      <p className="text-sm text-slate-500">{addon.slug}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                      addon.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}>
                      {addon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {addon.category}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm">{addon.description || 'No description'}</p>

                  <div className="border-t border-slate-900 pt-4">
                    <p className="text-2xl font-bold text-cyan-300">{formatCurrency(addon.price)}</p>
                    <p className="text-xs text-slate-500">monthly add-on</p>
                  </div>
                </div>

                <div className="bg-slate-900/70 px-6 py-3 flex justify-end gap-2 border-t border-slate-900">
                  <button
                    onClick={() => openEditAddonModal(addon)}
                    className="p-2 text-cyan-300 hover:bg-cyan-500/10 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAddons.length === 0 && (
            <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-900 shadow-[0_12px_35px_rgba(2,6,23,0.7)]">
              <Zap className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>No addons found</p>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_70px_rgba(0,0,0,0.7)]">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">
                {activeTab === 'plans' ? (editingPlan ? 'Edit Plan' : 'Add New Plan') : (editingAddon ? 'Edit Addon' : 'Add New Addon')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 text-white">
                {/* Plans Form */}
                {activeTab === 'plans' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">vCPU</label>
                        <input
                          type="number"
                          value={formData.vcpu}
                          onChange={(e) => setFormData({ ...formData, vcpu: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">RAM (GB)</label>
                        <input
                          type="number"
                          value={formData.ram_gb}
                          onChange={(e) => setFormData({ ...formData, ram_gb: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Storage (GB)</label>
                        <input
                          type="number"
                          value={formData.storage_gb}
                          onChange={(e) => setFormData({ ...formData, storage_gb: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Bandwidth (GB)</label>
                        <input
                          type="number"
                          value={formData.bandwidth_gb}
                          onChange={(e) => setFormData({ ...formData, bandwidth_gb: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Base Price (INR)</label>
                      <input
                        type="number"
                        value={formData.base_price}
                        onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Features (one per line)</label>
                      <textarea
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={4}
                        placeholder="24/7 Support&#10;SSD Storage&#10;Free SSL"
                      />
                    </div>

                    <div className="flex items-center text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                      />
                      <label className="text-sm font-medium">Active</label>
                    </div>
                  </>
                )}

                {/* Addons Form */}
                {activeTab === 'addons' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                        <input
                          type="text"
                          value={addonFormData.name}
                          onChange={(e) => setAddonFormData({ ...addonFormData, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
                        <input
                          type="text"
                          value={addonFormData.slug}
                          onChange={(e) => setAddonFormData({ ...addonFormData, slug: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                      <select
                        value={addonFormData.category}
                        onChange={(e) => setAddonFormData({ ...addonFormData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        required
                      >
                        {addonCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                      <textarea
                        value={addonFormData.description}
                        onChange={(e) => setAddonFormData({ ...addonFormData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Price (INR)</label>
                      <input
                        type="number"
                        value={addonFormData.price}
                        onChange={(e) => setAddonFormData({ ...addonFormData, price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="flex items-center text-slate-300">
                      <input
                        type="checkbox"
                        checked={addonFormData.is_active}
                        onChange={(e) => setAddonFormData({ ...addonFormData, is_active: e.target.checked })}
                        className="mr-2 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                      />
                      <label className="text-sm font-medium">Active</label>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => { 
                      setShowAddModal(false); 
                      setEditingPlan(null);
                      setEditingAddon(null);
                    }}
                    className="px-4 py-2 border border-slate-700 rounded-lg hover:bg-slate-900 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400"
                  >
                    {activeTab === 'plans' ? (editingPlan ? 'Update Plan' : 'Create Plan') : (editingAddon ? 'Update Addon' : 'Create Addon')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
