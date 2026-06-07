
'use client';

import React from 'react';
import { ExperienceItem } from '@/features/resume-builder/types/resume';

type Props = { value: ExperienceItem[]; onChange: (next: ExperienceItem[]) => void; };

const emptyExp = (): ExperienceItem => ({
  id: crypto.randomUUID(),
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  location: '',
  bullets: [''],
});

export default function ExperienceForm({ value, onChange }: Props) {
  const add = () => onChange([...value, emptyExp()]);
  const remove = (id: string) => onChange(value.filter((e) => e.id !== id));
  const update = (id: string, patch: Partial<ExperienceItem>) =>
    onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const updateBullet = (id: string, idx: number, text: string) =>
    onChange(value.map((e) =>
      e.id === id ? { ...e, bullets: e.bullets.map((b, i) => (i === idx ? text : b)) } : e
    ));

  const addBullet = (id: string) =>
    onChange(value.map((e) => (e.id === id ? { ...e, bullets: [...e.bullets, ''] } : e)));

  const removeBullet = (id: string, idx: number) =>
    onChange(value.map((e) =>
      e.id === id ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e
    ));

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-800 mb-3">Experience</h3>
      <button type="button" className="btn-primary mb-4" onClick={add}>+ Add Experience</button>

      {value.length === 0 && <p className="text-sm text-gray-500 mb-2">No experience added yet.</p>}

      <div className="space-y-4">
        {value.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 p-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label">Company *</span>
                <input className="input" value={item.company}
                       onChange={(e) => update(item.id, { company: e.target.value })}
                       placeholder="e.g. ABC Pvt Ltd" required />
              </label>
              <label className="block">
                <span className="label">Role/Title *</span>
                <input className="input" value={item.role}
                       onChange={(e) => update(item.id, { role: e.target.value })}
                       placeholder="Frontend Engineer" required />
              </label>
              <label className="block">
                <span className="label">Location</span>
                <input className="input" value={item.location || ''}
                       onChange={(e) => update(item.id, { location: e.target.value })}
                       placeholder="Karachi" />
              </label>
              <label className="block">
                <span className="label">Start Date *</span>
                <input className="input" type="month" value={item.startDate || ''}
                       onChange={(e) => update(item.id, { startDate: e.target.value })} required />
              </label>
              <label className="block">
                <span className="label">End Date</span>
                <input className="input" type="month" value={item.endDate || ''}
                       onChange={(e) => update(item.id, { endDate: e.target.value })} />
              </label>
            </div>

            <div className="mt-3">
              <span className="label">Key Achievements / Responsibilities</span>
              <div className="space-y-2 mt-2">
                {item.bullets.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input flex-1" placeholder="e.g. Built resume builder with React and Tailwind"
                           value={b} onChange={(e) => updateBullet(item.id, i, e.target.value)} />
                    <button type="button" className="btn-ghost" onClick={() => removeBullet(item.id, i)}>Remove</button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-secondary mt-2" onClick={() => addBullet(item.id)}>+ Add Bullet</button>
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" className="btn-ghost" onClick={() => remove(item.id)}>Remove Experience</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
