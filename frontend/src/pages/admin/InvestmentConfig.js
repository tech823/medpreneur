import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Settings, DollarSign, TrendingUp, Building2 } from 'lucide-react';
import api from '../../api';

export default function InvestmentConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/admin/investment-config').then(res => { setConfig(res.data.config); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/investment-config', config);
      setSuccess('Investment configuration saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { alert('Error saving'); }
    setSaving(false);
  };

  const updateTier = (tier, field, value) => {
    const num = parseFloat(value);
    setConfig(prev => ({
      ...prev,
      managed_franchise: {
        ...prev.managed_franchise,
        tiers: {
          ...prev.managed_franchise.tiers,
          [tier]: { ...prev.managed_franchise.tiers[tier], [field]: isNaN(num) ? value : num }
        }
      }
    }));
  };

  const updateMF = (field, value) => {
    const num = parseFloat(value);
    setConfig(prev => ({ ...prev, managed_franchise: { ...prev.managed_franchise, [field]: isNaN(num) ? value : num } }));
  };

  const updateFR = (field, value) => {
    const num = parseFloat(value);
    setConfig(prev => ({ ...prev, franchise: { ...prev.franchise, [field]: isNaN(num) ? value : num } }));
  };

  const downloadTemplate = () => {
    const token = localStorage.getItem('medpreneur_token');
    window.open(`${process.env.REACT_APP_BACKEND_URL}/api/admin/investment-config/download-excel?token=${token}`, '_blank');
  };

  const uploadTemplate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx)');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('medpreneur_token');
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/investment-config/upload-excel`, {
        method: 'POST', body: formData, headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccess('Excel template uploaded. Configuration updated.');
      const res = await api.get('/admin/investment-config');
      setConfig(res.data.config);
    } catch { alert('Error uploading'); }
    e.target.value = '';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!config) return <div className="text-center py-12 text-slate-500">Failed to load configuration</div>;

  const mf = config.managed_franchise || {};
  const fr = config.franchise || {};
  const tiers = mf.tiers || {};

  return (
    <div data-testid="investment-config-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Investment Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all financial assumptions, package prices, and feasibility parameters</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium" data-testid="download-template"><Download size={14} /> Download Excel</button>
          <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium cursor-pointer" data-testid="upload-template">
            <Upload size={14} /> Upload Excel
            <input type="file" accept=".xlsx,.xls" onChange={uploadTemplate} className="hidden" />
          </label>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50" data-testid="save-config"><Save size={14} /> {saving ? 'Saving...' : 'Save All'}</button>
        </div>
      </div>

      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-lg" data-testid="config-success">{success}</div>}

      <div className="space-y-6">
        {/* Managed Franchise Global */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="mf-global">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-primary" /><h3 className="font-heading font-semibold text-slate-900">Managed Franchise - Global Parameters</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Franchise Retainer %</label><input type="number" value={mf.franchise_retainer_pct || 15} onChange={e => updateMF('franchise_retainer_pct', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="mf-retainer" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Investor Profit %</label><input type="number" value={mf.investor_profit_pct || 60} onChange={e => updateMF('investor_profit_pct', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="mf-investor-pct" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">MedPreneur Profit %</label><input type="number" value={mf.medpreneur_profit_pct || 40} onChange={e => updateMF('medpreneur_profit_pct', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="mf-mp-pct" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Exit Multiple (x EBITDA)</label><input type="number" value={mf.exit_multiple || 6} onChange={e => updateMF('exit_multiple', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="mf-exit-multiple" /></div>
          </div>
        </div>

        {/* Managed Franchise Tiers */}
        {['basic', 'standard', 'premium'].map(tier => {
          const t = tiers[tier] || {};
          return (
            <div key={tier} className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid={`mf-tier-${tier}`}>
              <div className="flex items-center gap-2 mb-4"><Building2 size={18} className="text-primary" /><h3 className="font-heading font-semibold text-slate-900 capitalize">{tier} Tier - Managed Franchise</h3></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['equity_ticket', 'Equity Ticket (AED)'],
                  ['annual_revenue_y2', 'Annual Revenue Y2 (AED)'],
                  ['total_5yr_distributions', '5-Year Distributions (AED)'],
                  ['total_5yr_return_with_exit', '5-Year Return + Exit (AED)'],
                  ['roi_5yr_pct', '5-Year ROI %'],
                  ['irr_pct', 'IRR %'],
                  ['payback_years', 'Payback (Years)'],
                  ['y2_cash', 'Year 2 Cash (AED)'],
                  ['y3_cash', 'Year 3 Cash (AED)'],
                  ['y4_cash', 'Year 4 Cash (AED)'],
                  ['y5_cash', 'Year 5 Cash (AED)'],
                  ['exit_clinic_valuation', 'Exit Clinic Value (AED)'],
                  ['exit_investor_share', 'Exit Investor Share (AED)'],
                  ['break_even_patients', 'Break-Even Patients/Day'],
                  ['size_sqft', 'Size (sqft)'],
                  ['opd_rooms', 'OPD Rooms'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">{label}</label>
                    <input type="number" value={t[field] || 0} onChange={e => updateTier(tier, field, e.target.value)} className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid={`${tier}-${field}`} />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Description</label>
                <input type="text" value={t.description || ''} onChange={e => updateTier(tier, 'description', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid={`${tier}-description`} />
              </div>
            </div>
          );
        })}

        {/* Franchise Global */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="fr-global">
          <div className="flex items-center gap-2 mb-4"><DollarSign size={18} className="text-primary" /><h3 className="font-heading font-semibold text-slate-900">Franchise Pathway - Global Parameters</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Franchise Fee %</label><input type="number" value={fr.franchise_fee_pct || 15} onChange={e => updateFR('franchise_fee_pct', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="fr-fee-pct" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Royalty %</label><input type="number" value={fr.royalty_pct || 10} onChange={e => updateFR('royalty_pct', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="fr-royalty-pct" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
