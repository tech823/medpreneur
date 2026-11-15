import React, { useState, useEffect } from 'react';
import { Clock, Filter } from 'lucide-react';
import api from '../../api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 30 });
    if (entityFilter) params.set('entity_type', entityFilter);
    api.get(`/admin/audit-logs?${params}`).then(res => {
      setLogs(res.data.audit_logs || []);
      setTotal(res.data.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, entityFilter]);

  return (
    <div data-testid="audit-logs-page">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">{total} total records</p>
      </div>

      <div className="mb-4">
        <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" data-testid="audit-entity-filter">
          <option value="">All Entities</option>
          <option value="lead">Leads</option>
          <option value="consultation_type">Consultation Types</option>
          <option value="consultation_booking">Bookings</option>
          <option value="system_config">Config</option>
          <option value="user">Users</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden" data-testid="audit-logs-table">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full"></div></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No audit logs found</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map(log => (
              <div key={log.audit_id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors" data-testid={`audit-log-${log.audit_id}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{log.action_type?.replace(/_/g, ' ')}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{log.entity_type}</span>
                      <span className="text-xs text-slate-400">by {log.actor_user_id === 'system' ? 'System' : log.actor_user_id?.slice(0, 8)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                    <Clock size={10} /> {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                {(log.after_json && Object.keys(log.after_json).length > 0) && (
                  <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600 font-mono overflow-x-auto">
                    {JSON.stringify(log.after_json, null, 0).slice(0, 200)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
