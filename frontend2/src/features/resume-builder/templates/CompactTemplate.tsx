
'use client';
import React from 'react';
import type { Resume } from '@/features/resume-builder/types/resume';

export default function CompactTemplate({
  resume,
  children,
}: {
  resume: Resume;
  children?: React.ReactNode;
}) {
  // Tighten spacing; true two‑column can be added later without breaking pagination.
  return <div className="text-gray-900 [&_*]:leading-snug">{children}</div>;
}
