import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Building2, TrendingUp, ArrowRight, CheckCircle, Users, Globe, Shield, Star, Play, Quote, Compass, BarChart3 } from 'lucide-react';
import api from '../../api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/images/a6b097d9311215235b5aaeda6af2e3b7f2d7a98be8a25fc3449a6ab593c306c3.png";

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  // youtube.com/watch?v=ID
  const match1 = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match1) return `https://www.youtube.com/embed/${match1[1]}`;
  // Already embed format
  if (url.includes('youtube.com/embed/')) return url;
  // Direct video file
  if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv)(\?|$)/i)) return url;
  return url;
}

const pathways = [
  { icon: Stethoscope, title: 'Career Pathway', desc: 'Structured career development from licensing to employment in the UAE healthcare sector.', link: '/career-pathway', color: 'bg-blue-50 text-primary' },
  { icon: Building2, title: 'Franchise Pathway', desc: 'Own and operate your healthcare clinic with full operational support and proven systems.', link: '/franchise-pathway', color: 'bg-emerald-50 text-emerald-600' },
  { icon: TrendingUp, title: 'Managed Franchise', desc: 'Participate in managed healthcare franchise assets with structured returns and professional oversight.', link: '/managed-franchise', color: 'bg-amber-50 text-amber-600' },
];

function TestimonialCarousel({ testimonials }) {
  const [activeVideo, setActiveVideo] = useState(0);
  const [activeWritten, setActiveWritten] = useState(0);
  const vids = testimonials.video_testimonials || [];
  const writs = testimonials.written_testimonials || [];

  // Auto-rotate written testimonials only (NOT video)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWritten(prev => (prev + 1) % Math.max(writs.length, 1));
    }, 8000);
    return () => clearInterval(timer);
  }, [writs.length]);

  const currentVid = vids[activeVideo];
  const currentWrit = writs[activeWritten];

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-stretch" data-testid="testimonial-carousel">
      {/* Video Side */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-primary/30 min-h-[360px] flex flex-col justify-end shadow-xl" data-testid="video-testimonials">
        {currentVid?.video_url ? (
          getYouTubeEmbedUrl(currentVid.video_url)?.includes('youtube.com/embed/') ? (
            <iframe src={getYouTubeEmbedUrl(currentVid.video_url)} className="absolute inset-0 w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={currentVid.name} />
          ) : (
            <video src={currentVid.video_url} className="absolute inset-0 w-full h-full object-cover" controls />
          )
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><Play size={28} className="text-white ml-1" /></div>
            </div>
          </>
        )}
        {currentVid && (
          <div className="relative z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
            {currentVid.quote && <p className="text-white/80 text-sm italic leading-relaxed mb-3">"{currentVid.quote}"</p>}
            <div className="border-t border-white/20 pt-3">
              <p className="text-white font-heading font-semibold text-sm">{currentVid.name}</p>
              <p className="text-white/60 text-xs">{currentVid.role}</p>
            </div>
          </div>
        )}
        {/* Manual Navigation Arrows + Dots */}
        {vids.length > 1 && (
          <div className="relative z-10 flex items-center gap-3 mt-4 p-2">
            <button onClick={() => setActiveVideo(prev => (prev - 1 + vids.length) % vids.length)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all" data-testid="video-prev">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="flex gap-1.5">
              {vids.map((_, i) => (
                <button key={i} onClick={() => setActiveVideo(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeVideo ? 'bg-white w-6' : 'bg-white/40'}`} />
              ))}
            </div>
            <button onClick={() => setActiveVideo(prev => (prev + 1) % vids.length)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all" data-testid="video-next">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Written Side */}
      <div className="flex flex-col justify-center" data-testid="written-testimonials">
        {currentWrit && (
          <div className="transition-all duration-500">
            <Quote size={40} className="text-primary/15 mb-4" />
            <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-heading font-medium mb-6" data-testid={`written-testimonial-${activeWritten}`}>
              "{currentWrit.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                <span className="text-primary font-heading font-bold text-sm">{currentWrit.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <div>
                <p className="font-heading font-semibold text-slate-900">{currentWrit.name}</p>
                <p className="text-sm text-slate-500">{currentWrit.role}</p>
              </div>
              {currentWrit.rating && (
                <div className="flex gap-0.5 ml-auto">{Array.from({ length: currentWrit.rating }).map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}</div>
              )}
            </div>
          </div>
        )}
        {/* Dots */}
        {writs.length > 1 && (
          <div className="flex gap-1.5 mt-6">
            {writs.map((_, i) => (
              <button key={i} onClick={() => setActiveWritten(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeWritten ? 'bg-primary w-6' : 'bg-slate-300'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [testimonials, setTestimonials] = useState({ video_testimonials: [], written_testimonials: [] });
  const [heroContent, setHeroContent] = useState({});

  useEffect(() => {
    api.get('/site-content/testimonials').then(res => {
      if (res.data?.value) setTestimonials(res.data.value);
    }).catch(() => {});
    api.get('/site-content/hero_images').then(res => {
      if (res.data?.value) setHeroContent(res.data.value);
    }).catch(() => {});
  }, []);

  const heroQuote = heroContent?.homepage?.quote || 'From Medical Degree to Healthcare Asset Ownership';

  return (
    <div>
      {/* Hero Section with Image */}
      <section className="relative overflow-hidden bg-white" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={fadeUp} className="text-primary font-semibold text-sm tracking-wider uppercase mb-4">Healthcare Venture Platform</motion.p>
              <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-slate-900 tracking-tight leading-tight">
                {heroQuote.includes('Asset Ownership') ? (
                  <>{heroQuote.split('Asset Ownership')[0]}<span className="text-primary">Asset Ownership</span></>
                ) : heroQuote}
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-600 leading-relaxed">
                MedPreneur transforms healthcare professionals and investors into healthcare asset owners through structured career, franchise, and managed franchise pathways in the UAE.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-4">
                <Link to="/register-interest" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95" data-testid="hero-register-btn">
                  Register Your Interest <ArrowRight size={18} />
                </Link>
                <Link to="/consultation" className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium px-7 py-3 rounded-full transition-all" data-testid="hero-consultation-btn">
                  Book Consultation
                </Link>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block relative h-[420px]">
              {/* Floating cards with blue wire connections - NO white rectangle */}
              <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 500 420">
                <path d="M 130 80 Q 250 40 370 100" fill="none" stroke="#6495ED" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                <path d="M 100 200 Q 250 160 400 220" fill="none" stroke="#6495ED" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
                <path d="M 150 320 Q 300 280 420 340" fill="none" stroke="#6495ED" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
                <path d="M 200 60 Q 220 180 180 320" fill="none" stroke="#6495ED" strokeWidth="1" strokeDasharray="3 5" opacity="0.2" />
                <path d="M 350 80 Q 380 200 340 350" fill="none" stroke="#6495ED" strokeWidth="1" strokeDasharray="3 5" opacity="0.2" />
                <circle cx="130" cy="80" r="3" fill="#6495ED" opacity="0.5" />
                <circle cx="370" cy="100" r="3" fill="#6495ED" opacity="0.5" />
                <circle cx="100" cy="200" r="3" fill="#6495ED" opacity="0.5" />
                <circle cx="400" cy="220" r="3" fill="#6495ED" opacity="0.5" />
                <circle cx="250" cy="150" r="4" fill="#6495ED" opacity="0.6" />
              </svg>
              {/* Floating cards */}
              <div className="absolute top-2 left-4 w-44 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-slate-100/50 transform rotate-[-3deg] z-10 hover:scale-105 transition-transform">
                <div className="w-full h-20 rounded-lg bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center mb-2"><BarChart3 size={28} className="text-primary" /></div>
                <p className="text-[10px] font-semibold text-slate-800">Revenue Dashboard</p>
                <p className="text-[8px] text-slate-400">Real-time analytics</p>
              </div>
              <div className="absolute top-8 right-8 w-40 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-slate-100/50 transform rotate-[4deg] z-10 hover:scale-105 transition-transform">
                <div className="w-full h-20 rounded-lg overflow-hidden mb-2"><img src="https://images.pexels.com/photos/8376318/pexels-photo-8376318.jpeg?auto=compress&w=300" alt="Clinic" className="w-full h-full object-cover" /></div>
                <p className="text-[10px] font-semibold text-slate-800">Modern Polyclinic</p>
                <p className="text-[8px] text-slate-400">Premium healthcare</p>
              </div>
              <div className="absolute top-[170px] left-12 w-48 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-slate-100/50 transform rotate-[2deg] z-10 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-1"><div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"><TrendingUp size={12} className="text-emerald-600" /></div><span className="text-[10px] font-bold text-emerald-600">+327% ROI</span></div>
                <p className="text-[10px] font-semibold text-slate-800">Investment Returns</p>
                <p className="text-[8px] text-slate-400">5-year projected</p>
              </div>
              <div className="absolute top-[180px] right-4 w-44 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-slate-100/50 transform rotate-[-2deg] z-10 hover:scale-105 transition-transform">
                <div className="w-full h-20 rounded-lg overflow-hidden mb-2"><img src="https://images.unsplash.com/photo-1607368386669-d940ce438fba?w=300" alt="Medical" className="w-full h-full object-cover" /></div>
                <p className="text-[10px] font-semibold text-slate-800">Healthcare Assets</p>
                <p className="text-[8px] text-slate-400">Clinic ownership</p>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-52 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-primary/20 z-10 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Shield size={14} className="text-primary" /></div>
                <div><p className="text-[10px] font-bold text-slate-800">MedPreneur Operating System</p><p className="text-[8px] text-slate-400">Insurance, SOPs, Marketing, Governance</p></div></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[{ value: '3', label: 'Pathways' }, { value: 'UAE', label: 'Market Focus' }, { value: '25%+', label: 'Target ROI' }, { value: '100%', label: 'Fully Managed' }].map((stat, i) => (
              <div key={i} className="text-center"><p className="text-2xl md:text-3xl font-heading font-bold text-white">{stat.value}</p><p className="text-sm text-slate-400 mt-1">{stat.label}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Pathways */}
      <section className="py-20 md:py-24 bg-white" data-testid="pathways-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Three Journeys</motion.p>
            <motion.h2 variants={fadeUp} className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Choose Your Healthcare Journey</motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Whether you are a healthcare professional seeking career growth or an investor looking for managed healthcare franchise assets, MedPreneur has a structured pathway for you.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {pathways.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={i} variants={fadeUp}>
                  <Link to={p.link} className="block group" data-testid={`pathway-card-${i}`}>
                    <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${p.color} mb-5`}><Icon size={24} /></div>
                      <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3 group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed flex-1">{p.desc}</p>
                      <div className="mt-5 flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">Learn More <ArrowRight size={16} /></div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24 bg-surface" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Simple Process</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">How MedPreneur Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register Interest', desc: 'Submit your profile and tell us about your healthcare goals and preferred pathway.' },
              { step: '02', title: 'Book Consultation', desc: 'Schedule a personalized session with our healthcare venture advisors.' },
              { step: '03', title: 'Select Pathway', desc: 'Choose between career development, franchise ownership, or managed franchise.' },
              { step: '04', title: 'Begin Journey', desc: 'Start your structured pathway towards healthcare asset ownership.' },
            ].map((item, i) => (
              <div key={i} className="relative" data-testid={`step-${i}`}>
                <div className="text-5xl font-heading font-bold text-primary/10 mb-3">{item.step}</div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-24 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Platform Advantage</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">A Complete Healthcare Operating System</h2>
              <p className="text-slate-600 leading-relaxed mb-8">MedPreneur provides infrastructure, not consultancy. Our platform connects licensing, employment, franchise ownership, and managed franchise through a unified operating system.</p>
              <div className="space-y-4">
                {['Regulatory enablement and licensing support', 'Insurance revenue cycle management', 'Clinical SOP framework and governance', 'Marketing engine and patient acquisition', 'Real-time governance dashboards', 'Multi-outlet replication playbook'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3"><CheckCircle size={20} className="text-primary mt-0.5 flex-shrink-0" /><p className="text-slate-700 text-sm">{item}</p></div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 lg:p-10">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: 'Professionals', val: 'Doctors, Dentists, Pharmacists' },
                  { icon: TrendingUp, label: 'Investment Tiers', val: '3M - 8M AED' },
                  { icon: Building2, label: 'Clinic Models', val: 'Basic, Standard, Premium' },
                  { icon: Globe, label: 'Market', val: 'UAE Healthcare' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-card">
                      <Icon size={20} className="text-primary mb-2" /><p className="text-xs text-slate-500 mb-1">{item.label}</p><p className="text-sm font-semibold text-slate-900">{item.val}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Carousel Style */}
      <section className="py-20 md:py-24 bg-surface" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Success Stories</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">What Our Community Says</h2>
          </div>
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* AI Planner CTA */}
      <section className="py-16 bg-white" data-testid="planner-cta-section">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-primary/10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Compass size={28} className="text-primary" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3">Not Sure Which Pathway is Right for You?</h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">Answer 5 quick questions and get a personalized feasibility report with your recommended journey, clinic tier, ROI projections, and next steps.</p>
            <Link to="/planner" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-full shadow-md transition-all" data-testid="planner-cta-btn">
              Find My Plan <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 bg-slate-900" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Ready to Start Your Healthcare Journey?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">Join healthcare professionals and investors who are building the future of outpatient healthcare in the UAE through MedPreneur.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register-interest" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-7 py-3 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95" data-testid="cta-register-btn">Register Your Interest <ArrowRight size={18} /></Link>
            <Link to="/consultation" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-7 py-3 rounded-full transition-all" data-testid="cta-consultation-btn">Book Free Consultation</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
