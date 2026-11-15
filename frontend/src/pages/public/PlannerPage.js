import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Building2, TrendingUp, Stethoscope, Users, Shield, Loader2, X, Briefcase, Globe, Award, Calendar, Download, CheckCircle, Star, BarChart3, Phone, Mail, User } from 'lucide-react';
import api from '../../api';

const COUNTRY_CODES = [
  { code: '+971', country: 'UAE', digits: 9 }, { code: '+92', country: 'Pakistan', digits: 10 },
  { code: '+91', country: 'India', digits: 10 }, { code: '+44', country: 'UK', digits: 10 },
  { code: '+1', country: 'US/Canada', digits: 10 }, { code: '+966', country: 'Saudi Arabia', digits: 9 },
  { code: '+974', country: 'Qatar', digits: 8 }, { code: '+973', country: 'Bahrain', digits: 8 },
  { code: '+965', country: 'Kuwait', digits: 8 }, { code: '+968', country: 'Oman', digits: 8 },
  { code: '+20', country: 'Egypt', digits: 10 }, { code: '+962', country: 'Jordan', digits: 9 },
  { code: '+63', country: 'Philippines', digits: 10 }, { code: '+880', country: 'Bangladesh', digits: 11 },
];

// Steps
const STEPS = {
  who: { id: 'user_type', q: 'What is your profession?', opts: [
    { v: 'doctor', l: 'Doctor', i: Stethoscope }, { v: 'dentist', l: 'Dentist', i: Stethoscope },
    { v: 'pharmacist', l: 'Pharmacist', i: Stethoscope }, { v: 'allied_health', l: 'Allied Health', i: Users },
    { v: 'healthcare_manager', l: 'Healthcare Manager', i: Users }, { v: 'investor', l: 'Investor', i: TrendingUp },
  ]},
  pathway: { id: 'pathway', q: 'Which pathway interests you?', opts: [
    { v: 'career', l: 'Career Pathway', d: 'Licensing, employment, career development' },
    { v: 'franchise', l: 'Franchise Ownership', d: 'Own and operate your healthcare clinic' },
    { v: 'managed_franchise', l: 'Managed Franchise', d: 'Invest in clinic assets managed by MedPreneur' },
  ]},
  career: { id: 'career_stage', q: 'Where are you in your career?', opts: [
    { v: 'student', l: 'Student / Fresh Graduate' }, { v: 'unlicensed', l: 'Unlicensed in UAE' },
    { v: 'licensed_seeking', l: 'Licensed, Seeking Job' }, { v: 'employed_growth', l: 'Employed, Seeking Growth' },
  ]},
  specialty: { id: 'specialty', q: 'What is your specialty?', opts: [] }, // Dynamic - populated based on user_type
  specialty_doctor: [
    { v: 'General Practitioner', l: 'General Practitioner' }, { v: 'Internal Medicine', l: 'Internal Medicine' },
    { v: 'Cardiology', l: 'Cardiology' }, { v: 'Orthopedics', l: 'Orthopedics' },
    { v: 'Dermatology', l: 'Dermatology' }, { v: 'Pediatrics', l: 'Pediatrics' },
    { v: 'OBGYN', l: 'OBGYN' }, { v: 'Psychiatry', l: 'Psychiatry' },
    { v: 'Radiology', l: 'Radiology' }, { v: 'ENT', l: 'ENT' },
    { v: 'Ophthalmology', l: 'Ophthalmology' }, { v: 'Surgery', l: 'General Surgery' },
  ],
  specialty_dentist: [
    { v: 'General Dentist', l: 'General Dentist' }, { v: 'Orthodontist', l: 'Orthodontist' },
    { v: 'Endodontist', l: 'Endodontist' }, { v: 'Prosthodontist', l: 'Prosthodontist' },
    { v: 'Periodontist', l: 'Periodontist' }, { v: 'Pediatric Dentist', l: 'Pediatric Dentist' },
    { v: 'Oral and Maxillofacial Surgery', l: 'Oral & Maxillofacial Surgery' },
    { v: 'Cosmetic Dentistry', l: 'Cosmetic Dentistry' }, { v: 'Implantology', l: 'Implantology' },
  ],
  specialty_allied: [
    { v: 'Physiotherapy', l: 'Physiotherapy' }, { v: 'Nursing', l: 'Nursing' },
    { v: 'Lab Technician', l: 'Lab Technician' }, { v: 'Radiology Tech', l: 'Radiology Technician' },
    { v: 'Dietitian', l: 'Dietitian' }, { v: 'Psychologist', l: 'Psychologist' },
  ],
  specialty_pharmacist: [
    { v: 'Clinical Pharmacist', l: 'Clinical Pharmacist' }, { v: 'Hospital Pharmacist', l: 'Hospital Pharmacist' },
    { v: 'Community Pharmacist', l: 'Community Pharmacist' }, { v: 'Retail Pharmacist', l: 'Retail Pharmacist' },
  ],
  operate: { id: 'operate_self', q: 'Who will manage the clinic?', opts: [
    { v: 'yes_operate', l: 'I will operate it myself' }, { v: 'managed_by_medpreneur', l: 'MedPreneur manages everything' },
  ]},
  budget: { id: 'budget', q: 'What is your available budget?', opts: [
    { v: 'Under 600K', l: 'Under AED 600K' }, { v: '600K-2M', l: 'AED 600K-2M' },
    { v: '2M-3M', l: 'AED 2M-3M' }, { v: '3M-5M', l: 'AED 3M-5M' },
    { v: '5M-8M', l: 'AED 5M-8M' }, { v: '8M+', l: 'AED 8M+' },
  ]},
  units: { id: 'num_units', q: 'How many clinics?', opts: [
    { v: 1, l: '1 clinic' }, { v: 2, l: '2 clinics' }, { v: 3, l: '3 or more' },
  ]},
  own: { id: 'ownership_preference', q: 'Ownership preference?', opts: [
    { v: 'full_ownership', l: 'Full (100%)' }, { v: 'co_ownership', l: 'Co-Franchise (20-50%)' },
    { v: 'partial_slot', l: 'Slot (5-15%)' }, { v: 'not_sure', l: 'Advise me' },
  ]},
};

function getFlow(a) {
  const f = [STEPS.who, STEPS.pathway];
  const needsSpecialty = ['doctor', 'dentist', 'pharmacist', 'allied_health'].includes(a.user_type);
  
  // Build dynamic specialty step based on user_type
  let specialtyStep = null;
  if (needsSpecialty) {
    const specOpts = a.user_type === 'dentist' ? STEPS.specialty_dentist
      : a.user_type === 'pharmacist' ? STEPS.specialty_pharmacist
      : a.user_type === 'allied_health' ? STEPS.specialty_allied
      : STEPS.specialty_doctor;
    specialtyStep = { ...STEPS.specialty, opts: specOpts };
  }
  
  if (a.pathway === 'career') return specialtyStep ? [...f, specialtyStep, STEPS.career] : [...f, STEPS.career];
  if (a.pathway === 'franchise') {
    const base = specialtyStep ? [...f, specialtyStep, STEPS.operate] : [...f, STEPS.operate];
    return a.operate_self === 'managed_by_medpreneur' ? [...base, STEPS.budget, STEPS.units] : [...base, STEPS.budget, STEPS.own];
  }
  if (a.pathway === 'managed_franchise') return [...f, STEPS.budget, STEPS.units];
  return f;
}

const jCol = { 'Career Pathway': 'bg-blue-500', 'Franchise Pathway': 'bg-emerald-500', 'Managed Franchise Pathway': 'bg-amber-500' };

export default function PlannerPage() {
  const [phase, setPhase] = useState('contact');
  const [contact, setContact] = useState({ full_name: '', email: '', phone_code: '+971', phone_num: '' });
  const [cErr, setCErr] = useState('');
  const [si, setSi] = useState(0);
  const [ans, setAns] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const flow = getFlow(ans);
  const cur = flow[si];
  const done = si >= flow.length - 1 && cur && ans[cur?.id] !== undefined;

  const goContact = (e) => {
    e.preventDefault();
    if (!contact.full_name || !contact.email || !contact.phone_num) { setCErr('All fields required'); return; }
    const cc = COUNTRY_CODES.find(c => c.code === contact.phone_code);
    if (cc && contact.phone_num.length !== cc.digits) { setCErr(`Phone must be ${cc.digits} digits for ${cc.country}`); return; }
    setCErr(''); setPhase('questions');
  };

  const pick = (id, val) => {
    const n = { ...ans, [id]: val };
    if (id === 'pathway') { delete n.career_stage; delete n.operate_self; delete n.budget; delete n.num_units; delete n.ownership_preference; }
    if (id === 'operate_self') { delete n.budget; delete n.num_units; delete n.ownership_preference; }
    setAns(n);
    if (si < getFlow(n).length - 1) setTimeout(() => setSi(s => s + 1), 150);
  };

  const go = async () => {
    setLoading(true);
    const payload = {
      full_name: contact.full_name, email: contact.email, phone: `${contact.phone_code}${contact.phone_num}`,
      user_type: ans.user_type || 'doctor', specialty: ans.specialty || '',
      budget: ans.budget || 'Under 600K',
      operate_self: ans.operate_self || (ans.pathway === 'managed_franchise' ? 'managed_by_medpreneur' : 'yes_operate'),
      ownership_preference: ans.ownership_preference || 'not_sure', num_units: ans.num_units || 1,
      additional_notes: ans.pathway === 'career' ? `career_stage:${ans.career_stage || ''}` : '',
    };
    // Try up to 3 times
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await api.post('/planner/recommend', payload);
        if (res.data?.recommendation && !res.data.recommendation.error) {
          setResult(res.data); setPhase('report'); setLoading(false); return;
        }
      } catch (e) { console.log(`Planner attempt ${attempt + 1} failed`, e); }
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
    }
    setResult({ recommendation: { error: true } }); setPhase('report');
    setLoading(false);
  };

  const reset = () => { setPhase('contact'); setSi(0); setAns({}); setResult(null); setContact({ full_name: '', email: '', phone_code: '+971', phone_num: '' }); };
  const r = result?.recommendation;
  const rs = r ? Math.min(95, 60 + (r.confidence_level === 'High' ? 25 : 10) + (r.risk_level === 'Low' ? 10 : r.risk_level === 'Medium' ? 5 : 0)) : 0;

  // CONTACT
  if (phase === 'contact') return (
    <div>
      <section className="bg-gradient-to-b from-primary-50/40 to-white py-12 md:py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3"><Compass size={28} className="text-primary" /></div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">MedPreneur Report Generator</h1>
          <p className="mt-2 text-base text-slate-600 max-w-xl mx-auto">Get a personalized healthcare venture report with recommended pathway, financial projections, and investment analysis.</p>
        </div>
      </section>
      <section className="py-8 pb-20"><div className="max-w-md mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
          <h2 className="font-heading text-lg font-semibold text-slate-900 mb-1">Your Details</h2>
          <p className="text-sm text-slate-500 mb-5">Your personalized report will be prepared based on this information</p>
          {cErr && <div className="mb-3 p-2.5 bg-red-50 text-red-600 text-sm rounded-lg" data-testid="contact-error">{cErr}</div>}
          <form onSubmit={goContact} className="space-y-3">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label><input type="text" required value={contact.full_name} onChange={e => setContact({...contact, full_name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Dr. Ahmed Hassan" data-testid="planner-name" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label><input type="email" required value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="ahmed@email.com" data-testid="planner-email" /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
              <div className="flex gap-2">
                <select value={contact.phone_code} onChange={e => setContact({...contact, phone_code: e.target.value})} className="border border-slate-200 rounded-lg px-2 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary outline-none w-28" data-testid="planner-phone-code">
                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code} {c.country}</option>)}
                </select>
                <input type="text" required value={contact.phone_num} onChange={e => { const v = e.target.value.replace(/\D/g, ''); setContact({...contact, phone_num: v}); }} className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="501234567" data-testid="planner-phone" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{COUNTRY_CODES.find(c => c.code === contact.phone_code)?.digits || 10} digits for {COUNTRY_CODES.find(c => c.code === contact.phone_code)?.country || 'selected country'}</p>
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-full text-sm flex items-center justify-center gap-2" data-testid="planner-contact-next">Continue <ArrowRight size={16} /></button>
          </form>
        </div>
      </div></section>
    </div>
  );

  // QUESTIONS
  if (phase === 'questions') return (
    <div>
      <section className="bg-gradient-to-b from-primary-50/40 to-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">Tell Us About Your Goals</h1>
          <p className="text-slate-500 text-sm mt-1">Preparing report for {contact.full_name}</p>
        </div>
      </section>
      <section className="py-6 pb-20"><div className="max-w-2xl mx-auto px-4">
        <div className="flex gap-1 mb-6">{flow.map((_, i) => <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= si ? 'bg-primary' : 'bg-slate-200'}`} />)}</div>
        {cur && <div data-testid={`step-${cur.id}`}>
          <p className="text-xs text-primary font-medium mb-1">Step {si + 1} of {flow.length}</p>
          <h2 className="font-heading text-xl font-semibold text-slate-900 mb-5">{cur.q}</h2>
          <div className={`grid ${cur.opts.length <= 3 ? 'md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3'} gap-3`}>
            {cur.opts.map(o => { const sel = ans[cur.id] === o.v; const I = o.i; return (
              <button key={o.v} onClick={() => pick(cur.id, o.v)} className={`p-4 rounded-xl border-2 text-left transition-all ${sel ? 'border-primary bg-primary-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`} data-testid={`option-${o.v}`}>
                {I && <I size={18} className={`mb-1.5 ${sel ? 'text-primary' : 'text-slate-400'}`} />}
                <p className={`text-sm font-medium ${sel ? 'text-primary' : 'text-slate-700'}`}>{o.l}</p>
                {o.d && <p className="text-[11px] text-slate-500 mt-0.5">{o.d}</p>}
              </button>
            ); })}
          </div>
        </div>}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => si > 0 ? setSi(si - 1) : setPhase('contact')} className="text-sm text-slate-500 hover:text-primary">Back</button>
          <div className="flex gap-3">
            {!done && cur && ans[cur.id] !== undefined && si < flow.length - 1 && <button onClick={() => setSi(si + 1)} className="bg-slate-100 text-slate-700 font-medium px-6 py-2.5 rounded-full text-sm">Next</button>}
            {done && <button onClick={go} disabled={loading} className="bg-primary hover:bg-blue-600 text-white font-medium px-8 py-2.5 rounded-full text-sm flex items-center gap-2 disabled:opacity-50" data-testid="planner-generate">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <>Generate Report <ArrowRight size={16} /></>}
            </button>}
          </div>
        </div>
      </div></section>
    </div>
  );

  // REPORT
  if (!r || r.error) return <div className="min-h-[60vh] flex items-center justify-center"><div className="text-center"><p className="text-slate-600 mb-4">Could not generate report.</p><button onClick={reset} className="bg-primary text-white px-6 py-2.5 rounded-full text-sm">Start Over</button></div></div>;

  const isManaged = r.recommended_journey?.includes('Managed');
  const isFranchise = r.recommended_journey?.includes('Franchise') && !isManaged;
  const isCareer = r.recommended_journey?.includes('Career');

  return (
    <div className="bg-white" data-testid="planner-report">
      {/* S1: Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 text-white py-12 md:py-16" data-testid="report-header">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <p className="text-primary-300 text-xs font-medium tracking-wider uppercase mb-2">MedPreneur Personalized Healthcare Venture Report</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-6">Your Customized Pathway to Healthcare Asset Ownership in the UAE</h1>
          <div className="grid grid-cols-4 gap-x-4 gap-y-3" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)'}}>
            <div><p className="text-slate-400 text-[10px] uppercase">Prepared For</p><p className="font-semibold text-sm" style={{wordBreak: 'break-word'}}>{contact.full_name}</p></div>
            <div><p className="text-slate-400 text-[10px] uppercase">Phone</p><p className="font-semibold text-sm">{contact.phone_code}{contact.phone_num}</p></div>
            <div><p className="text-slate-400 text-[10px] uppercase">Email</p><p className="font-semibold text-sm" style={{wordBreak: 'break-all'}}>{contact.email}</p></div>
            <div><p className="text-slate-400 text-[10px] uppercase">Report Date</p><p className="font-semibold text-sm">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          </div>
          <div className={`inline-block mt-4 px-4 py-1.5 rounded-full text-xs font-semibold ${jCol[r.recommended_journey] || 'bg-slate-600'} text-white`}>{r.recommended_journey}</div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8" id="report-content">
        {/* S2: Profile */}
        <section><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><User size={18} className="text-primary" /> Your Profile Summary</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">{[['Profession', (ans.user_type||'').replace(/_/g,' ')], ['Specialty', ans.specialty || 'N/A'], ['Budget', ans.budget || 'N/A'], ['Ownership', (ans.ownership_preference||'N/A').replace(/_/g,' ')], ['Management', (ans.operate_self||'N/A').replace(/_/g,' ')], ['Pathway', (ans.pathway||'').replace(/_/g,' ')]].map(([l,v],i) => <div key={i} className="bg-surface rounded-lg p-2 border border-slate-100"><p className="text-[9px] text-slate-500 uppercase">{l}</p><p className="text-xs font-semibold text-slate-900 capitalize">{v}</p></div>)}</div>
          <p className="text-sm text-slate-600 bg-primary-50 rounded-lg p-3 border border-primary/10">Based on your information, MedPreneur has generated a personalized recommendation aligned with your {isCareer ? 'career development' : 'capital and healthcare venture'} goals.</p>
        </section>

        {/* PROMINENT RECOMMENDATION TILE */}
        <section data-testid="report-recommendation-tile">
          <div className={`rounded-2xl p-8 text-center ${isCareer ? 'bg-gradient-to-r from-blue-600 to-blue-500' : isManaged ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-500'} text-white shadow-xl`}>
            <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-2">MedPreneur Recommended Pathway</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-1">{isCareer ? (r.recommended_package || r.recommended_tier) : (r.recommended_tier || r.recommended_package)}</h2>
            <p className="text-base opacity-90">{r.recommended_journey}</p>
            {!isCareer && r.estimated_capital_required && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-lg font-bold">Total Investment: {r.estimated_capital_required}</p>
                {(r.estimated_units || 0) > 1 && <p className="text-sm opacity-85 mt-0.5">Total Units: {r.estimated_units} Clinics</p>}
              </div>
            )}
            {isCareer && r.estimated_capital_required && (
              <p className="text-sm mt-2 opacity-80">Package Price: {r.estimated_capital_required}</p>
            )}
          </div>
        </section>

        {/* S3: Model */}
        <section><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Building2 size={18} className="text-primary" /> Recommended MedPreneur Model</h2>
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary/20 rounded-xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">{[['Model', r.recommended_journey], ['Tier', r.recommended_tier || r.recommended_package], ['Ownership', r.ownership_percentage]].map(([l,v],i) => <div key={i}><p className="text-[10px] text-slate-500">{l}</p><p className="text-sm font-heading font-bold text-slate-900">{v}</p></div>)}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">{[['Units', r.estimated_units||1], ['Management', r.managed_by], ['Format', r.clinic_format||r.recommended_package]].map(([l,v],i) => <div key={i}><p className="text-[10px] text-slate-500">{l}</p><p className="text-slate-800 font-medium">{v}</p></div>)}</div>
          </div>
          {r.fit_summary && <p className="text-sm text-slate-600 leading-relaxed mt-3">{r.fit_summary}</p>}
        </section>

        {/* S4: Investment */}
        <section data-testid="report-investment"><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Investment Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>{[
            { l: 'Capital Required', v: r.estimated_capital_required, c: 'border-blue-200 bg-blue-50' },
            { l: 'Franchise Fee', v: r.franchise_fee||'N/A', c: 'border-amber-200 bg-amber-50' },
            { l: 'Royalty / Share', v: r.royalty||'N/A', c: 'border-emerald-200 bg-emerald-50' },
            { l: 'Ownership', v: r.ownership_percentage, c: 'border-purple-200 bg-purple-50' },
          ].map((c,i) => <div key={i} className={`border-2 ${c.c} rounded-xl p-3`}><p className="text-[9px] text-slate-500 uppercase mb-1">{c.l}</p><p className="text-xs font-bold text-slate-900">{c.v}</p></div>)}</div>
        </section>

        {/* S5: Financials */}
        <section data-testid="report-financials"><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><BarChart3 size={18} className="text-primary" /> Five-Year Financial Projection</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>{[
            ['Annual Revenue (Year 2)', r.expected_annual_revenue], ['Total 5-Year Return', r.total_5yr_revenue||r.expected_roi],
            ['5-Year ROI', r.expected_roi], ['Expected IRR', r.expected_irr],
            ['Payback Period', r.expected_payback ? (String(r.expected_payback).includes('year') ? r.expected_payback : `${r.expected_payback} years`) : null],
            ['Avg Monthly Return', r.avg_monthly_return],
          ].filter(([,v]) => v && !String(v).includes('N/A')).map(([l,v],i) => <div key={i} className="bg-surface border border-slate-100 rounded-xl p-3"><p className="text-[9px] text-slate-500 uppercase mb-1">{l}</p><p className="text-xs font-bold text-slate-900">{v}</p></div>)}</div>
          <p className="text-[10px] text-slate-400 mt-2">* Avg monthly return = total 5-year investor distributions / 60 months</p>
        </section>

        {/* Feasibility Summary */}
        {r.feasibility && (
        <section data-testid="report-feasibility">
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><BarChart3 size={18} className="text-emerald-600" /> Clinic Feasibility Summary</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(r.feasibility).map(([clinicKey, data]) => (
              <div key={clinicKey} className="bg-white border-2 border-slate-100 rounded-xl p-5">
                <h3 className="font-heading font-semibold text-slate-900 text-sm capitalize mb-3">{clinicKey} Clinic</h3>
                <div className="space-y-2">
                  {[
                    ['Monthly Revenue', data.monthly_revenue],
                    ['Monthly Net Profit', data.monthly_profit],
                    ['Annual Revenue', data.annual_revenue],
                    ['Annual Net Profit', data.annual_net_profit],
                    ['EBITDA', data.ebitda],
                    ['Annual Royalty (10%)', data.royalty_annual],
                    ['Payback Period', data.payback],
                  ].filter(([,v]) => v).map(([label, val], i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium text-slate-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* S6: Scenarios */}
        {r.scenarios && <section data-testid="report-scenarios"><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Shield size={18} className="text-primary" /> Investment Scenario Comparison</h2>
          <div className="grid md:grid-cols-3 gap-3">{r.scenarios.map((s,i) => <div key={i} className={`border-2 rounded-xl p-4 ${i===0?'border-primary bg-primary-50':'border-slate-200'}`}>
            {i===0 && <span className="text-[9px] font-bold text-primary uppercase">Recommended</span>}
            <h3 className="font-heading font-semibold text-slate-900 text-sm mt-1">{s.name}</h3>
            <div className="mt-2 space-y-1.5 text-xs">{[['Investment',s.investment],['5-Year ROI',s.roi_5yr],['IRR',s.irr],['Management',s.managed]].map(([l,v],j) => <div key={j} className="flex justify-between"><span className="text-slate-500">{l}</span><span className="font-medium">{v}</span></div>)}</div>
          </div>)}</div>
        </section>}

        {/* S7: Readiness */}
        <section data-testid="report-readiness"><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Star size={18} className="text-primary" /> Investor Readiness Score</h2>
          <div className="bg-surface border border-slate-100 rounded-xl p-5 flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0"><svg className="w-24 h-24 -rotate-90"><circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="7" /><circle cx="48" cy="48" r="40" fill="none" stroke="#6495ED" strokeWidth="7" strokeDasharray={`${rs*2.51} 251`} strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-heading font-bold text-slate-900">{rs}</span></div></div>
            <div className="flex-1 space-y-1.5">{[['Capital Readiness', ans.budget && !ans.budget.includes('Under') ? 90 : 40], ['Market Fit', 85], ['Operational Readiness', r.managed_by?.includes('MedPreneur') ? 92 : 70], ['Risk Profile', r.risk_level==='Low'?90:75], ['Opportunity', 88]].map(([l,v],i) => <div key={i} className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-200 rounded-full"><div className="h-full bg-primary rounded-full" style={{width:`${v}%`}} /></div><span className="text-[10px] text-slate-500 w-28">{l} ({v}%)</span></div>)}</div>
          </div>
        </section>

        {/* S8: Why UAE */}
        <section data-testid="report-uae"><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Globe size={18} className="text-primary" /> Why UAE Healthcare</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">{[['USD 39B+','Market by 2028'],['85%+','Insurance Coverage'],['4,000+','Private Clinics'],['Growing','Medical Tourism']].map(([v,l],i) => <div key={i} className="bg-slate-900 text-white rounded-lg p-3 text-center"><p className="text-sm font-heading font-bold">{v}</p><p className="text-[9px] text-slate-400">{l}</p></div>)}</div>
          {r.why_uae && <p className="text-sm text-slate-600 leading-relaxed">{r.why_uae}</p>}
        </section>

        {/* S9: Why MedPreneur + vs Traditional */}
        <section data-testid="report-why-mp"><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Award size={18} className="text-primary" /> Why MedPreneur</h2>
          <div className="grid md:grid-cols-2 gap-2 mb-4">{['Turnkey healthcare venture model', 'Clinic development and setup support', 'Licensing and regulatory assistance', 'Operational management (HealthRails)', 'Healthcare talent network', 'Marketing and patient acquisition engine', 'Financial dashboards and analytics', 'Growth and expansion advisory'].map((a,i) => <div key={i} className="flex items-center gap-2 p-2.5 bg-surface rounded-lg border border-slate-100 text-xs text-slate-700"><CheckCircle size={13} className="text-primary flex-shrink-0" />{a}</div>)}</div>
          <div className="bg-slate-900 text-white rounded-xl p-5">
            <h3 className="font-heading font-semibold text-sm mb-3">MedPreneur vs Traditional Market</h3>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="font-medium text-slate-400">Aspect</div><div className="text-red-300 font-medium">Independent Setup</div><div className="text-emerald-300 font-medium">MedPreneur Platform</div>
              {[['Licensing','DIY research','Structured guidance'],['Insurance','Self-negotiate','Day-one integration'],['Marketing','Own budget','Central engine'],['Technology','Build from scratch','HealthRails included'],['Governance','No dashboards','Real-time analytics'],['Scaling','Start over each time','Replication playbook']].map(([a,t,m],i) => <React.Fragment key={i}><div className="text-slate-400 py-1 border-t border-white/10">{a}</div><div className="text-red-200/70 py-1 border-t border-white/10">{t}</div><div className="text-emerald-200 py-1 border-t border-white/10">{m}</div></React.Fragment>)}
            </div>
          </div>
        </section>

        {/* S10: Timeline - only for Franchise/Managed (NOT Career) */}
        {!isCareer && <section data-testid="report-timeline"><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Calendar size={18} className="text-primary" /> Investment Timeline & Long-Term Growth</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">{[['Year 0','Investment & Setup'],['Year 1','Launch & Acquisition'],['Year 2','Stability'],['Year 3','Revenue Growth'],['Year 4','Expansion'],['Year 5','Maturity / Exit']].map(([y,d],i) => <div key={i} className="bg-white border-2 border-slate-100 rounded-lg p-3 text-center hover:border-primary/30"><p className="text-[10px] font-bold text-primary">{y}</p><p className="text-[9px] text-slate-600 mt-0.5">{d}</p></div>)}</div>
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary/10 rounded-xl p-5">
            <h3 className="font-heading font-semibold text-slate-900 text-sm mb-3">20-Year Wealth Building Through MedPreneur</h3>
            <div className="space-y-2">
              {[
                { yr: 'Year 1-2', title: 'First Clinic Investment', desc: 'Establish your first healthcare asset. Focus on stabilization, patient acquisition, and operational excellence.' },
                { yr: 'Year 3-5', title: 'Portfolio Growth', desc: 'Reinvest profits into a second clinic. Diversify across tiers or locations for risk mitigation.' },
                { yr: 'Year 5-10', title: 'Healthcare Portfolio', desc: 'Build a portfolio of 3-5 clinics generating compounding returns. Consider exit on early assets at 6x EBITDA.' },
                { yr: 'Year 10-15', title: 'Asset Network', desc: 'Operate a network of healthcare assets across multiple specialties and locations in the UAE and potentially the region.' },
                { yr: 'Year 15-20', title: 'Healthcare Investment Legacy', desc: 'Your healthcare venture portfolio becomes a generational wealth vehicle with diversified income streams and appreciating asset values.' },
              ].map((m,i) => <div key={i} className="flex gap-3 items-start"><div className="w-16 flex-shrink-0 text-[10px] font-bold text-primary bg-white rounded px-2 py-1 text-center border border-primary/20">{m.yr}</div><div><p className="text-xs font-semibold text-slate-900">{m.title}</p><p className="text-[10px] text-slate-600">{m.desc}</p></div></div>)}
            </div>
          </div>
        </section>}

        {/* S11: Exit - only for investment pathways */}
        {!isCareer && r.exit_clinic_valuation && <section data-testid="report-exit"><h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Estimated Exit Value</h2>
          <div className="grid md:grid-cols-3 gap-3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>{[['Valuation Multiple',r.exit_valuation_multiple,'bg-surface'],['Clinic Valuation (Yr 5)',r.exit_clinic_valuation,'bg-surface'],['Investor Share',r.exit_investor_share,'bg-primary-50 border-primary/20']].map(([l,v,c],i) => <div key={i} className={`border border-slate-100 rounded-xl p-4 ${c}`}><p className="text-[9px] text-slate-500 uppercase">{l}</p><p className="text-lg font-heading font-bold text-slate-900">{v}</p></div>)}</div>
        </section>}

        {/* Personalized pathway content */}
        {isCareer && <section className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="font-heading font-semibold text-slate-900 text-sm mb-2">Your Career Progression Journey</h3>
          <div className="space-y-1.5 text-xs text-slate-700">{['Observership placement and clinical exposure','UAE licensing and DataFlow verification','Exam preparation and professional certification','Employment placement in UAE healthcare','Career advancement toward asset ownership'].map((s,i) => <div key={i} className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-[9px] font-bold flex items-center justify-center">{i+1}</div>{s}</div>)}</div>
        </section>}
        {isFranchise && <section className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
          <h3 className="font-heading font-semibold text-slate-900 text-sm mb-2">Your Franchise Ownership Journey</h3>
          <div className="space-y-1.5 text-xs text-slate-700">{['Franchise agreement and SPV formation','Site selection and clinic design','Licensing, compliance, and fit-out','Insurance panel onboarding and marketing launch','Operations start with MedPreneur operating system','Revenue growth and expansion planning'].map((s,i) => <div key={i} className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 text-[9px] font-bold flex items-center justify-center">{i+1}</div>{s}</div>)}</div>
        </section>}
        {isManaged && <section className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <h3 className="font-heading font-semibold text-slate-900 text-sm mb-2">Your Managed Franchise Investment Journey</h3>
          <div className="space-y-1.5 text-xs text-slate-700">{['Investment agreement and SPV structuring','MedPreneur handles site, licensing, and setup','Clinic launch with specialist hiring and insurance','Governance dashboards and monthly reporting begin','Profit distributions start (60% to investor)','Portfolio expansion and exit optionality'].map((s,i) => <div key={i} className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 text-[9px] font-bold flex items-center justify-center">{i+1}</div>{s}</div>)}</div>
        </section>}

        {/* S12: Next Steps */}
        <section>
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-3">Next Steps</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Link to="/consultation" className="flex items-center gap-3 p-4 bg-primary hover:bg-blue-600 text-white rounded-xl transition-all"><Calendar size={18} /><div><p className="font-semibold text-sm">Book Investment Consultation</p><p className="text-[10px] text-blue-100">Discuss this report with an advisor</p></div></Link>
            <Link to="/register-interest" className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 hover:border-primary text-slate-900 rounded-xl transition-all"><Briefcase size={18} className="text-primary" /><div><p className="font-semibold text-sm">Start Application</p><p className="text-[10px] text-slate-500">Begin your MedPreneur journey</p></div></Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium"><Download size={14} /> Download Report (PDF)</button>
            <button onClick={reset} className="text-primary hover:text-blue-700 text-sm font-medium px-4 py-2">Generate New Report</button>
          </div>
        </section>

        {r.risk_summary && <div className="bg-amber-50 border border-amber-100 rounded-xl p-4"><h4 className="font-heading font-semibold text-slate-900 text-xs mb-1">Risk Assessment</h4><p className="text-[10px] text-slate-600">{r.risk_summary}</p></div>}
        <p className="text-[9px] text-slate-400 text-center pb-8">This report is generated based on MedPreneur financial models. All figures are projections. Final terms confirmed during consultation. Report ID: {result?.plan_id?.slice(0,8)}</p>
      </div>
    </div>
  );
}
