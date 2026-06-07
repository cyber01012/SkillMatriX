
'use client';

import React, { useState } from 'react';
import { Skill } from '@/features/resume-builder/types/resume';
import { SKILL_LEVELS } from '@/features/resume-builder/constants/resume.constants';

type Props = {
  value: Skill[];
  onChange: (next: Skill[]) => void;
};

export default function SkillsForm({ value, onChange }: Props) {
  // We keep 'none' in the draft for dropdown display,
  // but translate to undefined when adding to the list.
  const [hardDraft, setHardDraft] = useState<Skill & { level?: Skill['level'] | 'none' }>({
    name: '',
    category: 'Hard',
  });
  const [softDraft, setSoftDraft] = useState<Skill & { level?: Skill['level'] | 'none' }>({
    name: '',
    category: 'Soft',
  });

  const hardSkills = value.filter((s) => s.category === 'Hard');
  const softSkills = value.filter((s) => s.category === 'Soft');

  const addSkill = (draft: Skill & { level?: Skill['level'] | 'none' }) => {
    const name = (draft.name ?? '').trim();
    if (!name) return;

    const normalizedLevel = draft.level === 'none' ? undefined : draft.level;

    const next: Skill = {
      name,
      category: draft.category,
      ...(normalizedLevel ? { level: normalizedLevel } : {}),
    };

    onChange([...value, next]);

    if (draft.category === 'Hard') {
      setHardDraft({ name: '', category: 'Hard' }); // reset
    } else {
      setSoftDraft({ name: '', category: 'Soft' }); // reset
    }
  };

  const removeSkill = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const indexOfSkill = (s: Skill) =>
    value.findIndex(
      (x) => x.name === s.name && x.category === s.category && x.level === s.level
    );

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-800 mb-3">Skills</h3>

      {/* Hard Skills Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Hard Skills</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              className="input"
              placeholder="e.g. React, TypeScript"
              value={hardDraft.name}
              onChange={(e) => setHardDraft({ ...hardDraft, name: e.target.value })}
            />

            <select
              className="input"
              value={hardDraft.level ?? ''} // '' shows "Select level"
              onChange={(e) =>
                setHardDraft({
                  ...hardDraft,
                  level:
                    e.target.value === 'none'
                      ? 'none'
                      : (e.target.value || undefined),
                })
              }
            >
              {/* Placeholder */}
              <option value="">Select level</option>

              {/* Levels */}
              {SKILL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}

              {/* None (explicit no level) */}
              <option value="none">None</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => addSkill(hardDraft)}
          >
            + Add Hard Skill
          </button>
        </div>

        {/* Hard Skills List */}
        <div className="mt-4 space-y-2">
          {hardSkills.length === 0 && (
            <p className="text-sm text-gray-500">No hard skills added yet.</p>
          )}
          {hardSkills.map((s) => {
            const idx = indexOfSkill(s);
            return (
              <div
                key={`hard-${s.name}-${s.level ?? 'none'}`}
                className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md"
              >
                <span className="text-sm">
                  {s.name}{' '}
                  {/* show level only if present and not 'none' */}
                  {s.level && s.level !== 'none' && (
                    <span className="text-gray-500">({s.level})</span>
                  )}
                </span>
                <button
                  type="button"
                  className="btn-ghost text-red-600"
                  onClick={() => removeSkill(idx)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soft Skills Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Soft Skills</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              className="input"
              placeholder="e.g. Communication, Leadership"
              value={softDraft.name}
              onChange={(e) => setSoftDraft({ ...softDraft, name: e.target.value })}
            />

            <select
              className="input"
              value={softDraft.level ?? ''} // '' shows "Select level"
              onChange={(e) =>
                setSoftDraft({
                  ...softDraft,
                  level:
                    e.target.value === 'none'
                      ? 'none'
                      : (e.target.value || undefined),
                })
              }
            >
              <option value="">Select level</option>
              {SKILL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
              <option value="none">None</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => addSkill(softDraft)}
          >
            + Add Soft Skill
          </button>
        </div>

        {/* Soft Skills List */}
        <div className="mt-4 space-y-2">
          {softSkills.length === 0 && (
            <p className="text-sm text-gray-500">No soft skills added yet.</p>
          )}
          {softSkills.map((s) => {
            const idx = indexOfSkill(s);
            return (
              <div
                key={`soft-${s.name}-${s.level ?? 'none'}`}
                className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md"
              >
                <span className="text-sm">
                  {s.name}{' '}
                  {s.level && s.level !== 'none' && (
                    <span className="text-gray-500">({s.level})</span>
                  )}
                </span>
                <button
                  type="button"
                  className="btn-ghost text-red-600"
                  onClick={() => removeSkill(idx)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
