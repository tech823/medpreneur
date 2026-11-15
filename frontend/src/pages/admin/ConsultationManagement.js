import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X, Clock, Check } from 'lucide-react';
import api from '../../api';

const BOOKING_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: [],
};
const PAYMENT_STATUSES = ['payment_pending', 'paid', 'waived'];
const bookingStatusColors = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-700',
  no_show: 'bg-slate-100 text-slate-600',
};
const paymentStatusColors = {
  payment_pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  waived: 'bg-slate-50 text-slate-600',
};

export default function ConsultationManagement() {
  const [types, setTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('bookings');
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({ title: '', description: '', duration_minutes: 30, price: 0, currency: 'AED' });
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingUpdate, setBookingUpdate] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, bookingsRes] = await Promise.all([
        api.get('/admin/consultation-types'),
        api.get('/admin/consultation-bookings?limit=50')
      ]);
      setTypes(typesRes.data.consultation_types || []);
      setBookings(bookingsRes.data.bookings || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveType = async () => {
    try {
      if (editingType) {
        await api.patch(`/admin/consultation-types/${editingType.consultation_type_id}`, typeForm);
      } else {
        await api.post('/admin/consultation-types', typeForm);
      }
      setShowTypeForm(false);
      setEditingType(null);
      setTypeForm({ title: '', description: '', duration_minutes: 30, price: 0, currency: 'AED' });
      fetchData();
    } catch (e) { alert(e.response?.data?.detail || 'Error saving'); }
  };

  const toggleTypeActive = async (ct) => {
    try {
      await api.patch(`/admin/consultation-types/${ct.consultation_type_id}`, { active_status: !ct.active_status });
      fetchData();
    } catch (e) {}
  };

  const handleBookingUpdate = async (bookingId) => {
    try {
      await api.patch(`/admin/consultation-bookings/${bookingId}`, bookingUpdate);
      setEditingBooking(null);
      setBookingUpdate({});
      fetchData();
    } catch (e) { alert(e.response?.data?.detail || 'Error updating'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div data-testid="consultation-management">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Consultation Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit" data-testid="consultation-tabs">
        {['bookings', 'types'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} data-testid={`tab-${t}`}>
            {t === 'bookings' ? 'Bookings' : 'Consultation Types'}
          </button>
        ))}
      </div>

      {/* Consultation Types Tab */}
      {tab === 'types' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">{types.length} consultation types</p>
            <button onClick={() => { setShowTypeForm(true); setEditingType(null); setTypeForm({ title: '', description: '', duration_minutes: 30, price: 0, currency: 'AED' }); }} className="inline-flex items-center gap-1.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-all" data-testid="add-type-btn">
              <Plus size={16} /> Add Type
            </button>
          </div>

          {/* Type Form Modal */}
          {showTypeForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" data-testid="type-form-modal">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading text-lg font-semibold">{editingType ? 'Edit' : 'New'} Consultation Type</h3>
                  <button onClick={() => { setShowTypeForm(false); setEditingType(null); }} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                    <input type="text" value={typeForm.title} onChange={e => setTypeForm({...typeForm, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" data-testid="type-title-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                    <textarea value={typeForm.description} onChange={e => setTypeForm({...typeForm, description: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" rows={3} data-testid="type-desc-input" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                      <input type="number" value={typeForm.duration_minutes} onChange={e => setTypeForm({...typeForm, duration_minutes: parseInt(e.target.value) || 0})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" data-testid="type-duration-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                      <input type="number" value={typeForm.price} onChange={e => setTypeForm({...typeForm, price: parseFloat(e.target.value) || 0})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" data-testid="type-price-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                      <select value={typeForm.currency} onChange={e => setTypeForm({...typeForm, currency: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="type-currency-input">
                        <option value="AED">AED</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleSaveType} className="flex-1 bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-full transition-all text-sm" data-testid="save-type-btn">
                    {editingType ? 'Update' : 'Create'} Type
                  </button>
                  <button onClick={() => { setShowTypeForm(false); setEditingType(null); }} className="px-6 py-2.5 border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Types List */}
          <div className="space-y-3">
            {types.map(ct => (
              <div key={ct.consultation_type_id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-card flex items-center justify-between" data-testid={`type-card-${ct.consultation_type_id}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-slate-900 text-sm">{ct.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ct.active_status ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {ct.active_status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{ct.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} /> {ct.duration_minutes} min</span>
                    <span className="text-xs font-medium text-primary">{ct.price > 0 ? `${ct.price} ${ct.currency}` : 'Free'}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => { setEditingType(ct); setTypeForm({ title: ct.title, description: ct.description, duration_minutes: ct.duration_minutes, price: ct.price, currency: ct.currency }); setShowTypeForm(true); }} className="p-2 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50" data-testid={`edit-type-${ct.consultation_type_id}`}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => toggleTypeActive(ct)} className={`p-2 rounded-lg ${ct.active_status ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} data-testid={`toggle-type-${ct.consultation_type_id}`}>
                    {ct.active_status ? <X size={14} /> : <Check size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden" data-testid="bookings-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Date/Time</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Payment</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No bookings yet</td></tr>
                ) : bookings.map(b => (
                  <tr key={b.booking_id} className="hover:bg-slate-50/50" data-testid={`booking-row-${b.booking_id}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{b.full_name}</p>
                      <p className="text-xs text-slate-500">{b.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-700">{b.consultation_type_title}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{b.preferred_date} {b.preferred_time}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bookingStatusColors[b.booking_status] || ''}`}>{b.booking_status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${paymentStatusColors[b.payment_status] || ''}`}>{b.payment_status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setEditingBooking(b); setBookingUpdate({}); }} className="text-xs text-primary hover:text-blue-700 font-medium" data-testid={`edit-booking-${b.booking_id}`}>
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" data-testid="booking-edit-modal">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg font-semibold">Update Booking</h3>
              <button onClick={() => setEditingBooking(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="mb-3 p-3 bg-surface rounded-lg">
              <p className="text-sm font-medium text-slate-900">{editingBooking.full_name}</p>
              <p className="text-xs text-slate-500">{editingBooking.consultation_type_title} - {editingBooking.preferred_date}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Booking Status</label>
                <select value={bookingUpdate.booking_status || ''} onChange={e => setBookingUpdate({...bookingUpdate, booking_status: e.target.value || undefined})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="booking-status-select">
                  <option value="">No change</option>
                  {(BOOKING_TRANSITIONS[editingBooking.booking_status] || []).map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Status</label>
                <select value={bookingUpdate.payment_status || ''} onChange={e => setBookingUpdate({...bookingUpdate, payment_status: e.target.value || undefined})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="booking-payment-select">
                  <option value="">No change</option>
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Link</label>
                <input type="url" value={bookingUpdate.meeting_link || ''} onChange={e => setBookingUpdate({...bookingUpdate, meeting_link: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="https://meet.google.com/..." data-testid="booking-link-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Summary Notes</label>
                <textarea value={bookingUpdate.summary_notes || ''} onChange={e => setBookingUpdate({...bookingUpdate, summary_notes: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" rows={2} data-testid="booking-summary-input" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => handleBookingUpdate(editingBooking.booking_id)} className="flex-1 bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-full transition-all text-sm" data-testid="save-booking-btn">Update Booking</button>
              <button onClick={() => setEditingBooking(null)} className="px-6 py-2.5 border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
