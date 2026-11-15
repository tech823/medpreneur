import React, { useState, useEffect } from 'react';
import { Save, Plus, X } from 'lucide-react';
import api from '../../api';

export default function SystemConfig() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [newProfession, setNewProfession] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newSpecialty, setNewSpecialty] = useState({ profession: '', specialty: '' });

  useEffect(() => {
    api.get('/admin/config').then(res => { setConfig(res.data.config || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (field, value) => {
    setSaving(true);
    try {
      await api.patch('/admin/config', { [field]: value });
      setSuccess(`${field} updated successfully`);
      setTimeout(() => setSuccess(''), 3000);
      const res = await api.get('/admin/config');
      setConfig(res.data.config || {});
    } catch (e) { alert(e.response?.data?.detail || 'Error saving'); }
    setSaving(false);
  };

  const addProfession = () => {
    if (!newProfession.trim()) return;
    const professions = [...(config.professions || []), newProfession.trim()];
    handleSave('professions', professions);
    setNewProfession('');
  };

  const removeProfession = (p) => {
    const professions = (config.professions || []).filter(x => x !== p);
    handleSave('professions', professions);
  };

  const addCountry = () => {
    if (!newCountry.trim()) return;
    const countries = [...(config.countries || []), newCountry.trim()];
    handleSave('countries', countries);
    setNewCountry('');
  };

  const removeCountry = (c) => {
    const countries = (config.countries || []).filter(x => x !== c);
    handleSave('countries', countries);
  };

  const addSpecialty = () => {
    if (!newSpecialty.profession || !newSpecialty.specialty.trim()) return;
    const specialties = { ...(config.specialties || {}) };
    if (!specialties[newSpecialty.profession]) specialties[newSpecialty.profession] = [];
    specialties[newSpecialty.profession].push(newSpecialty.specialty.trim());
    handleSave('specialties', specialties);
    setNewSpecialty({ ...newSpecialty, specialty: '' });
  };

  const removeSpecialty = (profession, specialty) => {
    const specialties = { ...(config.specialties || {}) };
    specialties[profession] = (specialties[profession] || []).filter(s => s !== specialty);
    handleSave('specialties', specialties);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div data-testid="system-config">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">System Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Manage platform-wide configurable parameters</p>
      </div>

      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-lg" data-testid="config-success">{success}</div>}

      <div className="space-y-6">
        {/* Professions */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="config-professions">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Profession Categories</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(config.professions || []).map(p => (
              <span key={p} className="inline-flex items-center gap-1 bg-primary-50 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                {p}
                <button onClick={() => removeProfession(p)} className="hover:text-red-500 ml-1" data-testid={`remove-prof-${p}`}><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newProfession} onChange={e => setNewProfession(e.target.value)} onKeyDown={e => e.key === 'Enter' && addProfession()} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="New profession..." data-testid="new-profession-input" />
            <button onClick={addProfession} disabled={saving} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50" data-testid="add-profession-btn">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Countries */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="config-countries">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Countries</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(config.countries || []).map(c => (
              <span key={c} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {c}
                <button onClick={() => removeCountry(c)} className="hover:text-red-500 ml-1"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newCountry} onChange={e => setNewCountry(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCountry()} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="New country..." data-testid="new-country-input" />
            <button onClick={addCountry} disabled={saving} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50" data-testid="add-country-btn">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-card" data-testid="config-specialties">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Specialties by Profession</h3>
          <div className="space-y-4 mb-4">
            {Object.entries(config.specialties || {}).map(([profession, specs]) => (
              <div key={profession}>
                <p className="text-sm font-medium text-slate-700 mb-2">{profession}</p>
                <div className="flex flex-wrap gap-1.5">
                  {specs.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                      {s}
                      <button onClick={() => removeSpecialty(profession, s)} className="hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <select value={newSpecialty.profession} onChange={e => setNewSpecialty({...newSpecialty, profession: e.target.value})} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" data-testid="specialty-profession-select">
              <option value="">Profession</option>
              {(config.professions || []).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" value={newSpecialty.specialty} onChange={e => setNewSpecialty({...newSpecialty, specialty: e.target.value})} onKeyDown={e => e.key === 'Enter' && addSpecialty()} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="New specialty..." data-testid="new-specialty-input" />
            <button onClick={addSpecialty} disabled={saving} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50" data-testid="add-specialty-btn">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
