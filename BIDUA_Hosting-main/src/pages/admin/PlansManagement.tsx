import { useState, useEffect } from 'react';
import { Package, Search, RefreshCw, Plus, Edit, Trash2, Eye } from 'lucide-react';
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

export function PlansManagement() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
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

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.request('/api/v1/plans', { method: 'GET' });
      setPlans(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
      await fetchPlans();
      setShowAddModal(false);
      setEditingPlan(null);
      resetForm();
      alert(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    }
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.request(`/api/v1/admin/plans/${planId}`, { method: 'DELETE' });
      await fetchPlans();
      alert('Plan deleted successfully');
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const resetForm = () => {
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
  };

  const openEditModal = (plan: PlanData) => {
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
    setShowAddModal(true);
  };

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

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
        title="Plans Management"
        description="Control every hosting package, pricing tier, and feature bundle before it reaches customers."
        actions={
          <>
            <button
              onClick={fetchPlans}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => { resetForm(); setEditingPlan(null); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </>
        }
      />

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">Total Plans</p>
          <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">Active Plans</p>
          <p className="text-2xl font-bold text-green-600">{plans.filter(p => p.is_active).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">Avg Price</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(plans.length ? plans.reduce((s, p) => s + p.base_price, 0) / plans.length : 0)}
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.slug}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{plan.description || 'No description'}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">vCPU</span>
                  <span className="font-medium">{plan.vcpu} cores</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">RAM</span>
                  <span className="font-medium">{plan.ram_gb} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium">{plan.storage_gb} GB SSD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bandwidth</span>
                  <span className="font-medium">{plan.bandwidth_gb} GB</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(plan.base_price)}</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
              <button
                onClick={() => openEditModal(plan)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No plans found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">vCPU</label>
                    <input
                      type="number"
                      value={formData.vcpu}
                      onChange={(e) => setFormData({ ...formData, vcpu: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RAM (GB)</label>
                    <input
                      type="number"
                      value={formData.ram_gb}
                      onChange={(e) => setFormData({ ...formData, ram_gb: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage (GB)</label>
                    <input
                      type="number"
                      value={formData.storage_gb}
                      onChange={(e) => setFormData({ ...formData, storage_gb: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bandwidth (GB)</label>
                    <input
                      type="number"
                      value={formData.bandwidth_gb}
                      onChange={(e) => setFormData({ ...formData, bandwidth_gb: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (INR)</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="24/7 Support&#10;SSD Storage&#10;Free SSL"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingPlan(null); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingPlan ? 'Update' : 'Create'}
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
