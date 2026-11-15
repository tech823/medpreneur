import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, Shield, ArrowRight, CheckCircle, Percent, CreditCard } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };
const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/images/a4c71a8149b32e1fff9b519c2184df0e579a39079105d70f4ed217b847f66cb6.png";

export default function FranchisePathway() {
  return (
    <div>
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-white" data-testid="franchise-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={fadeUp} className="text-emerald-600 font-semibold text-sm tracking-wider uppercase mb-3">Franchise Pathway</motion.p>
              <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Own a Healthcare Asset, Operate with Intelligence</motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-600 leading-relaxed">The MedPreneur Franchise Pathway enables healthcare professionals to own and operate clinics and pharmacies with full operational support, proven systems, and a replicable model for growth.</motion.p>
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-4">
                <Link to="/register-interest" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md transition-all active:scale-95" data-testid="franchise-register-btn">Apply for Franchise <ArrowRight size={18} /></Link>
                <Link to="/consultation" className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium px-7 py-3 rounded-full transition-all" data-testid="franchise-consult-btn">Book Consultation</Link>
              </motion.div>
            </motion.div>
            <div className="hidden lg:block"><div className="rounded-2xl overflow-hidden shadow-xl"><img src={HERO_IMG} alt="Modern Healthcare Clinic" className="w-full h-[380px] object-cover" /></div></div>
          </div>
        </div>
      </section>

      {/* Clinic Asset Structure */}
      <section className="py-20 bg-white" data-testid="franchise-models">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Clinic Asset Structure</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Choose Your Ownership Model</h2>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">The ownership model determines your equity allocation, operational authority, revenue sharing, and exit structure.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'Full Franchise', ownership: '100% Ownership', desc: 'Single owner SPV with complete equity control and full operational authority. You are the sole owner of the clinic asset with direct control over clinical leadership, team hiring, and strategic decisions. Ideal for experienced professionals ready for full clinic ownership.', highlight: 'Complete Control', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200' },
              { icon: Users, title: 'Co-Franchise', ownership: '20% - 50% Ownership', desc: '2-5 healthcare professionals share an SPV with defined equity splits and shared infrastructure. Lower capital requirement per person with shared operational risk. Immediate integration into the MedPreneur network with ownership from day one.', highlight: 'Shared Ownership', color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
              { icon: CreditCard, title: 'Slot Franchise', ownership: '5% - 15% Ownership', desc: 'Own a room or time slots within a larger clinic. Lowest capital entry point with access to shared clinic infrastructure, revenue tracked independently, and royalty applied proportionally. A structured entry ladder into healthcare asset ownership.', highlight: 'Entry-Level Ownership', color: 'bg-amber-50 text-amber-600', border: 'border-amber-200' },
            ].map((model, i) => {
              const Icon = model.icon;
              return (
                <div key={i} className={`bg-white border-2 ${model.border} rounded-xl p-7 shadow-card hover:shadow-card-hover transition-shadow`} data-testid={`franchise-model-${i}`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${model.color} mb-4`}><Icon size={24} /></div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${model.color}`}>{model.highlight}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-slate-900 mb-1">{model.title}</h3>
                  <p className="text-primary font-bold text-lg mb-3">{model.ownership}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{model.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clinic Formats */}
      <section className="py-20 bg-surface" data-testid="franchise-formats">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Clinic Asset Options</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Individual GP Clinic', invest: '2M - 2.5M AED', desc: 'General practice clinic with core outpatient services.' },
              { name: 'Polyclinic with Lab', invest: '5M - 6.5M AED', desc: 'Multi-specialty polyclinic with pharmacy and laboratory.' },
              { name: 'Dental Clinic', invest: '1.5M - 2M AED', desc: 'Specialized dental clinic with modern equipment.' },
              { name: 'Aesthetic Clinic', invest: '2M - 3M AED', desc: 'Aesthetic and dermatology focused clinic.' },
              { name: 'Group Practice', invest: '4M - 6M AED', desc: 'Multi-doctor practice with shared infrastructure.' },
              { name: 'Co-Franchise Room', invest: '600K - 900K AED', desc: 'Own a room within a larger clinic network.' },
            ].map((fmt, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-6 shadow-card" data-testid={`franchise-format-${i}`}>
                <h3 className="font-heading font-semibold text-slate-900 mb-1">{fmt.name}</h3>
                <p className="text-primary font-semibold text-sm mb-3">{fmt.invest}</p>
                <p className="text-sm text-slate-600">{fmt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Model */}
      <section className="py-20 bg-white" data-testid="franchise-commercial">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">Franchise Commercial Model</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-5 bg-surface rounded-xl border border-slate-100">
                  <Percent size={24} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-heading font-semibold text-slate-900">Franchise Fee: 15% of CAPEX</h4>
                    <p className="text-sm text-slate-600 mt-1">One-time franchise setup fee calculated on total clinic setup capital expenditure.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-surface rounded-xl border border-slate-100">
                  <Shield size={24} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-heading font-semibold text-slate-900">Royalty: 10% of Gross Revenue</h4>
                    <p className="text-sm text-slate-600 mt-1">Ongoing royalty for continued access to the MedPreneur operating system and support.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8">
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-6">What You Get</h3>
              <div className="space-y-3">
                {[
                  'Franchise Operating System', 'HealthRails Clinic Software', 'Insurance panel onboarding',
                  'Claims management workflow', 'Central marketing engine', 'Governance dashboards',
                  'Vendor leverage and procurement', 'Territory framework', 'Expansion playbook'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Franchise Profit Waterfall - from document */}
      <section className="py-20 bg-surface" data-testid="franchise-profit">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Franchise Financial Overview</h2>
            <p className="text-slate-600 text-sm mt-2">Typical profit waterfall for franchise clinic models</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tier: 'Basic Polyclinic', capex: '2,100,000', fee: '315,000', revenue: '6,552,000', opex: '4,500,000', ebitda: '2,052,000', royalty: '655,200', net: '1,396,800', roi: '28-30%' },
              { tier: 'Standard Polyclinic', capex: '2,750,000', fee: '412,500', revenue: '11,520,000', opex: '8,500,000', ebitda: '3,020,000', royalty: '1,152,000', net: '1,868,000', roi: '30-35%' },
              { tier: 'Premium Polyclinic', capex: '4,500,000', fee: '675,000', revenue: '17,472,000', opex: '13,500,000', ebitda: '3,972,000', royalty: '1,747,200', net: '2,224,800', roi: '30-32%' },
            ].map((m, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card" data-testid={`franchise-waterfall-${i}`}>
                <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
                  <p className="font-heading font-semibold text-slate-900 text-sm">{m.tier}</p>
                  <p className="text-xs text-emerald-700">CAPEX: {m.capex} AED | Fee: {m.fee} AED</p>
                </div>
                <div className="p-5 space-y-2 text-xs">
                  {[
                    ['Annual Revenue', m.revenue, 'text-slate-900'],
                    ['Total OPEX', `(${m.opex})`, 'text-red-600'],
                    ['EBITDA', m.ebitda, 'text-emerald-700'],
                    ['Royalty (10%)', `(${m.royalty})`, 'text-amber-600'],
                    ['Net Profit', m.net, 'text-emerald-700 font-bold'],
                  ].map(([label, val, color], j) => (
                    <div key={j} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                      <span className="text-slate-600">{label}</span>
                      <span className={color}>{val} AED</span>
                    </div>
                  ))}
                  <div className="pt-2 text-center">
                    <span className="text-xs font-bold text-primary">Owner ROI: {m.roi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/franchise-commercials" className="inline-flex items-center gap-2 text-primary hover:text-blue-700 font-medium text-sm" data-testid="view-full-model-link">
              View Complete Financial Model <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900" data-testid="franchise-cta">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">Ready to Own a Healthcare Asset?</h2>
          <p className="text-slate-400 mb-6">Book a franchise consultation and explore ownership opportunities tailored to your profession.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register-interest" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md transition-all" data-testid="franchise-cta-btn">
              Apply Now <ArrowRight size={18} />
            </Link>
            <Link to="/franchise-commercials" className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 font-medium px-7 py-3 rounded-full transition-all hover:bg-white/20" data-testid="franchise-commercials-btn">
              View Financial Model
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
