
'use client';
import React from 'react';
import { FONT_OPTIONS } from '@/features/resume-builder/constants/resume.constants';
import { Input, } from '@/components/resume-builder';

export default function StyleControls({
  accentColor,
  onAccentColor,
  fontFamily,
  onFontFamily,
  templateId,
}: {
  accentColor: string;
  onAccentColor: (hex: string) => void;
  fontFamily: string;
  onFontFamily: (name: string) => void;
  templateId?: string;
}) {
  const isDesignX = /design[-_]?x/i.test(templateId ?? '')
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Styles</h4>

      
{/* ✅ Disclaimer under Styles heading, above Accent Color */}
      {!isDesignX && (
        <p className="mb-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          <strong>Note:</strong> Accent color only works with <em>Design‑X</em> templates.
        </p>
      )}


      <label htmlFor="accent-color" className="ui-label">Accent Color</label>
      <div className="flex items-center gap-3">
        <input
          id="accent-color"
          type="color"
          className="ui-input h-10 w-16 p-1"
          value={accentColor}
          onChange={(e) => onAccentColor(e.target.value)}
          title="Pick accent color"
        />
        <span className="inline-flex items-center rounded-md px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: accentColor }}>
          Preview
        </span>
      </div>

      <label htmlFor="font-family" className="ui-label">Font Family</label>
      <select
        id="font-family"
        className="ui-input"
        value={fontFamily}
        onChange={(e) => onFontFamily(e.target.value)}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
    </div>
  );
}
