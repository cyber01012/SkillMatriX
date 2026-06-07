
'use client';
import React from 'react';
import { Button } from '@/components/resume-builder';
// ✅ Import your domain types
import type { Resume } from '@/features/resume-builder/types/resume';
import type { TemplateId } from '@/features/resume-builder/constants/resume.constants'

// Helper to Base64 encode safely
const encodeState = (obj: unknown) =>
  btoa(encodeURIComponent(JSON.stringify(obj)));

export default function ExportPanel({
  resume,
  templateId,
  accentColor,
  fontFamily,
  onExport,      // (kept, but not used per your current flow)
  exporting,     // (kept, but not used per your current flow)
  status         // (kept, but not used per your current flow)
}: {
  resume: Resume;
  templateId: TemplateId;
  accentColor: string;
  fontFamily: string;
  onExport?: () => void;
  exporting?: boolean;
  status?: string | null;
}) {
  // 🌟 Local downloading state for the primary button
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    if (downloading) return; // prevent double clicks
    setDownloading(true);
    try {
      const payload = {
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        state: encodeState({ resume, templateId, accentColor, fontFamily }),
      };

      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to export PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Nice: filename based on candidate name
      const fileName =
        ((resume?.personal?.fullName || 'resume').trim() || 'resume')
          .replace(/\s+/g, '-')
          .toLowerCase() + '.pdf';

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Sorry, PDF export failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Save &amp; Export</h4>
      <p className="text-xs text-gray-600">
        Download your CV as a PDF. Colors and backgrounds are preserved.
      </p>

      <div className="flex items-center gap-2">
        {/* Primary: single export button with local loading state */}
        <Button
          variant="primary"
          onClick={handleDownloadPdf}
          disabled={downloading}
        >
          {downloading ? 'Exporting…' : 'Download as PDF'}
        </Button>

        {/* Keep print as fallback */}
        <Button
          variant="secondary"
          onClick={() => window.print()}
          disabled={downloading} // optional: disable during export
        >
          Print to PDF
        </Button>
      </div>

      {/* If you ever want to show status from parent, you already pass `status` prop */}
      {status && (
        <p className="text-xs text-gray-600" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
