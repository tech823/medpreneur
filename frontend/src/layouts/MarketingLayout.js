import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, MessageCircle, Phone } from 'lucide-react';
import api from '../api';

const LOGO_COLOR = "https://customer-assets.emergentagent.com/job_c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/artifacts/995ub22h_Color%20Half%20Logo.png";
const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/artifacts/lluhhy77_White%20Half%20Logo.png";

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Career Pathway', path: '/career-pathway' },
  { label: 'Franchise', path: '/franchise-pathway' },
  { label: 'Managed Franchise', path: '/managed-franchise' },
  { label: 'Consultation', path: '/consultation' },
  { label: 'Find My Plan', path: '/planner' },
];

export default function MarketingLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contact, setContact] = useState({ phone_numbers: ['+971 54 539 8962', '+971 50 660 3525'], email: 'info@medpreneur.com', address: 'Dubai, United Arab Emirates' });
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.get('/site-content/contact_info').then(res => {
      if (res.data?.value?.phone_numbers) setContact(res.data.value);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md" data-testid="marketing-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <img src={LOGO_COLOR} alt="MedPreneur" className="h-10 md:h-12" />
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === link.path ? 'text-primary bg-primary-50' : 'text-slate-600 hover:text-primary hover:bg-blue-50'}`} data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/register-interest" className="inline-flex items-center gap-1 bg-primary hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-full shadow-sm transition-all active:scale-95 text-sm" data-testid="register-interest-cta">
                Register Interest <ChevronRight size={16} />
              </Link>
            </div>

            <button className="lg:hidden p-2 text-slate-600 hover:text-primary" onClick={() => setMobileOpen(!mobileOpen)} data-testid="mobile-menu-toggle">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white" data-testid="mobile-nav">
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.pathname === link.path ? 'text-primary bg-primary-50' : 'text-slate-600 hover:text-primary hover:bg-blue-50'}`}>
                  {link.label}
                </Link>
              ))}
              <Link to="/register-interest" onClick={() => setMobileOpen(false)} className="block mt-3 text-center bg-primary hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-full shadow-sm transition-all text-sm">
                Register Interest
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      {/* WhatsApp Floating Widget */}
      <div className="fixed bottom-6 right-6 z-50" data-testid="whatsapp-widget">
        {whatsappOpen && (
          <div className="mb-3 bg-white rounded-2xl shadow-xl border border-slate-200 w-72 overflow-hidden animate-in" data-testid="whatsapp-popup">
            <div className="bg-[#075E54] px-4 py-3">
              <p className="text-white font-heading font-semibold text-sm">MedPreneur Support</p>
              <p className="text-emerald-200 text-xs">Typically replies within minutes</p>
            </div>
            <div className="p-4 bg-[#ECE5DD]">
              <div className="bg-white rounded-lg p-3 shadow-sm text-sm text-slate-700 leading-relaxed">
                Hello! Welcome to MedPreneur. How can we help you with your healthcare journey today?
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 space-y-2">
              {(contact.phone_numbers || []).map((ph, i) => {
                const cleanNum = ph.replace(/[\s+()-]/g, '');
                return (
                  <a key={i} href={`https://wa.me/${cleanNum}?text=Hello%20MedPreneur%2C%20I%20would%20like%20to%20learn%20more%20about%20your%20healthcare%20pathways.`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-lg transition-all text-sm font-medium" data-testid={`whatsapp-number-${i}`}>
                    <MessageCircle size={16} />
                    Chat on {ph}
                  </a>
                );
              })}
              <a href={`tel:${(contact.phone_numbers || [])[0]?.replace(/[\s+()-]/g, '') || ''}`} className="flex items-center gap-3 p-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg transition-all text-sm font-medium" data-testid="call-button">
                <Phone size={16} />
                Call Us Directly
              </a>
            </div>
          </div>
        )}
        <button onClick={() => setWhatsappOpen(!whatsappOpen)} className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${whatsappOpen ? 'bg-slate-700 hover:bg-slate-600' : 'bg-[#25D366] hover:bg-[#20BD5C]'}`} data-testid="whatsapp-toggle">
          {whatsappOpen ? <X size={24} className="text-white" /> : (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300" data-testid="marketing-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <img src={LOGO_WHITE} alt="MedPreneur" className="h-12 mb-4" />
              <p className="text-sm text-slate-400 leading-relaxed">From Medical Degree to Healthcare Asset Ownership. Transforming healthcare professionals into healthcare asset owners.</p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-white mb-4">Pathways</h4>
              <ul className="space-y-2">
                <li><Link to="/career-pathway" className="text-sm text-slate-400 hover:text-white transition-colors">Career Pathway</Link></li>
                <li><Link to="/franchise-pathway" className="text-sm text-slate-400 hover:text-white transition-colors">Franchise Ownership</Link></li>
                <li><Link to="/managed-franchise" className="text-sm text-slate-400 hover:text-white transition-colors">Managed Franchise</Link></li>
                <li><Link to="/franchise-commercials" className="text-sm text-slate-400 hover:text-white transition-colors">Financial Model</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About MedPreneur</Link></li>
                <li><Link to="/consultation" className="text-sm text-slate-400 hover:text-white transition-colors">Book Consultation</Link></li>
                <li><Link to="/register-interest" className="text-sm text-slate-400 hover:text-white transition-colors">Register Interest</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>{contact.address}</li>
                {contact.phone_numbers?.map((ph, i) => <li key={i}>{ph}</li>)}
                <li>{contact.email}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-sm text-slate-500">2026 MedPreneur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
