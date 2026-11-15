import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, FileCheck, BookOpen, Briefcase, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };
const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/images/f24e28cd476dfe35a0e78224fb8a3d9a0de2c37db1574e7f12f1111c715e7198.png";

const stages = [
  { icon: GraduationCap, title: 'Observership', desc: 'Profile assessment, observership placement guidance, documentation readiness, and structured pathway planning for students and fresh graduates.' },
  { icon: FileCheck, title: 'Licensing Preparation', desc: 'Eligibility confirmation, DataFlow verification guidance, exam preparation roadmap, study resources, and booking coordination.' },
  { icon: BookOpen, title: 'Exam Preparation', desc: 'Comprehensive exam preparation support with study materials, mock tests, and structured preparation timelines.' },
  { icon: Briefcase, title: 'Employment Placement', desc: 'UAE visit visa guidance, accommodation support, job application management, and interview facilitation.' },
  { icon: TrendingUp, title: 'Career Advancement', desc: 'Professional development, specialization support, leadership opportunities, and pathway to franchise ownership.' },
];

export default function CareerPathway() {
  const [packages, setPackages] = useState([]);
  const [heroQuote, setHeroQuote] = useState('Launch Your Healthcare Career in the UAE');

  useEffect(() => {
    api.get('/packages?pathway=career').then(res => setPackages(res.data.packages || [])).catch(() => {});
    api.get('/site-content/hero_images').then(res => {
      if (res.data?.value?.career?.quote) setHeroQuote(res.data.value.career.quote);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-white" data-testid="career-hero">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={fadeUp} className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Career Pathway</motion.p>
              <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">{heroQuote}</motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-600 leading-relaxed">A structured pathway from licensing to employment and beyond. MedPreneur supports healthcare professionals at every stage of their UAE career journey.</motion.p>
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-4">
                <Link to="/register-interest" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md transition-all active:scale-95" data-testid="career-register-btn">Start Your Journey <ArrowRight size={18} /></Link>
                <Link to="/consultation" className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium px-7 py-3 rounded-full transition-all" data-testid="career-consult-btn">Free Career Consultation</Link>
              </motion.div>
            </motion.div>
            <div className="hidden lg:block"><div className="rounded-2xl overflow-hidden shadow-xl"><img src={HERO_IMG} alt="Healthcare Career Training" className="w-full h-[380px] object-cover" /></div></div>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="py-16 bg-surface" data-testid="career-audience">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6 text-center">Who Is This Pathway For?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Doctors', 'Dentists', 'Pharmacists', 'Allied Health Professionals', 'Healthcare Managers'].map((p, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 text-center shadow-card"><p className="font-heading font-semibold text-slate-900 text-sm">{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Journey - Milestone Roadmap */}
      <section className="py-20 bg-white" data-testid="career-stages">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Your Progression Path</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Career Journey Roadmap</h2>
            <p className="text-slate-600 mt-2">A structured milestone-based progression from student to healthcare professional</p>
          </div>
          {/* Roadmap */}
          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20 -translate-x-1/2" />
            <div className="space-y-8 md:space-y-0">
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                const isLeft = i % 2 === 0;
                return (
                  <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className={`relative md:flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} md:py-6`} data-testid={`career-stage-${i}`}>
                    {/* Content */}
                    <div className={`md:w-5/12 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div className={`bg-white rounded-xl p-6 border-2 border-slate-100 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all`}>
                        <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
                          <span className="text-xs font-bold text-white bg-primary px-2.5 py-0.5 rounded-full">Stage {i + 1}</span>
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">{stage.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{stage.desc}</p>
                      </div>
                    </div>
                    {/* Center node */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-primary shadow-lg items-center justify-center z-10">
                      <Icon size={20} className="text-primary" />
                    </div>
                    {/* Spacer for other side */}
                    <div className="md:w-5/12" />
                  </motion.div>
                );
              })}
            </div>
            {/* End marker */}
            <div className="hidden md:flex justify-center pt-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><TrendingUp size={14} className="text-white" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages with Dynamic Pricing */}
      <section className="py-20 bg-surface" data-testid="career-packages">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Career Packages</h2>
            <p className="text-slate-600 mt-2">Structured packages to support your healthcare career at every stage</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <div key={pkg.package_id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow" data-testid={`career-package-${i}`}>
                <div className="bg-primary-50 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold text-slate-900">{pkg.package_name}</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-3xl font-heading font-bold text-slate-900">{pkg.price > 0 ? pkg.price.toLocaleString() : 'Free'}</span>
                    {pkg.price > 0 && <span className="text-sm text-slate-500 ml-1">{pkg.currency}</span>}
                  </div>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">{pkg.description}</p>
                  <ul className="space-y-2.5">
                    {(pkg.features || []).map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle size={16} className="text-primary flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Link to="/register-interest" className="mt-6 block text-center bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-full transition-all text-sm" data-testid={`package-cta-${i}`}>
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
            {packages.length === 0 && (
              <div className="col-span-3 text-center py-8 text-slate-400">Loading packages...</div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900" data-testid="career-cta">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">Start Your Healthcare Career Today</h2>
          <p className="text-slate-400 mb-6">Register your interest and our team will guide you through the right career pathway.</p>
          <Link to="/register-interest" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md transition-all" data-testid="career-cta-btn">Register Interest <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
