
'use client';

import React, { forwardRef, useImperativeHandle, useRef, useMemo, useEffect } from 'react';
import { EducationItem } from '@/features/resume-builder/types/resume';

type Props = {
  value: EducationItem[];
  onChange: (next: EducationItem[]) => void;
  submitAttempt?: boolean; // NEW: shows errors when parent tries to go next
};

export type EducationFormHandle = {
  validate: () => { valid: boolean; firstErrorId?: string };
  focusFirstError: () => void;
};

const emptyEdu = (): EducationItem => ({
  id: crypto.randomUUID(),
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  location: '',
  description: '',
});

const EducationForm = forwardRef<EducationFormHandle, Props>(
  ({ value, onChange, submitAttempt }, ref) => {
    const addBtnRef = useRef<HTMLButtonElement>(null);

    const add = () => onChange([...value, emptyEdu()]);
    const remove = (id: string) => onChange(value.filter((e) => e.id !== id));
    const update = (id: string, patch: Partial<EducationItem>) =>
      onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));

    const hasAnyEducation = value.length > 0;

    // Compute first error target
    const firstErrorId = useMemo(() => {
      if (!hasAnyEducation) return 'add-education-button';
      // find first item missing institution
      const missing = value.find((item) => !item.institution?.trim());
      return missing ? `institution-${missing.id}` : undefined;
    }, [hasAnyEducation, value]);

    useImperativeHandle(ref, () => ({
      validate: () => ({
        valid: hasAnyEducation && !value.some((it) => !it.institution?.trim()),
        firstErrorId,
      }),
      focusFirstError: () => {
        if (!firstErrorId) return;
        if (firstErrorId === 'add-education-button') {
          const el = addBtnRef.current;
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            requestAnimationFrame(() => el.focus());
          }
          return;
        }
        const el = document.getElementById(firstErrorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          requestAnimationFrame(() => (el as HTMLElement).focus?.());
        }
      },
    }), [firstErrorId, value, hasAnyEducation]);

    // If parent toggled submitAttempt, optionally auto-scroll to first error
    useEffect(() => {
      if (submitAttempt && firstErrorId) {
        if (firstErrorId === 'add-education-button') {
          const el = addBtnRef.current;
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            requestAnimationFrame(() => el.focus());
          }
        } else {
          const el = document.getElementById(firstErrorId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            requestAnimationFrame(() => (el as HTMLElement).focus?.());
          }
        }
      }
    }, [submitAttempt, firstErrorId]);

    return (
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Education</h3>

        {/* Top-level required message if none added and Next clicked */}
        {!hasAnyEducation && submitAttempt && (
          <p className="text-sm text-red-600 mb-3">
            Education is required — please add at least one entry (e.g., Matric / O-Levels / Intermediate / Bachelor).
          </p>
        )}

        <button
          ref={addBtnRef}
          type="button"
          className="btn-primary mb-4"
          onClick={add}
          id="add-education-button"
        >
          + Add Education
        </button>

        {value.length === 0 && !submitAttempt && (
          <p className="text-sm text-gray-500 mb-2">No education added yet.</p>
        )}

        <div className="space-y-4">
          {value.map((item) => {
            const institutionError = submitAttempt && !item.institution?.trim();
            return (
              <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="label">Institution *</span>
                    <input
                      id={`institution-${item.id}`}
                      className={`input ${institutionError ? 'input-error' : ''}`}
                      value={item.institution}
                      onChange={(e) => update(item.id, { institution: e.target.value })}
                      placeholder="e.g. NED University / Govt. Degree College / High School"
                      required
                      aria-invalid={institutionError}
                      aria-describedby={`institution-${item.id}-error`}
                    />
                    {institutionError && (
                      <p id={`institution-${item.id}-error`} className="mt-1 text-sm text-red-600">
                        Institution is required
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <span className="label">Degree</span>
                    <input
                      className="input"
                      value={item.degree || ''}
                      onChange={(e) => update(item.id, { degree: e.target.value })}
                      placeholder="Matric / Intermediate / BSc / MSc / etc."
                    />
                  </label>

                  <label className="block">
                    <span className="label">Field</span>
                    <input
                      className="input"
                      value={item.field || ''}
                      onChange={(e) => update(item.id, { field: e.target.value })}
                      placeholder="Computer Science / Pre-Engineering / Arts ..."
                    />
                  </label>

                  <label className="block">
                    <span className="label">Location</span>
                    <input
                      className="input"
                      value={item.location || ''}
                      onChange={(e) => update(item.id, { location: e.target.value })}
                      placeholder="Karachi"
                    />
                  </label>

                  <label className="block">
                    <span className="label">Start Date</span>
                    <input
                      className="input"
                      type="month"
                      value={item.startDate || ''}
                      onChange={(e) => update(item.id, { startDate: e.target.value })}
                    />
                  </label>

                  <label className="block">
                    <span className="label">End Date</span>
                    <input
                      className="input"
                      type="month"
                      value={item.endDate || ''}
                      onChange={(e) => update(item.id, { endDate: e.target.value })}
                    />
                  </label>
                </div>

                <label className="block mt-3">
                  <span className="label">Description</span>
                  <textarea
                    className="input min-h-80px"
                    value={item.description || ''}
                    onChange={(e) => update(item.id, { description: e.target.value })}
                    placeholder="Honors, GPA, notable coursework, societies..."
                  />
                </label>

                <div className="flex justify-end pt-2">
                  <button type="button" className="btn-ghost" onClick={() => remove(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

EducationForm.displayName = 'EducationForm';
export default EducationForm;
