import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Eye, Plus, X } from 'lucide-react';
import api from '../../api';

const statusColors = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-yellow-50 text-yellow-700',
  consultation_scheduled: 'bg-purple-50 text-purple-700',
  consultation_completed: 'bg-indigo-50 text-indigo-700',
  qualified: 'bg-emerald-50 text-emerald-700',
  converted: 'bg-green-50 text-green-700',
  closed_lost: 'bg-red-50 text-red-700',
};
const pathwayLabels = { career: 'Career', franchise: 'Franchise', managed_franchise: 'Managed Franchise' };

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pathwayFilter, setPathwayFilter] = useState('');
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ full_name: '', email: '', phone: '', country: '', profession_category: '', pathway_interest: '', investment_capacity: '', notes: '' });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (pathwayFilter) params.set('pathway', pathwayFilter);
      const res = await api.get(`/admin/leads?${params}`);
      setLeads(res.data.leads);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [page, statusFilter, pathwayFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  return (
    <div data-testid="lead-management">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Lead Management</h1>
          <p className="text-sm text-slate-500 mt-1">{total} total leads</p>
        </div>
        <button onClick={() => setShowAddLead(true)} className="inline-flex items-center gap-1.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-all" data-testid="add-lead-btn">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" data-testid="add-lead-modal">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg font-semibold">Add New Lead</h3>
              <button onClick={() => setShowAddLead(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label><input type="text" value={newLead.full_name} onChange={e => setNewLead({...newLead, full_name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="new-lead-name" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label><input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="new-lead-email" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="tel" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" data-testid="new-lead-phone" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Pathway</label>
                  <select value={newLead.pathway_interest} onChange={e => setNewLead({...newLead, pathway_interest: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary outline-none" data-testid="new-lead-pathway">
                    <option value="">Select</option><option value="career">Career</option><option value="franchise">Franchise</option><option value="managed_franchise">Managed Franchise</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label><textarea value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" rows={2} data-testid="new-lead-notes" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={async () => { try { await api.post('/admin/leads', newLead); setShowAddLead(false); setNewLead({ full_name: '', email: '', phone: '', country: '', profession_category: '', pathway_interest: '', investment_capacity: '', notes: '' }); fetchLeads(); } catch(e) { alert(e.response?.data?.detail || 'Error'); } }} className="flex-1 bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-full text-sm" data-testid="save-new-lead">Create Lead</button>
              <button onClick={() => setShowAddLead(false)} className="px-6 py-2.5 border border-slate-200 rounded-full text-sm text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 shadow-card" data-testid="lead-filters">
        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Search by name, email, or phone..."
              data-testid="lead-search-input"
            />
          </form>
          <select
            value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            data-testid="lead-status-filter"
          >
            <option value="">All Statuses</option>
            {['new', 'contacted', 'consultation_scheduled', 'consultation_completed', 'qualified', 'converted', 'closed_lost'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={pathwayFilter} onChange={e => { setPathwayFilter(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            data-testid="lead-pathway-filter"
          >
            <option value="">All Pathways</option>
            <option value="career">Career</option>
            <option value="franchise">Franchise</option>
            <option value="managed_franchise">Managed Franchise</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden" data-testid="lead-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Contact</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Profession</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Pathway</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400"><div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full mx-auto"></div></td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No leads found</td></tr>
              ) : leads.map(lead => (
                <tr key={lead.lead_id} className="hover:bg-slate-50/50 transition-colors" data-testid={`lead-row-${lead.lead_id}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{lead.full_name}</p>
                    <p className="text-xs text-slate-500 md:hidden">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-slate-700">{lead.email}</p>
                    <p className="text-xs text-slate-400">{lead.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-slate-700">{lead.profession_category}</p>
                    <p className="text-xs text-slate-400">{lead.specialty}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-700">{pathwayLabels[lead.pathway_interest] || lead.pathway_interest}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[lead.lead_status] || 'bg-slate-50'}`}>
                      {lead.lead_status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/leads/${lead.lead_id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:text-blue-700 font-medium" data-testid={`view-lead-${lead.lead_id}`}>
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30" data-testid="lead-prev-page">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30" data-testid="lead-next-page">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
