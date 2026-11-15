import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Users, Globe, Shield, Lightbulb, TrendingUp, Building2, Stethoscope, ArrowRight, CheckCircle, BarChart3, Zap } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/images/32a1ac746a583fed1dd07c77287cd5c92ce2b4eeb967ca63707c2daf09c69a8a.png";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white" data-testid="about-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={fadeUp} className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">About MedPreneur</motion.p>
              <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Turning Medical Expertise Into Scalable Ventures</motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-600 leading-relaxed">MedPreneur is a global healthcare franchise operating system designed to enable medical professionals to transition from licensing to asset ownership, and to allow investors to deploy capital into managed outpatient healthcare infrastructure in the UAE.</motion.p>
            </motion.div>
            <div className="hidden lg:block"><div className="rounded-2xl overflow-hidden shadow-xl"><img src={HERO_IMG} alt="MedPreneur Team" className="w-full h-[380px] object-cover" /></div></div>
          </div>
        </div>
      </section>

      {/* UAE Market Stats */}
      <section className="bg-slate-900 py-10" data-testid="about-stats">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: 'USD 39B+', label: 'UAE Healthcare Market by 2028' },
              { val: '85%+', label: 'Insurance Penetration (Dubai/AD)' },
              { val: '4,000+', label: 'Private Clinics & Growing' },
              { val: '25%+', label: 'Target Investor ROI Annually' },
            ].map((s, i) => (
              <div key={i}><p className="text-2xl md:text-3xl font-heading font-bold text-white">{s.val}</p><p className="text-xs text-slate-400 mt-1">{s.label}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white" data-testid="about-mission">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 border border-primary/10">
              <Target size={28} className="text-primary mb-4" />
              <h3 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">To integrate talent, technology, insurance, and capital into one unified ecosystem. We enable medical professionals to move from salary dependency to equity participation, and enable investors to deploy capital into structured, managed healthcare infrastructure.</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
              <Lightbulb size={28} className="text-amber-600 mb-4" />
              <h3 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">To become the leading healthcare career and venture platform in the Middle East. We are building a connected network of healthcare assets - not individual clinics - powered by a unified operating system that connects licensing, employment, franchise ownership, and managed investment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Operating System */}
      <section className="py-20 bg-surface" data-testid="about-system">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Infrastructure, Not Consultancy</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">The MedPreneur Operating System</h2>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">A unified ecosystem that standardizes execution in healthcare - from licensing to multi-outlet operations.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Stethoscope, title: 'Clinical SOPs', desc: 'Standardized clinical and operational procedures across all clinics' },
              { icon: Shield, title: 'Insurance Integration', desc: 'Panel onboarding, claims workflow, and revenue cycle management from day one' },
              { icon: BarChart3, title: 'HealthRails Platform', desc: 'Practice management, dashboards, billing, EMR, and performance analytics' },
              { icon: TrendingUp, title: 'Marketing Engine', desc: 'Central marketing campaigns, patient app, corporate contracts, and referral network' },
              { icon: Users, title: 'Talent Funnel', desc: 'Cross-border talent pipeline from Pakistan, India, and Bangladesh into UAE healthcare' },
              { icon: Building2, title: 'Vendor Leverage', desc: 'Centralized procurement, supplier contracts, and equipment sourcing' },
              { icon: Globe, title: 'Governance Dashboards', desc: 'Real-time financial performance, KPIs, compliance, and operational oversight' },
              { icon: Zap, title: 'Replication Playbook', desc: 'Proven model for scaling from single clinic to multi-outlet network' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-3"><Icon size={20} className="text-primary" /></div>
                  <h3 className="font-heading font-semibold text-slate-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Three Journeys Flow */}
      <section className="py-20 bg-white" data-testid="about-journeys">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Three Structured Journeys</h2>
          </div>
          <div className="relative">
            {/* Connecting arrows */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-amber-200 -translate-y-1/2 z-0" />
            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {[
                { num: '01', title: 'Career Pathway', desc: 'For healthcare professionals seeking licensing, employment, and career development in the UAE. From observership to employment placement.', color: 'border-blue-200 bg-blue-50', accent: 'text-blue-600', link: '/career-pathway', audience: 'Students, Graduates, Doctors, Dentists, Pharmacists' },
                { num: '02', title: 'Franchise Pathway', desc: 'For professionals who want to OWN and OPERATE healthcare clinics. Full, co-franchise, or slot ownership with MedPreneur operating system support.', color: 'border-emerald-200 bg-emerald-50', accent: 'text-emerald-600', link: '/franchise-pathway', audience: 'Doctors, Dentists, Pharmacists, Healthcare Managers' },
                { num: '03', title: 'Managed Franchise', desc: 'For investors who want MedPreneur to MANAGE healthcare assets. Deploy capital into structured polyclinics with 60/40 profit share and governance dashboards.', color: 'border-amber-200 bg-amber-50', accent: 'text-amber-600', link: '/managed-franchise', audience: 'Family Offices, Strategic Investors, Business Groups' },
              ].map((j, i) => (
                <Link key={i} to={j.link} className="group">
                  <div className={`border-2 ${j.color} rounded-2xl p-7 h-full transition-shadow hover:shadow-lg bg-white`}>
                    <span className={`text-4xl font-heading font-bold ${j.accent} opacity-20`}>{j.num}</span>
                    <h3 className={`font-heading text-xl font-semibold text-slate-900 mt-2 mb-2 group-hover:${j.accent} transition-colors`}>{j.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{j.desc}</p>
                    <p className="text-xs text-slate-400"><span className="font-medium text-slate-500">For:</span> {j.audience}</p>
                    <div className={`mt-4 flex items-center gap-1 ${j.accent} text-sm font-medium group-hover:gap-2 transition-all`}>Explore <ArrowRight size={14} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why MedPreneur - Problems Solved */}
      <section className="py-20 bg-surface" data-testid="about-why">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">The Problem We Solve</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Why Healthcare Needs MedPreneur</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: 'Salary Dependency', desc: 'Healthcare professionals earn well but remain salary-dependent with no equity participation or asset building pathway.' },
              { title: 'No Ownership Path', desc: 'The healthcare industry lacks structured pathways for professionals to transition from practitioners to healthcare asset owners.' },
              { title: 'Execution Gap for Investors', desc: 'Healthcare investors face operator dependency, inconsistent management, and lack of standardized execution and reporting.' },
              { title: 'Complex Regulatory Landscape', desc: 'Navigating licensing, insurance panels, and compliance across the UAE requires specialized infrastructure that individual operators lack.' },
              { title: 'Fragmented Operations', desc: 'Independent clinics struggle with marketing, insurance claims, vendor management, and patient acquisition without centralized systems.' },
              { title: 'No Replication Model', desc: 'Growing from one clinic to a multi-outlet network requires an operating system that most healthcare entrepreneurs do not have.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-card">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-3"><span className="text-red-500 text-xs font-bold">{i + 1}</span></div>
                <h3 className="font-heading font-semibold text-slate-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Edge */}
      <section className="py-20 bg-white" data-testid="about-differentiators">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Competitive Edge</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">A Network Strategy, Not a Single Clinic Strategy</h2>
              <p className="text-slate-600 leading-relaxed mb-6">MedPreneur is not a licensing consultant, a recruitment agency, or a generic franchise. We provide the complete infrastructure stack that transforms individual healthcare ambitions into scalable, network-connected healthcare ventures.</p>
              <div className="space-y-3">
                {[
                  'End-to-end pathway from student to asset owner',
                  'Franchise operating system with HealthRails technology',
                  'Insurance integrated infrastructure from day one',
                  'Cross-border talent funnel (India, Pakistan, Bangladesh)',
                  'Centralized marketing engine and patient acquisition',
                  'Standardized clinical and operational SOPs',
                  'Replicable model for multi-outlet growth',
                  'Real-time governance and performance dashboards',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3"><CheckCircle size={16} className="text-primary flex-shrink-0" /><p className="text-sm text-slate-700">{item}</p></div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
              <h3 className="font-heading text-xl font-semibold mb-6">MedPreneur vs Traditional</h3>
              <div className="space-y-4">
                {[
                  ['Licensing Consultant', 'Licensing only', 'Licensing + Employment + Ownership + Investment'],
                  ['Recruitment Agency', 'Job placement', 'Career pathway to asset ownership'],
                  ['Independent Setup', 'DIY everything', 'Complete operating system with governance'],
                  ['Generic Franchise', 'Brand + space', 'Brand + Tech + Insurance + Marketing + SOPs + Replication'],
                ].map(([vs, their, ours], i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">vs {vs}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-red-300">They: {their}</div>
                      <div className="text-emerald-300">We: {ours}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary" data-testid="about-cta">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">Let's Build the Future of Outpatient Healthcare Together</h2>
          <p className="text-blue-100 mb-6">Whether you are a healthcare professional or an investor, we have a structured pathway designed for you.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register-interest" className="inline-flex items-center gap-2 bg-white text-primary font-medium px-7 py-3 rounded-full shadow-md hover:shadow-lg transition-all" data-testid="about-cta-btn">Get Started Today</Link>
            <Link to="/planner" className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 font-medium px-7 py-3 rounded-full transition-all hover:bg-white/20">Find My Plan</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
