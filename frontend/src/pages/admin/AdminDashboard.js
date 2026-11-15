import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, TrendingUp, UserCheck, ArrowRight, Clock } from 'lucide-react';
import api from '../../api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!data) return <div className="text-center py-12 text-slate-500">Failed to load dashboard</div>;

  const pathwayLabels = { career: 'Career', franchise: 'Franchise', managed_franchise: 'Managed Franchise' };
  const statusColors = {
    new: 'bg-blue-50 text-blue-700',
    contacted: 'bg-yellow-50 text-yellow-700',
    consultation_scheduled: 'bg-purple-50 text-purple-700',
    consultation_completed: 'bg-indigo-50 text-indigo-700',
    qualified: 'bg-emerald-50 text-emerald-700',
    converted: 'bg-green-50 text-green-700',
    closed_lost: 'bg-red-50 text-red-700',
  };

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of MedPreneur lead and consultation activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: data.total_leads, icon: Users, color: 'text-primary bg-primary-50' },
          { label: 'New Leads', value: data.new_leads, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Qualified', value: data.qualified_leads, icon: UserCheck, color: 'text-amber-600 bg-amber-50' },
          { label: 'Bookings', value: data.total_bookings, icon: Calendar, color: 'text-purple-600 bg-purple-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 shadow-card" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-heading font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Leads by Pathway */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="leads-by-pathway">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Leads by Pathway</h3>
          <div className="space-y-3">
            {Object.entries(data.leads_by_pathway || {}).map(([pathway, count]) => (
              <div key={pathway} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm text-slate-700">{pathwayLabels[pathway] || pathway}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{count}</span>
              </div>
            ))}
            {Object.keys(data.leads_by_pathway || {}).length === 0 && (
              <p className="text-sm text-slate-400">No data yet</p>
            )}
          </div>
        </div>

        {/* Leads by Status */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="leads-by-status">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Leads by Status</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.leads_by_status || {}).map(([status, count]) => (
              <span key={status} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-slate-50 text-slate-700'}`}>
                {status.replace(/_/g, ' ')} ({count})
              </span>
            ))}
            {Object.keys(data.leads_by_status || {}).length === 0 && (
              <p className="text-sm text-slate-400">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="recent-leads">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-slate-900">Recent Leads</h3>
            <Link to="/admin/leads" className="text-xs text-primary font-medium hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(data.recent_leads || []).map((lead) => (
              <Link key={lead.lead_id} to={`/admin/leads/${lead.lead_id}`} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors" data-testid={`recent-lead-${lead.lead_id}`}>
                <div>
                  <p className="text-sm font-medium text-slate-900">{lead.full_name}</p>
                  <p className="text-xs text-slate-500">{lead.profession_category} - {pathwayLabels[lead.pathway_interest] || lead.pathway_interest}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[lead.lead_status] || 'bg-slate-50'}`}>
                  {lead.lead_status?.replace(/_/g, ' ')}
                </span>
              </Link>
            ))}
            {(data.recent_leads || []).length === 0 && <p className="text-sm text-slate-400 text-center py-4">No leads yet</p>}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="recent-bookings">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-slate-900">Recent Bookings</h3>
            <Link to="/admin/consultations" className="text-xs text-primary font-medium hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(data.recent_bookings || []).map((booking) => (
              <div key={booking.booking_id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors" data-testid={`recent-booking-${booking.booking_id}`}>
                <div>
                  <p className="text-sm font-medium text-slate-900">{booking.full_name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={10} /> {booking.consultation_type_title} - {booking.preferred_date}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${booking.booking_status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : booking.booking_status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-50 text-slate-700'}`}>
                  {booking.booking_status}
                </span>
              </div>
            ))}
            {(data.recent_bookings || []).length === 0 && <p className="text-sm text-slate-400 text-center py-4">No bookings yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
