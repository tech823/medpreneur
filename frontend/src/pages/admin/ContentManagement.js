import React, { useState, useEffect } from 'react';
import { Save, Plus, X, Edit2, Image, Video, MessageSquare, Phone, FileText } from 'lucide-react';
import api from '../../api';

export default function ContentManagement() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [success, setSuccess] = useState('');
  const [writtenForm, setWrittenForm] = useState({ name: '', role: '', quote: '', rating: 5 });
  const [videoForm, setVideoForm] = useState({ name: '', role: '', quote: '', video_url: '' });

  useEffect(() => {
    api.get('/admin/site-content').then(res => { setContent(res.data.content || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const saveContent = async (key, value) => {
    setSaving(key);
    try {
      await api.put('/admin/site-content', { content_key: key, value });
      setSuccess(`${key} updated`);
      setTimeout(() => setSuccess(''), 3000);
      const res = await api.get('/admin/site-content');
      setContent(res.data.content || {});
    } catch (e) { alert('Error saving'); }
    setSaving('');
  };

  const contactInfo = content.contact_info || { phone_numbers: [], email: '', address: '' };
  const heroImages = content.hero_images || {};
  const testimonials = content.testimonials || { video_testimonials: [], written_testimonials: [] };

  const updateContact = (field, value) => {
    const updated = { ...contactInfo, [field]: value };
    saveContent('contact_info', updated);
  };

  const addWrittenTestimonial = () => {
    if (!writtenForm.name || !writtenForm.quote) return;
    const updated = { ...testimonials, written_testimonials: [...(testimonials.written_testimonials || []), { ...writtenForm }] };
    saveContent('testimonials', updated);
    setWrittenForm({ name: '', role: '', quote: '', rating: 5 });
  };

  const removeWrittenTestimonial = (idx) => {
    const updated = { ...testimonials, written_testimonials: (testimonials.written_testimonials || []).filter((_, i) => i !== idx) };
    saveContent('testimonials', updated);
  };

  const addVideoTestimonial = () => {
    if (!videoForm.name) return;
    const updated = { ...testimonials, video_testimonials: [...(testimonials.video_testimonials || []), { name: videoForm.name, role: videoForm.role, quote: videoForm.quote || '', video_url: videoForm.video_url || '', thumbnail: '' }] };
    saveContent('testimonials', updated);
    setVideoForm({ name: '', role: '', quote: '', video_url: '' });
  };

  const removeVideoTestimonial = (idx) => {
    const updated = { ...testimonials, video_testimonials: (testimonials.video_testimonials || []).filter((_, i) => i !== idx) };
    saveContent('testimonials', updated);
  };

  const updateHeroQuote = (page, quote) => {
    const updated = { ...heroImages, [page]: { ...(heroImages[page] || {}), quote } };
    saveContent('hero_images', updated);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div data-testid="content-management">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Content Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage dynamic website content - testimonials, contact info, hero sections</p>
      </div>
      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-lg">{success}</div>}

      <div className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="content-contact">
          <div className="flex items-center gap-2 mb-4"><Phone size={18} className="text-primary" /><h3 className="font-heading font-semibold text-slate-900">Contact Information</h3></div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Numbers (one per line)</label>
              <textarea value={(contactInfo.phone_numbers || []).join('\n')} onChange={e => updateContact('phone_numbers', e.target.value.split('\n').filter(Boolean))} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" rows={3} data-testid="contact-phones" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={contactInfo.email || ''} onChange={e => updateContact('email', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" data-testid="contact-email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input type="text" value={contactInfo.address || ''} onChange={e => updateContact('address', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" data-testid="contact-address" />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Quotes */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="content-heroes">
          <div className="flex items-center gap-2 mb-4"><Image size={18} className="text-primary" /><h3 className="font-heading font-semibold text-slate-900">Hero Section Quotes</h3></div>
          <div className="space-y-3">
            {['homepage', 'career', 'franchise', 'managed_franchise', 'about', 'consultation'].map(page => (
              <div key={page}>
                <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">{page.replace('_', ' ')} Page</label>
                <input type="text" value={heroImages[page]?.quote || ''} onChange={e => updateHeroQuote(page, e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder={`Quote for ${page} hero...`} data-testid={`hero-quote-${page}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Written Testimonials */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="content-written-testimonials">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><MessageSquare size={18} className="text-primary" /><h3 className="font-heading font-semibold text-slate-900">Written Testimonials</h3></div>
            <span className="text-xs text-slate-500">{(testimonials.written_testimonials || []).length} testimonials</span>
          </div>
          <div className="space-y-3 mb-4">
            {(testimonials.written_testimonials || []).map((t, i) => (
              <div key={i} className="p-3 bg-surface rounded-lg border border-slate-100 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="text-xs text-slate-600 mt-1 italic">"{t.quote?.slice(0, 100)}..."</p>
                </div>
                <button onClick={() => removeWrittenTestimonial(i)} className="p-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <p className="text-xs font-medium text-slate-500">Add Written Testimonial</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={writtenForm.name} onChange={e => setWrittenForm({...writtenForm, name: e.target.value})} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Name" data-testid="testimonial-name" />
              <input value={writtenForm.role} onChange={e => setWrittenForm({...writtenForm, role: e.target.value})} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Role" data-testid="testimonial-role" />
            </div>
            <textarea value={writtenForm.quote} onChange={e => setWrittenForm({...writtenForm, quote: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Testimonial quote..." data-testid="testimonial-quote" />
            <button onClick={addWrittenTestimonial} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium" data-testid="add-written-testimonial"><Plus size={14} className="inline mr-1" />Add</button>
          </div>
        </div>

        {/* Video Testimonials */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="content-video-testimonials">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Video size={18} className="text-primary" /><h3 className="font-heading font-semibold text-slate-900">Video Testimonials</h3></div>
            <span className="text-xs text-slate-500">{(testimonials.video_testimonials || []).length} videos</span>
          </div>
          <div className="space-y-3 mb-4">
            {(testimonials.video_testimonials || []).map((v, i) => (
              <div key={i} className="p-3 bg-surface rounded-lg border border-slate-100 flex items-start justify-between gap-3">
                <div><p className="text-sm font-medium text-slate-900">{v.name}</p><p className="text-xs text-slate-500">{v.role}</p></div>
                <button onClick={() => removeVideoTestimonial(i)} className="p-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <p className="text-xs font-medium text-slate-500">Add Video Testimonial</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={videoForm.name} onChange={e => setVideoForm({...videoForm, name: e.target.value})} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Name" data-testid="video-name" />
              <input value={videoForm.role} onChange={e => setVideoForm({...videoForm, role: e.target.value})} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Role" data-testid="video-role" />
            </div>
            <input value={videoForm.video_url} onChange={e => setVideoForm({...videoForm, video_url: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Video URL (MP4, YouTube, or hosted link)" data-testid="video-url" />
            <textarea value={videoForm.quote} onChange={e => setVideoForm({...videoForm, quote: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Quote..." data-testid="video-quote" />
            <button onClick={addVideoTestimonial} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium" data-testid="add-video-testimonial"><Plus size={14} className="inline mr-1" />Add Video</button>
          </div>
        </div>
      </div>
    </div>
  );
}
