'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { NeedsPayload } from '@/lib/foodroute/types';

interface NeedCardsProps {
  onComplete: (needs: NeedsPayload) => void;
}

const LANGUAGES = [
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'French' },
  { key: 'zh', label: 'Mandarin/Cantonese' },
  { key: 'pa', label: 'Punjabi' },
  { key: 'ur', label: 'Urdu' },
  { key: 'ar', label: 'Arabic' },
  { key: 'ta', label: 'Tamil' },
  { key: 'hi', label: 'Hindi' },
] as const;

const DIETARY = [
  { key: 'halal', label: 'Halal' },
  { key: 'kosher', label: 'Kosher' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'gluten-free', label: 'Gluten-Free' },
  { key: 'culturally-specific', label: 'Culturally-Specific Foods' },
] as const;

export default function NeedCards({ onComplete }: NeedCardsProps) {
  const [languages, setLanguages] = useState<Record<string, boolean>>({ en: true });
  const [dietary, setDietary] = useState<Record<string, boolean>>({});
  const [culturalPreference, setCulturalPreference] = useState('');
  const [freeText, setFreeText] = useState('');

  const toggleLanguage = (key: string) => setLanguages((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleDietary = (key: string) => setDietary((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = () => {
    onComplete({
      languages: Object.keys(languages).filter((k) => languages[k]),
      dietaryNeeds: Object.keys(dietary).filter((k) => dietary[k]),
      culturalPreference: culturalPreference.trim() || undefined,
      freeText: freeText.trim() || undefined,
    });
  };

  return (
    <div className="space-y-3.5">
      <h3 className="civ-section-title">Your Needs</h3>

      <div className="civ-field-group">
        <label className="civ-label">Preferred language(s)</label>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((l) => {
            const active = !!languages[l.key];
            return (
              <motion.button
                key={l.key}
                onClick={() => toggleLanguage(l.key)}
                className={`civ-need-card ${active ? 'civ-need-card--active' : ''}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                layout
              >
                <span className={`civ-need-dot ${active ? 'civ-need-dot--active' : ''}`} />
                <span className="text-[11px] font-semibold text-slate-700">{l.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="civ-field-group">
        <label className="civ-label">Dietary needs</label>
        <div className="grid grid-cols-2 gap-2">
          {DIETARY.map((d) => {
            const active = !!dietary[d.key];
            return (
              <motion.button
                key={d.key}
                onClick={() => toggleDietary(d.key)}
                className={`civ-need-card ${active ? 'civ-need-card--active' : ''}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                layout
              >
                <span className={`civ-need-dot ${active ? 'civ-need-dot--active' : ''}`} />
                <span className="text-[11px] font-semibold text-slate-700">{d.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="civ-field-group">
        <label className="civ-label">Cultural food preference (optional)</label>
        <input
          type="text" value={culturalPreference}
          onChange={(e) => setCulturalPreference(e.target.value)}
          placeholder="e.g. South Asian, East African, Caribbean..."
          className="civ-input"
        />
      </div>

      <div className="civ-field-group">
        <label className="civ-label">Anything else we should know?</label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="e.g. need infant formula, wheelchair access..."
          rows={3}
          className="civ-input civ-textarea"
        />
      </div>

      <motion.button
        onClick={handleSubmit}
        className="civ-btn civ-btn--danger w-full"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        Get Needs Assessment
      </motion.button>
    </div>
  );
}
