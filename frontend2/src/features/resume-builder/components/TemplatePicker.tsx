'use client';

import React from 'react';
import {
  TEMPLATE_REGISTRY,
  type TemplateId,
} from '@/features/resume-builder/constants/resume.constants';

export default function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (next: TemplateId) => void;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">
        Choose Template
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TEMPLATE_REGISTRY.map((t) => {
          const selected = t.id === value;

          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(t.id)}
              className={`w-full rounded-md border transition focus:outline-none focus:ring-2
                ${
                  selected
                    ? 'border-[var(--ui-primary)] ring-[var(--ui-primary-200)]'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Card body */}
              <div className="relative p-2 text-left">
                {/* Radio — fixed top right */}
                <div
                  aria-hidden
                  className={`absolute top-2 right-2 h-4 w-4 rounded-full border
                    ${
                      selected
                        ? 'bg-[var(--ui-primary)] border-[var(--ui-primary)]'
                        : 'bg-white border-gray-300'
                    }
                  `}
                />

                {/* Content stack */}
                <div className="pt-5 space-y-1.5">
                  {/* Template name */}
                  <div className="text-sm font-medium text-gray-800 leading-snug">
                    {t.name}
                  </div>

                  {/* Description */}
                  {t.description && (
                    <div className="text-[11px] text-gray-500 leading-snug">
                      {t.description}
                    </div>
                  )}

                  {/* Mini preview */}
                  <div className="mt-1.5 h-14 w-full rounded bg-gray-50 border border-dashed border-gray-300 overflow-hidden">
                    {t.id === 'ats' && (
                      <div className="p-1.5 space-y-1">
                        <div className="h-2 bg-gray-200 rounded w-3/4" />
                        <div className="h-1.5 bg-gray-100 rounded w-1/2" />
                        <div className="h-1.5 bg-gray-100 rounded w-5/6" />
                      </div>
                    )}

                    {t.id === 'two-column' && (
                      <div className="grid grid-cols-2 gap-1 p-1.5">
                        <div className="space-y-1">
                          <div className="h-2 bg-gray-200 rounded w-5/6" />
                          <div className="h-1.5 bg-gray-100 rounded w-4/5" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-gray-200 rounded w-5/6" />
                          <div className="h-1.5 bg-gray-100 rounded w-4/5" />
                        </div>
                      </div>
                    )}

                    {t.id === 'design-x' && (
                      <div className="relative h-full">
                        <div
                          className="absolute top-0 bottom-0 left-0"
                          style={{
                            width: '4px',
                            backgroundColor: 'var(--accent, #0ea5e9)',
                          }}>
                            
                        </div>                        
                        <div className="h-full pl-2 p-1.5 space-y-1">
                          <div className="h-2 bg-gray-200 rounded w-3/4" />
                          <div className="h-1.5 bg-gray-100 rounded w-2/3" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
