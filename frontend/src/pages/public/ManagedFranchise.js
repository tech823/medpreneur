import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, BarChart3, ArrowRight, CheckCircle, Building2, DollarSign } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/images/d892230856997a1badb86e0c21fda7b526049710f504861b90e7813dff0a3114.png";

const tiers = [
  {
    name: 'Basic',
    investment: '3M AED',
    size: '2,000 sqft',
    rooms: '4 OPD Rooms',
    lab: 'Mini Lab',
    imaging: 'Ultrasound',
    dental: 'No',
    verticals: 'GP, Dermatology, OBGYN, Mental Health',
    color: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Standard',
    investment: '5M AED',
    size: '2,500 sqft',
    rooms: '5 OPD Rooms',
    lab: 'Full Lab',
    imaging: 'Ultrasound',
    dental: '1 Chair',
    verticals: 'Expanded + Dental',
    color: 'border-primary bg-primary-50',
    badge: 'bg-primary-100 text-primary-700',
    featured: true,
  },
  {
    name: 'Premium',
    investment: '8M AED',
    size: '3,200 sqft',
    rooms: '7 OPD Rooms',
    lab: 'Full Lab',
    imaging: 'Ultrasound + X-ray',
    dental: '2 Chairs',
    verticals: 'Full Multi-Specialty + Aesthetic',
    color: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
  },
];

export default function ManagedFranchise() {
  return (
    <div>
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-white" data-testid="investment-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={fadeUp} className="text-amber-600 font-semibold text-sm tracking-wider uppercase mb-3">Managed Franchise Pathway</motion.p>
              <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Invest in Healthcare Infrastructure with Professional Management</motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-600 leading-relaxed">Deploy capital into managed outpatient polyclinics in the UAE. MedPreneur handles setup, operations, marketing, and governance while you earn structured returns.</motion.p>
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-4">
                <Link to="/register-interest" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md transition-all active:scale-95" data-testid="investment-register-btn">Express Interest <ArrowRight size={18} /></Link>
                <Link to="/consultation" className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium px-7 py-3 rounded-full transition-all" data-testid="investment-consult-btn">Managed Franchise Consultation</Link>
              </motion.div>
            </motion.div>
            <div className="hidden lg:block"><div className="rounded-2xl overflow-hidden shadow-xl"><img src={HERO_IMG} alt="Healthcare Investment" className="w-full h-[380px] object-cover" /></div></div>
          </div>
        </div>
      </section>

      {/* Investment Structure */}
      <section className="py-20 bg-white" data-testid="investment-structure">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Investment Structure</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Each clinic is structured under a separate Special Purpose Vehicle (SPV) for legal and financial clarity.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface border border-slate-100 rounded-xl p-7 text-center">
              <DollarSign size={28} className="text-primary mx-auto mb-3" />
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-1">100% Equity</h3>
              <p className="text-sm text-slate-600">Investments structured as pure equity stakes in clinic SPVs.</p>
            </div>
            <div className="bg-surface border border-slate-100 rounded-xl p-7 text-center">
              <Shield size={28} className="text-primary mx-auto mb-3" />
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-1">15% Franchise Retainer</h3>
              <p className="text-sm text-slate-600">One-time retainer fee on total equity ticket size.</p>
            </div>
            <div className="bg-surface border border-slate-100 rounded-xl p-7 text-center">
              <BarChart3 size={28} className="text-primary mx-auto mb-3" />
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-1">60/40 Profit Share</h3>
              <p className="text-sm text-slate-600">60% of net operating profit to investor, 40% to MedPreneur.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Tiers */}
      <section className="py-20 bg-surface" data-testid="investment-tiers">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Investment Tiers</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Choose Your Investment Level</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier, i) => (
              <div key={i} className={`bg-white border-2 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow ${tier.featured ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'}`} data-testid={`investment-tier-${i}`}>
                {tier.featured && (
                  <div className="bg-primary text-white text-center text-xs font-semibold py-1.5">Most Popular</div>
                )}
                <div className="p-7">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${tier.badge}`}>{tier.name}</span>
                  <div className="mt-4 mb-6">
                    <p className="text-3xl font-heading font-bold text-slate-900">{tier.investment}</p>
                    <p className="text-sm text-slate-500 mt-1">Equity Ticket</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Clinic Size', val: tier.size },
                      { label: 'OPD Rooms', val: tier.rooms },
                      { label: 'Laboratory', val: tier.lab },
                      { label: 'Imaging', val: tier.imaging },
                      { label: 'Dental', val: tier.dental },
                      { label: 'Specialties', val: tier.verticals },
                    ].map((row, j) => (
                      <div key={j} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-medium text-slate-900 text-right">{row.val}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/register-interest" className="mt-6 block text-center bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-full transition-all text-sm">
                    Express Interest
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-white" data-testid="investment-features">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">What MedPreneur Manages</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              'Regulatory enablement and licensing',
              'Clinical SOP framework implementation',
              'Insurance revenue cycle management',
              'Corporate acquisition and B2B contracts',
              'HealthRails digital platform deployment',
              'Real-time governance dashboards',
              'Specialist onboarding and management',
              'Central procurement and vendor contracts',
              'Marketing and patient acquisition',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-slate-100">
                <CheckCircle size={18} className="text-primary flex-shrink-0" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Mitigation */}
      <section className="py-20 bg-surface" data-testid="investment-risk">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">Risk Mitigation Strategy</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                MedPreneur builds a structured system to minimize investment risk through diversification, operational discipline, and transparent governance.
              </p>
              <div className="space-y-3">
                {[
                  'Insurance integration from day one',
                  'Diversified specialty mix',
                  'Corporate contract pipeline',
                  'Revenue share specialist model',
                  'Real-time performance dashboards',
                  'Centralized procurement',
                  'Managed operational execution',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-card">
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-6">Target Investors</h3>
              <div className="space-y-4">
                {[
                  { title: 'Family Offices', desc: 'Seeking diversified asset allocation in healthcare.' },
                  { title: 'Strategic Healthcare Investors', desc: 'Looking for operational exposure in outpatient care.' },
                  { title: 'Regional Business Groups', desc: 'Expanding portfolio into healthcare infrastructure.' },
                  { title: 'Long-Term Yield Seekers', desc: 'Targeting structured returns with asset-backed investments.' },
                ].map((inv, i) => (
                  <div key={i} className="p-4 bg-surface rounded-lg">
                    <h4 className="font-semibold text-slate-900 text-sm">{inv.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{inv.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Projections - from document */}
      <section className="py-20 bg-white" data-testid="investment-financials">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Financial Projections</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">5-Year Investor Returns</h2>
            <p className="text-slate-600 text-sm mt-2">Projected cash flow to investor (60% of net operating profit) with 6x EBITDA exit</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { tier: 'Basic', invest: '3M AED', total: '7.1M AED', roi: '236%', irr: '28%', y2: '405K', y5: '820K', color: 'border-blue-200 bg-blue-50' },
              { tier: 'Standard', invest: '5M AED', total: '14.0M AED', roi: '281%', irr: '32%', y2: '825K', y5: '1.6M', color: 'border-primary bg-primary-50' },
              { tier: 'Premium', invest: '8M AED', total: '26.2M AED', roi: '327%', irr: '35%', y2: '1.6M', y5: '3.0M', color: 'border-amber-200 bg-amber-50' },
            ].map((t, i) => (
              <div key={i} className={`border-2 rounded-xl p-6 ${t.color}`} data-testid={`return-card-${i}`}>
                <span className="text-xs font-semibold text-slate-600">{t.tier} Model</span>
                <p className="text-2xl font-heading font-bold text-slate-900 mt-2">{t.invest}</p>
                <p className="text-xs text-slate-500">Equity Ticket</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500 text-xs">Year 2 Cash</span><span className="font-medium text-xs">{t.y2} AED</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 text-xs">Year 5 Cash</span><span className="font-medium text-xs">{t.y5} AED</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 text-xs">Total Return (incl. exit)</span><span className="font-bold text-emerald-700 text-xs">{t.total}</span></div>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-black/10">
                  <div><p className="text-[10px] text-slate-500">5-Year ROI</p><p className="font-bold text-sm text-primary">{t.roi}</p></div>
                  <div><p className="text-[10px] text-slate-500">5-Year IRR</p><p className="font-bold text-sm text-primary">{t.irr}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/franchise-commercials" className="inline-flex items-center gap-2 text-primary hover:text-blue-700 font-medium text-sm" data-testid="view-full-model-link">
              View Complete Financial Model with CAPEX & OPEX Breakdown <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900" data-testid="investment-cta">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">Explore Managed Franchise Opportunities</h2>
          <p className="text-slate-400 mb-6">Schedule a confidential consultation to review financial models and site pipelines.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register-interest" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md transition-all" data-testid="investment-cta-btn">
              Register Interest <ArrowRight size={18} />
            </Link>
            <Link to="/franchise-commercials" className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 font-medium px-7 py-3 rounded-full transition-all hover:bg-white/20" data-testid="investment-commercials-btn">
              View Financial Model
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
