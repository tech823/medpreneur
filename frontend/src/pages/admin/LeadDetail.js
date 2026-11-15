import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Globe, Briefcase, Calendar, Clock } from 'lucide-react';
import api from '../../api';

const statusColors = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  consultation_scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  consultation_completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  converted: 'bg-green-50 text-green-700 border-green-200',
  closed_lost: 'bg-red-50 text-red-700 border-red-200',
};
const LEAD_TRANSITIONS = {
  new: ['contacted', 'closed_lost'],
  contacted: ['consultation_scheduled', 'closed_lost'],
  consultation_scheduled: ['consultation_completed', 'closed_lost'],
  consultation_completed: ['qualified', 'closed_lost'],
  qualified: ['converted', 'closed_lost'],
  converted: [],
  closed_lost: [],
};
const pathwayLabels = { career: 'Career Pathway', franchise: 'Franchise Ownership', managed_franchise: 'Managed Franchise' };

export default function LeadDetail() {
  const { leadId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLead = async () => {
    try {
      const res = await api.get(`/admin/leads/${leadId}`);
      setData(res.data);
      setNotes(res.data.lead.notes || '');
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchLead(); }, [leadId]);

  const updateLead = async (updates) => {
    setUpdating(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.patch(`/admin/leads/${leadId}`, updates);
      await fetchLead();
      setSuccessMsg('Lead updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed');
    }
    setUpdating(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!data) return <div className="text-center py-12 text-slate-500">Lead not found</div>;

  const { lead, bookings, audit_logs } = data;
  const allowedTransitions = LEAD_TRANSITIONS[lead.lead_status] || [];

  return (
    <div data-testid="lead-detail-page">
      <Link to="/admin/leads" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-primary mb-5" data-testid="back-to-leads">
        <ArrowLeft size={16} /> Back to Leads
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">{lead.full_name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[lead.lead_status] || ''}`}>
              {lead.lead_status?.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-slate-500">{pathwayLabels[lead.pathway_interest] || lead.pathway_interest}</span>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg" data-testid="lead-update-error">{error}</div>}
      {successMsg && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-lg" data-testid="lead-update-success">{successMsg}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lead Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card">
            <h3 className="font-heading font-semibold text-slate-900 mb-4">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Mail, label: 'Email', value: lead.email },
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: Globe, label: 'Country', value: lead.country },
                { icon: Briefcase, label: 'Profession', value: `${lead.profession_category}${lead.specialty ? ' - ' + lead.specialty : ''}` },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <Icon size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm text-slate-900">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div><p className="text-xs text-slate-500">Experience</p><p className="text-sm text-slate-900">{lead.years_experience} years</p></div>
              <div><p className="text-xs text-slate-500">Investment Capacity</p><p className="text-sm text-slate-900">{lead.investment_capacity || 'Not specified'}</p></div>
              <div><p className="text-xs text-slate-500">Timeline</p><p className="text-sm text-slate-900">{lead.preferred_timeline || 'Not specified'}</p></div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card">
            <h3 className="font-heading font-semibold text-slate-900 mb-3">Notes</h3>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              rows={3} placeholder="Add notes about this lead..."
              data-testid="lead-notes-input"
            />
            <button
              onClick={() => updateLead({ notes })} disabled={updating}
              className="mt-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-all disabled:opacity-50"
              data-testid="save-notes-btn"
            >
              {updating ? 'Saving...' : 'Save Notes'}
            </button>
          </div>

          {/* Bookings */}
          {bookings.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="lead-bookings">
              <h3 className="font-heading font-semibold text-slate-900 mb-4">Consultation Bookings</h3>
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.booking_id} className="p-3 bg-surface rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{b.consultation_type_title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={10} /> {b.preferred_date} at {b.preferred_time}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.booking_status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : b.booking_status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-50 text-slate-700'}`}>
                      {b.booking_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="lead-actions">
            <h3 className="font-heading font-semibold text-slate-900 mb-4">Actions</h3>
            {allowedTransitions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-2">Move lead to:</p>
                {allowedTransitions.map(status => (
                  <button
                    key={status}
                    onClick={() => updateLead({ lead_status: status })}
                    disabled={updating}
                    className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg border transition-all disabled:opacity-50 ${
                      status === 'closed_lost'
                        ? 'border-red-200 text-red-700 hover:bg-red-50'
                        : 'border-slate-200 text-slate-700 hover:bg-primary-50 hover:text-primary hover:border-primary'
                    }`}
                    data-testid={`lead-action-${status}`}
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No further transitions available</p>
            )}
          </div>

          {/* Audit Trail */}
          {audit_logs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="lead-audit-trail">
              <h3 className="font-heading font-semibold text-slate-900 mb-4">Activity Log</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                {audit_logs.map(log => (
                  <div key={log.audit_id} className="pb-3 border-b border-slate-50 last:border-0">
                    <p className="text-xs font-medium text-slate-700">{log.action_type?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
