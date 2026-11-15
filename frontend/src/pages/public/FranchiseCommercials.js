import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, DollarSign, ArrowRight, CheckCircle, BarChart3, Percent, Users, ArrowDown } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const tabs = ['Overview', 'Clinic Models', 'Commercial Structure', 'Revenue Streams', 'Financial Feasibility'];

export default function FranchiseCommercials() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50/50 to-white py-16 md:py-20" data-testid="commercials-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Financial Model</motion.p>
            <motion.h1 variants={fadeUp} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Franchise Commercials & Feasibility
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-600 leading-relaxed">
              Understand the MedPreneur clinic models, commercial structure, revenue potential, and financial feasibility before making your decision.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="sticky top-16 z-20 bg-white border-b border-slate-200" data-testid="commercials-tabs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`} data-testid={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'Overview' && (
          <div className="space-y-10" data-testid="tab-content-overview">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4">The MedPreneur Business Model</h2>
                <p className="text-slate-600 leading-relaxed mb-4">MedPreneur operates a managed outpatient healthcare platform focusing on polyclinics in the UAE. The model provides a structured, operational, and scalable healthcare asset class for both healthcare professionals and investors.</p>
                <p className="text-slate-600 leading-relaxed mb-4">The platform offers two distinct pathways with different commercial structures, both supported by the MedPreneur operating system including regulatory enablement, clinical SOPs, insurance integration, and marketing infrastructure.</p>
                <p className="text-slate-600 leading-relaxed">Each clinic is structured under a separate Special Purpose Vehicle (SPV) for legal and financial clarity.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, label: 'Franchise Fee', val: '15% of CAPEX', desc: 'One-time setup fee' },
                  { icon: Percent, label: 'Franchise Royalty', val: '10% Gross Rev', desc: 'For franchise owners' },
                  { icon: BarChart3, label: 'Managed Split', val: '60/40 Investor', desc: 'Net operating profit' },
                  { icon: TrendingUp, label: 'Target ROI', val: '20-35%', desc: 'Based on tier selected' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-surface border border-slate-100 rounded-xl p-5">
                      <Icon size={22} className="text-primary mb-2" />
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{item.val}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two pathways comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h3 className="font-heading font-semibold text-slate-900 mb-2">Franchise Pathway</h3>
                <p className="text-xs text-slate-500 mb-4">For healthcare professionals who own and operate clinics</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary flex-shrink-0" /> 15% franchise fee on total CAPEX</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary flex-shrink-0" /> 10% royalty on gross revenue</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary flex-shrink-0" /> Full operational ownership via SPV</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary flex-shrink-0" /> Owner ROI potential: 30-40%</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary flex-shrink-0" /> Typical EBITDA margin: 25-35%</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
                <h3 className="font-heading font-semibold text-slate-900 mb-2">Managed Franchise Pathway</h3>
                <p className="text-xs text-slate-500 mb-4">For investors - MedPreneur manages all operations</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-600 flex-shrink-0" /> 15% franchise retainer on equity ticket</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-600 flex-shrink-0" /> 60% net operating profit to investor</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-600 flex-shrink-0" /> 40% net operating profit to MedPreneur</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-600 flex-shrink-0" /> 100% equity structure, separate SPV</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-600 flex-shrink-0" /> 5-Year IRR: 28-35% based on tier</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ===== CLINIC MODELS TAB ===== */}
        {activeTab === 'Clinic Models' && (
          <div className="space-y-10" data-testid="tab-content-clinic-models">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-2">Managed Franchise Clinic Templates</h2>
              <p className="text-slate-600 text-sm">Three investment tiers with defined clinic specifications and infrastructure.</p>
            </div>

            {/* Tier cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Basic', equity: '3,000,000', size: '2,000 sqft', rooms: '4 OPD', lab: 'Mini Lab', imaging: 'Ultrasound', dental: 'No', verticals: 'GP, Dermatology, OBGYN, Mental Health', capex: '1,150,000', opex_reserve: '1,400,000', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
                { name: 'Standard', equity: '5,000,000', size: '2,500 sqft', rooms: '5 OPD', lab: 'Full Lab', imaging: 'Ultrasound', dental: '1 Chair', verticals: 'Expanded Specialties + Dental', capex: '2,050,000', opex_reserve: '2,200,000', badge: 'bg-primary text-white', border: 'border-primary', featured: true },
                { name: 'Premium', equity: '8,000,000', size: '3,200 sqft', rooms: '7 OPD', lab: 'Full Lab', imaging: 'Ultrasound + X-ray', dental: '2 Chairs', verticals: 'Full Multi-Specialty + Aesthetic + Anesthetic', capex: '3,500,000', opex_reserve: '3,300,000', badge: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
              ].map((t, i) => (
                <div key={i} className={`bg-white border-2 rounded-2xl overflow-hidden shadow-card ${t.featured ? 'border-primary ring-2 ring-primary/20' : t.border}`} data-testid={`clinic-model-${i}`}>
                  {t.featured && <div className="bg-primary text-white text-center text-xs font-semibold py-1.5">Most Popular</div>}
                  <div className="p-6">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.badge}`}>{t.name} Clinic</span>
                    <p className="text-2xl font-heading font-bold text-slate-900 mt-3">{t.equity} AED</p>
                    <p className="text-xs text-slate-500 mt-0.5">Equity Ticket</p>
                    <div className="mt-4 space-y-2 text-sm">
                      {[
                        ['Size', t.size], ['OPD Rooms', t.rooms], ['Laboratory', t.lab], ['Imaging', t.imaging], ['Dental', t.dental],
                        ['Core Verticals', t.verticals], ['CAPEX', `${t.capex} AED`], ['Year 1 OPEX Reserve', `${t.opex_reserve} AED`],
                      ].map(([label, val], j) => (
                        <div key={j} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                          <span className="text-slate-500 text-xs">{label}</span>
                          <span className="font-medium text-slate-900 text-xs text-right max-w-[55%]">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CAPEX Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-heading font-semibold text-slate-900">CAPEX Itemization (AED)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Item</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Basic</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Standard</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ['Fit Out & Interiors', '380,000', '600,000', '900,000'],
                      ['DHA Drawings & Approvals', '50,000', '80,000', '120,000'],
                      ['Core Medical Equipment', '150,000', '220,000', '260,000'],
                      ['Ultrasound', '90,000', '120,000', '150,000'],
                      ['Lab Setup', '-', '160,000', '240,000'],
                      ['Dental Setup', '-', '150,000', '300,000'],
                      ['Aesthetic Equipment', '-', '-', '220,000'],
                      ['Radiation Shielding + X-ray', '-', '-', '300,000'],
                      ['Pharmacy Setup + Inventory', '215,000', '290,000', '490,000'],
                      ['IT Hardware', '30,000', '40,000', '60,000'],
                      ['Licensing & Compliance', '80,000', '120,000', '220,000'],
                      ['Rent Deposit', '75,000', '120,000', '180,000'],
                      ['Pre-Opening Marketing', '30,000', '45,000', '80,000'],
                      ['Contingency', '30,000', '35,000', '100,000'],
                    ].map(([item, b, s, p], i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 text-slate-700 text-xs">{item}</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-600">{b}</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-600">{s}</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-600">{p}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold">
                      <td className="px-4 py-2.5 text-slate-900 text-xs">Total CAPEX</td>
                      <td className="px-4 py-2.5 text-right text-xs text-slate-900">1,150,000</td>
                      <td className="px-4 py-2.5 text-right text-xs text-slate-900">2,050,000</td>
                      <td className="px-4 py-2.5 text-right text-xs text-slate-900">3,500,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Franchise Clinic Formats */}
            <div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-4">Franchise Clinic Formats</h3>
              <p className="text-sm text-slate-500 mb-4">For healthcare professionals choosing the Franchise Pathway:</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Individual GP Clinic', range: '2M - 2.5M AED', fee: '300K-375K AED', roi: '35-40%' },
                  { name: 'Polyclinic with Lab & Pharmacy', range: '5M - 6.5M AED', fee: '750K-975K AED', roi: '30-35%' },
                  { name: 'Dental Clinic', range: '1.5M - 2M AED', fee: '225K-300K AED', roi: '~40%' },
                  { name: 'Aesthetic Clinic', range: '2M - 3M AED', fee: '300K-450K AED', roi: '40%+' },
                  { name: 'Group Practice', range: '4M - 6M AED', fee: '600K-900K AED', roi: '~35%' },
                  { name: 'Co-Franchise Room', range: '600K - 900K AED', fee: 'Included', roi: '30%+' },
                ].map((f, i) => (
                  <div key={i} className="bg-surface border border-slate-100 rounded-lg p-4">
                    <p className="font-semibold text-slate-900 text-sm">{f.name}</p>
                    <p className="text-primary font-medium text-sm mt-1">{f.range}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>Fee: {f.fee}</span>
                      <span>ROI: {f.roi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== COMMERCIAL STRUCTURE TAB ===== */}
        {activeTab === 'Commercial Structure' && (
          <div className="space-y-10" data-testid="tab-content-commercial">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">Commercial Structure</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Franchise Model */}
              <div className="space-y-4">
                <h3 className="font-heading text-xl font-semibold text-slate-900">Franchise Model</h3>
                <p className="text-sm text-slate-500">For healthcare professionals who own and operate their clinics.</p>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  {[
                    ['Franchise Fee', '15% of total CAPEX', 'One-time setup fee'],
                    ['Royalty', '10% of gross revenue', 'Ongoing operating system access'],
                    ['Ownership', '100% equity to franchisee', 'Full SPV ownership'],
                    ['EBITDA Target', '25-35%', 'Typical operating margin'],
                    ['Owner ROI', '30-40%', 'Depending on clinic format'],
                  ].map(([label, val, desc], i) => (
                    <div key={i} className="p-4 border-b border-slate-100 last:border-0">
                      <div className="flex justify-between"><span className="font-medium text-slate-900 text-sm">{label}</span><span className="text-primary font-semibold text-sm">{val}</span></div>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Managed Franchise Model */}
              <div className="space-y-4">
                <h3 className="font-heading text-xl font-semibold text-slate-900">Managed Franchise Model</h3>
                <p className="text-sm text-slate-500">For investors - MedPreneur handles all operations.</p>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  {[
                    ['Franchise Retainer', '15% of equity ticket', 'One-time management setup fee'],
                    ['Investor Profit Share', '60% of net operating profit', 'Majority share to investor'],
                    ['MedPreneur Share', '40% of net operating profit', 'Operations & management'],
                    ['Equity Structure', '100% equity investment', 'Separate SPV per clinic'],
                    ['Distribution Start', 'Year 2', 'After 6-month stabilization'],
                  ].map(([label, val, desc], i) => (
                    <div key={i} className="p-4 border-b border-slate-100 last:border-0">
                      <div className="flex justify-between"><span className="font-medium text-slate-900 text-sm">{label}</span><span className="text-amber-600 font-semibold text-sm">{val}</span></div>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fixed OPEX Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-heading font-semibold text-slate-900">Year 2 Fixed OPEX Breakdown (AED) - Managed Franchise</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100"><th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Category</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Basic</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Standard</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Premium</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ['Payroll & Benefits', '1,080,000', '1,800,000', '2,400,000'],
                      ['Rent', '240,000', '456,000', '600,000'],
                      ['Utilities', '72,000', '120,000', '216,000'],
                      ['Marketing', '120,000', '240,000', '420,000'],
                      ['HealthRails Platform', '60,000', '60,000', '60,000'],
                      ['Maintenance & AMC', '36,000', '72,000', '180,000'],
                      ['Compliance Fees', '24,000', '48,000', '84,000'],
                      ['Corporate Sales', '24,000', '48,000', '72,000'],
                      ['Other Overheads', '44,000', '56,000', '168,000'],
                    ].map(([item, b, s, p], i) => (
                      <tr key={i} className="hover:bg-slate-50/50"><td className="px-4 py-2 text-slate-700 text-xs">{item}</td><td className="px-4 py-2 text-right text-xs">{b}</td><td className="px-4 py-2 text-right text-xs">{s}</td><td className="px-4 py-2 text-right text-xs">{p}</td></tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold"><td className="px-4 py-2.5 text-slate-900 text-xs">Total Fixed OPEX</td><td className="px-4 py-2.5 text-right text-xs text-slate-900">1,700,000</td><td className="px-4 py-2.5 text-right text-xs text-slate-900">2,900,000</td><td className="px-4 py-2.5 text-right text-xs text-slate-900">4,200,000</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Capital Allocation */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">Capital Allocation Strategy</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Site Acquisition & Licensing', 'Fit-out & Compliance', 'Equipment & Diagnostics', 'Specialist Onboarding', 'Insurance Integration', 'Working Capital Buffer (12 months)'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle size={14} className="text-primary flex-shrink-0" />{item}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== REVENUE STREAMS TAB ===== */}
        {activeTab === 'Revenue Streams' && (
          <div className="space-y-10" data-testid="tab-content-revenue">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">Revenue Streams</h2>

            {/* Revenue Mix */}
            <div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">Year 2 Revenue Mix by Service Line</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { tier: 'Basic', total: '4,318,182', items: [['GP Consultations','35.9%'],['Aesthetics & Derm','15.1%'],['OBGYN','9.3%'],['Pediatric','9.3%'],['Pharmacy','8.8%'],['Physio & Sports','7.0%'],['Corporate & Tele','6.2%'],['Mental Health','5.1%'],['Imaging','3.5%']] },
                  { tier: 'Standard', total: '8,221,154', items: [['GP Consultations','24.3%'],['Aesthetics & Derm','17.0%'],['Pediatric','11.0%'],['OBGYN','10.3%'],['Dental','7.9%'],['Physio & Sports','6.7%'],['Pharmacy','6.7%'],['Corporate & Tele','5.7%'],['Mental Health','5.5%'],['Diagnostics','4.9%']] },
                  { tier: 'Premium', total: '11,839,080', items: [['Aesthetics & Derm','23.7%'],['GP Consultations','15.2%'],['Dental','10.1%'],['Pediatric','10.1%'],['OBGYN','9.3%'],['Mental Health','7.6%'],['Physio & Sports','6.8%'],['Diagnostics','5.1%'],['Pharmacy','5.1%'],['Corporate & Tele','3.3%'],['Imaging','3.0%']] },
                ].map((tier, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden" data-testid={`revenue-mix-${tier.tier.toLowerCase()}`}>
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                      <p className="font-heading font-semibold text-slate-900 text-sm">{tier.tier} Clinic</p>
                      <p className="text-primary font-bold text-lg">{tier.total} AED</p>
                    </div>
                    <div className="p-4 space-y-1.5">
                      {tier.items.map(([name, pct], j) => (
                        <div key={j} className="flex justify-between text-xs">
                          <span className="text-slate-600">{name}</span>
                          <span className="font-medium text-slate-900">{pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Engine */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-heading font-semibold text-slate-900">Revenue Engine Assumptions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100"><th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Metric</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Basic</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Standard</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Premium</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ['Active OPD Rooms', '3', '4', '6'],
                      ['Avg Patients per GP/Day', '20', '22', '25'],
                      ['Avg Patients per Specialist/Day', '10', '14', '18'],
                      ['Avg GP Ticket (Insured)', '200 AED', '220 AED', '250 AED'],
                      ['Avg Specialist Ticket', '350 AED', '400 AED', '450 AED'],
                      ['Avg Teleconsult Ticket', '150 AED', '180 AED', '200 AED'],
                      ['Working Days/Year', '312', '312', '312'],
                      ['Variable Cost %', '45%', '48%', '42%'],
                    ].map(([item, b, s, p], i) => (
                      <tr key={i} className="hover:bg-slate-50/50"><td className="px-4 py-2 text-slate-700 text-xs">{item}</td><td className="px-4 py-2 text-right text-xs">{b}</td><td className="px-4 py-2 text-right text-xs">{s}</td><td className="px-4 py-2 text-right text-xs">{p}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue Components */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">Revenue Engine Components</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Insurance panel integrated from day one', 'Corporate contracts and B2B patient acquisition',
                  'Teleconsultation revenue channel', 'Central marketing and patient acquisition engine',
                  'Cross-referral network between clinics', 'Revenue share specialist model (60% doctor / 40% clinic)',
                  'Pharmacy with 22% avg gross margin', 'Diagnostics: Lab + Imaging contribution',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-100 text-sm text-slate-700">
                    <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== FINANCIAL FEASIBILITY TAB ===== */}
        {activeTab === 'Financial Feasibility' && (
          <div className="space-y-10" data-testid="tab-content-financial-feasibility">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">Financial Feasibility</h2>
            <p className="text-slate-600 text-sm">Year 2 steady-state projections after 6-month stabilization period. Managed Franchise model.</p>

            {/* Break Even */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b"><h3 className="font-heading font-semibold text-slate-900">Break-Even Analysis</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100"><th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Metric</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Basic</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Standard</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Premium</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ['Break-Even Revenue', '3,090,909 AED', '5,576,923 AED', '7,241,379 AED'],
                      ['Avg Ticket Price', '250 AED', '320 AED', '420 AED'],
                      ['Annual Visits Required', '12,364', '17,428', '17,241'],
                      ['Daily Patients Required', '40', '56', '55'],
                    ].map(([item, b, s, p], i) => (
                      <tr key={i}><td className="px-4 py-2.5 text-slate-700 text-xs font-medium">{item}</td><td className="px-4 py-2.5 text-right text-xs">{b}</td><td className="px-4 py-2.5 text-right text-xs">{s}</td><td className="px-4 py-2.5 text-right text-xs">{p}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5 Year Cash Flow */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b"><h3 className="font-heading font-semibold text-slate-900">5-Year Operational Cash Flow to Investor (AED)</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100"><th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Year</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Basic</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Standard</th><th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Premium</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ['Year 1 (Stabilization)', '0', '0', '0'],
                      ['Year 2', '405,000', '825,000', '1,600,000'],
                      ['Year 3', '425,100', '872,700', '1,709,600'],
                      ['Year 4', '523,137', '1,062,069', '2,050,712'],
                      ['Year 5', '820,255', '1,611,332', '2,974,331'],
                    ].map(([yr, b, s, p], i) => (
                      <tr key={i}><td className="px-4 py-2.5 text-slate-700 text-xs font-medium">{yr}</td><td className="px-4 py-2.5 text-right text-xs">{b}</td><td className="px-4 py-2.5 text-right text-xs">{s}</td><td className="px-4 py-2.5 text-right text-xs">{p}</td></tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold"><td className="px-4 py-2.5 text-slate-900 text-xs">Total 5-Year Distributions</td><td className="px-4 py-2.5 text-right text-xs text-primary">2,173,492</td><td className="px-4 py-2.5 text-right text-xs text-primary">4,371,101</td><td className="px-4 py-2.5 text-right text-xs text-primary">8,334,643</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ROI Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { tier: 'Basic', invest: '3,000,000', total: '7,095,020', roi: '236%', irr: '28%', color: 'border-blue-200 bg-blue-50' },
                { tier: 'Standard', invest: '5,000,000', total: '14,039,092', roi: '281%', irr: '32%', color: 'border-primary bg-primary-50' },
                { tier: 'Premium', invest: '8,000,000', total: '26,180,631', roi: '327%', irr: '35%', color: 'border-amber-200 bg-amber-50' },
              ].map((t, i) => (
                <div key={i} className={`border-2 rounded-xl p-6 ${t.color}`} data-testid={`roi-card-${t.tier.toLowerCase()}`}>
                  <p className="text-sm font-semibold text-slate-700">{t.tier} Model</p>
                  <div className="mt-3 space-y-2">
                    <div><p className="text-xs text-slate-500">Investment</p><p className="font-heading font-bold text-slate-900">{t.invest} AED</p></div>
                    <div><p className="text-xs text-slate-500">Total Return (5Yr + Exit)</p><p className="font-heading font-bold text-emerald-700">{t.total} AED</p></div>
                    <div className="flex gap-4 pt-2 border-t border-black/10">
                      <div><p className="text-xs text-slate-500">5-Year ROI</p><p className="font-bold text-primary">{t.roi}</p></div>
                      <div><p className="text-xs text-slate-500">5-Year IRR</p><p className="font-bold text-primary">{t.irr}</p></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sensitivity */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b"><h3 className="font-heading font-semibold text-slate-900">Sensitivity Analysis</h3></div>
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                <div className="p-5">
                  <p className="text-sm font-medium text-red-600 mb-3">If patient volumes drop 15%</p>
                  <div className="space-y-2 text-sm">
                    {[['Basic', '455,000 AED EBITDA', '9% ROI'],['Standard', '1,020,000 AED EBITDA', '12% ROI'],['Premium', '2,050,000 AED EBITDA', '15% ROI']].map(([t,e,r], i) => (
                      <div key={i} className="flex justify-between"><span className="text-slate-600 text-xs">{t}</span><span className="text-xs">{e} | <span className="font-medium">{r}</span></span></div>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm font-medium text-emerald-600 mb-3">If patient volumes increase 15%</p>
                  <div className="space-y-2 text-sm">
                    {[['Basic', '895,000 AED EBITDA', '18% ROI'],['Standard', '1,730,000 AED EBITDA', '22% ROI'],['Premium', '3,100,000 AED EBITDA', '25% ROI']].map(([t,e,r], i) => (
                      <div key={i} className="flex justify-between"><span className="text-slate-600 text-xs">{t}</span><span className="text-xs">{e} | <span className="font-medium">{r}</span></span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            <div className="bg-surface border border-slate-100 rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-3">Key Assumptions</h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                {[
                  '26 working days per month', 'Insurance panel integrated from launch',
                  'Corporate tie-ups active by month 6', 'Teleconsultation revenue included',
                  'Revenue share: 60% doctor / 40% clinic', 'EBITDA margin target: 25-35%',
                  'Exit valuation: 6x EBITDA multiple', '5-year holding period for IRR',
                  'Year 1: 6-month zero revenue stabilization', 'Pharmacy margin: 22% average gross',
                ].map((a, i) => (
                  <p key={i} className="flex items-center gap-2 text-xs"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />{a}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="py-16 bg-slate-900" data-testid="commercials-cta">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">Ready to Explore Further?</h2>
          <p className="text-slate-400 mb-6">Book a confidential consultation to review detailed financial models tailored to your requirements.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/consultation" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md transition-all" data-testid="commercials-consult-btn">Book Consultation <ArrowRight size={18} /></Link>
            <Link to="/register-interest" className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 font-medium px-7 py-3 rounded-full transition-all hover:bg-white/20" data-testid="commercials-register-btn">Register Interest</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
