'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HouseholdPayload } from '@/lib/foodroute/types';

interface HouseholdCaptureProps {
  onComplete: (household: HouseholdPayload) => void;
  onSkip: () => void;
}

export default function HouseholdCapture({ onComplete, onSkip }: HouseholdCaptureProps) {
  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [hasChildren, setHasChildren] = useState(false);
  const [hasAccessibilityNeeds, setHasAccessibilityNeeds] = useState(false);
  const [urgencyNote, setUrgencyNote] = useState('');

  const submit = useCallback(() => {
    onComplete({
      householdSize: Math.max(1, Math.min(20, Math.round(householdSize))),
      hasChildren,
      hasAccessibilityNeeds,
      urgencyNote: urgencyNote.trim() || undefined,
    });
  }, [householdSize, hasChildren, hasAccessibilityNeeds, urgencyNote, onComplete]);

  return (
    <div className="space-y-3">
      <h3 className="civ-section-title">Household</h3>
      <p className="text-[11px] text-slate-500">Tell us a bit about your household so we can find the best fit.</p>
      <div className="space-y-2.5">
        <div className="civ-field-group">
          <label className="civ-label">Household size</label>
          <input
            type="number" min={1} max={20} value={householdSize}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setHouseholdSize(Number.isNaN(n) ? 1 : n);
            }}
            className="civ-input"
          />
        </div>
        <label className="flex items-center gap-2 text-[12px] text-slate-600">
          <input type="checkbox" checked={hasChildren} onChange={(e) => setHasChildren(e.target.checked)} />
          Household includes children
        </label>
        <label className="flex items-center gap-2 text-[12px] text-slate-600">
          <input type="checkbox" checked={hasAccessibilityNeeds} onChange={(e) => setHasAccessibilityNeeds(e.target.checked)} />
          Accessibility needs (mobility, etc.)
        </label>
        <div className="civ-field-group">
          <label className="civ-label">Anything urgent we should know? (optional)</label>
          <input
            type="text" value={urgencyNote} placeholder="e.g. no food since yesterday"
            onChange={(e) => setUrgencyNote(e.target.value)}
            className="civ-input"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button onClick={submit} className="civ-btn civ-btn--primary flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          Continue
        </motion.button>
        <motion.button onClick={onSkip} className="civ-btn civ-btn--ghost px-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          Skip
        </motion.button>
      </div>
    </div>
  );
}
