import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function RegisterInterest() {
  const [config, setConfig] = useState({ professions: [], specialties: {}, countries: [], pathways: [] });
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', country: '', profession_category: '', specialty: '',
    years_experience: '', pathway_interest: '', investment_capacity: '', preferred_timeline: '', consultation_interest: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/system-config/public').then(res => setConfig(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        years_experience: parseInt(form.years_experience) || 0,
      };
      await api.post('/leads', payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  const specialties = config.specialties?.[form.profession_category] || [];
  const pathwayLabels = { career: 'Career Pathway', franchise: 'Franchise Pathway', managed_franchise: 'Managed Franchise Pathway' };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" data-testid="lead-success">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-3">Registration Received!</h2>
          <p className="text-slate-600 mb-6">Thank you for your interest in MedPreneur! Our team will review your profile and reach out to you shortly to discuss the next steps.</p>
          <button onClick={() => { setSuccess(false); setForm({ full_name: '', email: '', phone: '', country: '', profession_category: '', specialty: '', years_experience: '', pathway_interest: '', investment_capacity: '', preferred_timeline: '', consultation_interest: false }); }} className="text-primary hover:text-blue-700 font-medium text-sm" data-testid="register-another-btn">
            Submit Another Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50/50 to-white py-16 md:py-20" data-testid="register-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Register Interest</motion.p>
            <motion.h1 variants={fadeUp} className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Join the MedPreneur Ecosystem
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600 leading-relaxed">
              Tell us about yourself and your healthcare goals. We will match you with the right pathway and connect you with an advisor.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 pb-20 bg-white" data-testid="register-form-section">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-surface border border-slate-100 rounded-2xl p-6 md:p-8">
            {error && <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg" data-testid="register-error">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div>
                <h3 className="font-heading font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input type="text" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Dr. John Smith" data-testid="register-fullname" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="john@example.com" data-testid="register-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                    <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="+971 50 000 0000" data-testid="register-phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country *</label>
                    <select required value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="register-country">
                      <option value="">Select Country</option>
                      {config.countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div>
                <h3 className="font-heading font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Professional Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profession *</label>
                    <select required value={form.profession_category} onChange={e => setForm({...form, profession_category: e.target.value, specialty: ''})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="register-profession">
                      <option value="">Select Profession</option>
                      {config.professions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                    <select value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="register-specialty">
                      <option value="">Select Specialty</option>
                      {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                    <input type="number" min="0" value={form.years_experience} onChange={e => setForm({...form, years_experience: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="5" data-testid="register-experience" />
                  </div>
                </div>
              </div>

              {/* Interest */}
              <div>
                <h3 className="font-heading font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Interest Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Interested Pathway *</label>
                    <select required value={form.pathway_interest} onChange={e => setForm({...form, pathway_interest: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="register-pathway">
                      <option value="">Select Pathway</option>
                      {config.pathways.map(p => <option key={p} value={p}>{pathwayLabels[p] || p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Timeline</label>
                    <select value={form.preferred_timeline} onChange={e => setForm({...form, preferred_timeline: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="register-timeline">
                      <option value="">Select Timeline</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="12+ months">12+ months</option>
                    </select>
                  </div>
                  {(form.pathway_interest === 'franchise' || form.pathway_interest === 'managed_franchise') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">What is your budget? *</label>
                      <select value={form.investment_capacity} onChange={e => setForm({...form, investment_capacity: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white" data-testid="register-investment">
                        <option value="">Select Budget Range</option>
                        <option value="Under 1M AED">Under 1M AED</option>
                        <option value="1M-3M AED">1M - 3M AED</option>
                        <option value="3M-5M AED">3M - 5M AED</option>
                        <option value="5M-8M AED">5M - 8M AED</option>
                        <option value="8M+ AED">8M+ AED</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.consultation_interest} onChange={e => setForm({...form, consultation_interest: e.target.checked})} className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" data-testid="register-consultation-check" />
                    <span className="text-sm text-slate-700">I am interested in scheduling a consultation</span>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-full shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" data-testid="register-submit-btn">
                {submitting ? 'Submitting...' : 'Submit Registration'} {!submitting && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
