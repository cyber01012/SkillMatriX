
'use client';
import React from 'react';
import type { Resume } from '@/features/resume-builder/types/resume';

export default function ClassicTemplate({
  resume,
  children,
}: {
  resume: Resume;
  children?: React.ReactNode;
}) {
  // You can use `resume` here for template-specific decisions later if needed
  return <div className="text-gray-900">{children}</div>;
}
