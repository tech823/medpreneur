import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, ArrowDownRight, ArrowRight } from 'lucide-react';
import api from '../../api';

const pathwayLabels = { career: 'Career Pathway', franchise: 'Franchise Pathway', managed_franchise: 'Managed Franchise' };
const pathwayColors = { career: 'bg-blue-500', franchise: 'bg-emerald-500', managed_franchise: 'bg-amber-500' };
const statusLabels = { new: 'New', contacted: 'Contacted', consultation_scheduled: 'Consultation Scheduled', consultation_completed: 'Consultation Completed', qualified: 'Qualified', converted: 'Converted', closed_lost: 'Closed Lost' };
const statusColors = { new: 'bg-blue-500', contacted: 'bg-yellow-500', consultation_scheduled: 'bg-purple-500', consultation_completed: 'bg-indigo-500', qualified: 'bg-emerald-500', converted: 'bg-green-600', closed_lost: 'bg-red-500' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!data) return <div className="text-center py-12 text-slate-500">Failed to load analytics</div>;

  const funnelSteps = [
    { label: 'Total Leads', value: data.funnel.total_leads, color: 'bg-primary' },
    { label: 'Consultations Booked', value: data.funnel.consultations_booked, color: 'bg-blue-500' },
    { label: 'Consultations Completed', value: data.funnel.consultations_completed, color: 'bg-indigo-500' },
    { label: 'Converted Users', value: data.funnel.converted_users, color: 'bg-emerald-500' },
  ];
  const maxFunnel = Math.max(...funnelSteps.map(s => s.value), 1);

  return (
    <div data-testid="analytics-page">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Lead Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Conversion funnel and lead distribution insights</p>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card mb-8" data-testid="lead-funnel">
        <h3 className="font-heading font-semibold text-slate-900 mb-6">Lead Conversion Funnel</h3>
        <div className="space-y-4">
          {funnelSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-4" data-testid={`funnel-step-${i}`}>
              <div className="w-40 text-right">
                <p className="text-sm font-medium text-slate-700">{step.label}</p>
              </div>
              <div className="flex-1 relative">
                <div className="h-10 bg-slate-100 rounded-lg overflow-hidden">
                  <div className={`h-full ${step.color} rounded-lg transition-all duration-700 flex items-center px-3`} style={{ width: `${Math.max((step.value / maxFunnel) * 100, 5)}%` }}>
                    <span className="text-white text-sm font-bold">{step.value}</span>
                  </div>
                </div>
              </div>
              {i < funnelSteps.length - 1 && funnelSteps[i].value > 0 && (
                <div className="w-16 text-center">
                  <p className="text-xs text-slate-500">{((funnelSteps[i+1].value / funnelSteps[i].value) * 100).toFixed(0)}%</p>
                  <ArrowDownRight size={14} className="text-slate-400 mx-auto" />
                </div>
              )}
              {i === funnelSteps.length - 1 && <div className="w-16" />}
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* By Pathway */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="leads-by-pathway-chart">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Leads by Pathway</h3>
          <div className="space-y-3">
            {Object.entries(data.leads_by_pathway || {}).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
              const total = Object.values(data.leads_by_pathway).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{pathwayLabels[key] || key}</span>
                    <span className="font-medium text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pathwayColors[key] || 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(data.leads_by_pathway || {}).length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
          </div>
        </div>

        {/* By Profession */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="leads-by-profession-chart">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Leads by Profession</h3>
          <div className="space-y-3">
            {Object.entries(data.leads_by_profession || {}).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
              const total = Object.values(data.leads_by_profession).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
              const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
              const idx = Object.keys(data.leads_by_profession).sort((a, b) => (data.leads_by_profession[b] || 0) - (data.leads_by_profession[a] || 0)).indexOf(key);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{key}</span>
                    <span className="font-medium text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[idx % colors.length]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(data.leads_by_profession || {}).length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Country */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="leads-by-country-chart">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Leads by Country</h3>
          <div className="space-y-2">
            {Object.entries(data.leads_by_country || {}).sort((a, b) => b[1] - a[1]).map(([key, count], i) => (
              <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-primary-50 text-primary text-[10px] font-bold rounded flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm text-slate-700">{key}</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{count}</span>
              </div>
            ))}
            {Object.keys(data.leads_by_country || {}).length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
          </div>
        </div>

        {/* By Source */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="leads-by-source-chart">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {Object.entries(data.leads_by_source || {}).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
              const total = Object.values(data.leads_by_source).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(data.leads_by_source || {}).length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
          </div>
        </div>
      </div>

      {/* By Status */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card mt-6" data-testid="leads-by-status-chart">
        <h3 className="font-heading font-semibold text-slate-900 mb-4">Lead Pipeline by Status</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.leads_by_status || {}).map(([key, count]) => (
            <div key={key} className="bg-surface border border-slate-100 rounded-lg px-4 py-3 text-center min-w-[120px]">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${statusColors[key] || 'bg-slate-400'}`} />
              <p className="text-xl font-heading font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500 capitalize">{statusLabels[key] || key.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
