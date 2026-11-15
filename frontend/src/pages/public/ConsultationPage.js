import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, CheckCircle, CreditCard } from 'lucide-react';
import api from '../../api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function ConsultationPage() {
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', preferred_date: '', preferred_time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [lastBooking, setLastBooking] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [heroQuote, setHeroQuote] = useState('Book a Personalized Consultation');

  useEffect(() => {
    api.get('/consultation-types').then(res => setTypes(res.data.consultation_types || [])).catch(() => {});
    api.get('/site-content/hero_images').then(res => {
      if (res.data?.value?.consultation?.quote) setHeroQuote(res.data.value.consultation.quote);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return setError('Please select a consultation type');
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/consultation-bookings', { ...form, consultation_type_id: selected.consultation_type_id });
      if (selected.price > 0) {
        setLastBooking({ booking_id: res.data.booking_id, type: selected });
        setSuccess(true);
      } else {
        setLastBooking(null);
        setSuccess(true);
      }
      setForm({ full_name: '', email: '', phone: '', preferred_date: '', preferred_time: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book consultation');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!lastBooking) return;
    setProcessingPayment(true);
    try {
      const res = await api.post('/payments/checkout', {
        booking_id: lastBooking.booking_id,
        origin_url: window.location.origin
      });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" data-testid="booking-success">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-3">Consultation Booked!</h2>
          <p className="text-slate-600 mb-6">Thank you! We have received your consultation booking request. Our team will confirm your appointment and send you the meeting details shortly.</p>
          
          {lastBooking && lastBooking.type?.price > 0 && (
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
                  <CreditCard size={16} />
                  Payment Required: {lastBooking.type.price} {lastBooking.type.currency}
                </div>
                <p className="text-amber-600 text-xs">Complete payment to confirm your consultation booking.</p>
              </div>
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-full shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="pay-now-btn"
              >
                <CreditCard size={16} />
                {processingPayment ? 'Redirecting to Payment...' : `Pay ${lastBooking.type.price} ${lastBooking.type.currency} Now`}
              </button>
            </div>
          )}
          
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{error}</div>}
          
          <button onClick={() => { setSuccess(false); setSelected(null); setLastBooking(null); }} className="text-primary hover:text-blue-700 font-medium text-sm" data-testid="book-another-btn">
            Book Another Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50/50 to-white py-16 md:py-20" data-testid="consultation-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Consultation</motion.p>
            <motion.h1 variants={fadeUp} className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {heroQuote}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600 leading-relaxed">
              Speak with our healthcare venture advisors about your career goals, franchise opportunities, or managed franchise interests.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Consultation Types & Booking */}
      <section className="py-16 bg-white" data-testid="consultation-booking">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Types */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-5">Select Consultation Type</h2>
              <div className="space-y-3">
                {types.map((t) => (
                  <button
                    key={t.consultation_type_id}
                    onClick={() => setSelected(t)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selected?.consultation_type_id === t.consultation_type_id
                        ? 'border-primary bg-primary-50 shadow-blue-glow'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                    data-testid={`consultation-type-${t.consultation_type_id}`}
                  >
                    <h3 className="font-heading font-semibold text-slate-900 text-sm">{t.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={12} /> {t.duration_minutes} min
                      </span>
                      <span className="text-xs font-medium text-primary">
                        {t.price > 0 ? `${t.price} ${t.currency}` : 'Free'}
                      </span>
                      {t.price > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <CreditCard size={10} /> Payment required
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {types.length === 0 && (
                  <p className="text-sm text-slate-500 p-4 bg-surface rounded-lg">Loading consultation types...</p>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-3">
              <div className="bg-surface border border-slate-100 rounded-2xl p-6 md:p-8">
                <h2 className="font-heading text-xl font-semibold text-slate-900 mb-5">
                  <Calendar size={20} className="inline mr-2 text-primary" />
                  Booking Details
                </h2>
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg" data-testid="booking-error">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                      <input type="text" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Dr. John Smith" data-testid="booking-fullname" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="john@example.com" data-testid="booking-email" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                    <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="+971 50 000 0000" data-testid="booking-phone" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date *</label>
                      <input type="date" required value={form.preferred_date} onChange={e => setForm({...form, preferred_date: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" data-testid="booking-date" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time *</label>
                      <select required value={form.preferred_time} onChange={e => setForm({...form, preferred_time: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="booking-time">
                        <option value="">Select time</option>
                        {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                    <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" placeholder="Any specific topics you'd like to discuss..." data-testid="booking-notes" />
                  </div>
                  {selected && (
                    <div className={`p-3 rounded-lg text-sm ${selected.price > 0 ? 'bg-amber-50 border border-amber-100' : 'bg-primary-50'}`}>
                      <span className="font-medium text-slate-900">Selected:</span> {selected.title} - {selected.price > 0 ? <><span className="font-semibold text-amber-700">{selected.price} {selected.currency}</span> <span className="text-xs text-amber-600">(Stripe payment after booking)</span></> : <span className="text-emerald-700 font-medium">Free</span>}
                    </div>
                  )}
                  <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-full shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" data-testid="booking-submit-btn">
                    {submitting ? 'Booking...' : 'Book Consultation'} {!submitting && <ArrowRight size={16} />}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
