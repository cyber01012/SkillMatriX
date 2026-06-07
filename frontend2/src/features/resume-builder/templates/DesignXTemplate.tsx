
'use client';
import React from 'react';
import type { Resume } from '@/features/resume-builder/types/resume';

export default function DesignXTemplate({
  resume,
  children,
}: {
  resume: Resume;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative h-full w-full">
      {/* Accent sidebar — FULL PAGE HEIGHT */}
      <div
        aria-hidden
        className="absolute top-0 left-0 bottom-0"
        style={{
          width: '8mm',
          // reads CSS var from parent page/container
          backgroundColor: 'var(--accent, #0ea5e9)',
        }}
      />

      {/* Content area */}
      <div className="relative pr-2" style={{ paddingLeft: '12mm' }}>
        {children}
      </div>
    </div>
  );
}
