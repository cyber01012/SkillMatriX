
'use client';

import React, { useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ResumePreview from '@/features/resume-builder/components/preview/ResumePreview';
import { Resume, emptyResume } from '@/features/resume-builder/types/resume';
import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_STYLES,
  type TemplateId,
} from '@/features/resume-builder/constants/resume.constants';

function safeDecode(s: string | null) {
  if (!s) return undefined;
  try {
    const json = decodeURIComponent(atob(s));
    return JSON.parse(json);
  } catch { return undefined; }
}

export default function PrintPage() {
    

  const params = useSearchParams();
  const rawFromQuery = params.get('state');

  // Try query first, else localStorage
  const payload = useMemo(() => {
    const fromQuery = safeDecode(rawFromQuery);
    if (fromQuery) return fromQuery;
    if (typeof window !== 'undefined') {
      const ls = window.localStorage.getItem('resumePrintState');
      const fromLS = ls ? safeDecode(ls) : undefined;
      return fromLS;
    }
    return undefined;
  }, [rawFromQuery]);

  const resume: Resume      = payload?.resume     ?? emptyResume;
  const templateId: TemplateId = payload?.templateId ?? DEFAULT_TEMPLATE_ID;
  const accentColor         = payload?.accentColor ?? DEFAULT_STYLES.accentColor;
  const fontFamily          = payload?.fontFamily  ?? DEFAULT_STYLES.fontFamily;

  return (
    <main>
      <div id="print-resume-root" 
      style={{ width: '210mm',
                height: '297mm',
                margin: 0,
                padding: 0,
                background: 'white',
                // overflow: 'hidden',
                }}>
        <ResumePreview
          resume={resume}
          templateId={templateId}
          accentColor={accentColor}
          fontFamily={fontFamily}
          mode="print"     // 👈 important
        />
      </div>
      
<style>{`
  /* Full-bleed page */
  @page { size: A4; margin: 0; }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { page-break-after: always; break-after: page; }
    .page:last-child { page-break-after: auto; }
  }
`}</style>

    </main>
  );
}
