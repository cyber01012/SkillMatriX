
'use client';

import React from 'react';
import { motion } from 'framer-motion';

type StepDetailsProps = {
  currentStep: number;
  steps: string[];
  onSelectStep?: (index: number) => void;
  accentColor?: string;
  textColor?: string;
};

export default function StepDetails({
  currentStep,
  steps,
  onSelectStep,
  accentColor = '#2ED3A6',
  textColor = '#3D418A',
}: StepDetailsProps) {
  const visible = (() => {
    const last = steps.length - 1;
    if (steps.length <= 3) return steps;
    if (currentStep <= 1) return steps.slice(0, 3);
    if (currentStep >= last) return steps.slice(last - 2);
    return steps.slice(currentStep - 1, currentStep + 2);
  })();

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
      {visible.map((label, i) => {
        const absoluteIndex = steps.indexOf(label);
        const active = absoluteIndex === currentStep;

        return (
          <div key={label} className="flex items-center">
            <motion.button
              type="button"
              onClick={() => onSelectStep?.(absoluteIndex)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className={`px-2.5 py-1 rounded-md max-w-[140px] truncate whitespace-nowrap relative border`}
              title={`${absoluteIndex + 1}. ${label}`}
              style={{
                color: active ? textColor : '#374151',
                background: active ? 'rgba(46,211,166,0.12)' : '#f3f4f6',
                borderColor: active ? accentColor : '#e5e7eb',
                fontWeight: 600,
              }}
            >
              {absoluteIndex + 1}. {label}
              {active && (
                <motion.span
                  layoutId="detail-step-underline"
                  className="absolute -bottom-[6px] left-2 right-2 h-[3px] rounded"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </motion.button>
            {i < visible.length - 1 && (
              <span className="mx-2 text-gray-300">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
