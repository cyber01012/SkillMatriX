
'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { reportToHTML } from '@/features/skill-gap/utils/reportToHTML';
import type { BackendResponse, SkillGap } from '../types/skill-gap';
import Card from '@/components/resume-builder/Card';
import Button from '@/components/resume-builder/Button';

/* -------------------- Type Guards / Helpers -------------------- */

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((i) => typeof i === 'string');
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/**
 * Make the component resilient to different backend shapes:
 * - nested: { skillGap: { ... } }
 * - top-level: { strongSkills, weakSkills, ... }
 * - legacy keys: strong/weak/missing
 * - string numeric: matchPercentage: "72"
 * - advice: improvementAdvice or improvements
 */
function normalizeToSkillGap(x: unknown): SkillGap | null {
  if (!isObject(x)) return null;
  const o = x as Record<string, unknown>;

  const strong =
    (o.strongSkills as unknown) ??
    (o.strong as unknown) ??
    []; // tolerate legacy key

  const weak =
    (o.weakSkills as unknown) ??
    (o.weak as unknown) ??
    [];

  const missing =
    (o.missingSkills as unknown) ??
    (o.missing as unknown) ??
    [];

  const matchRaw = o.matchPercentage as unknown;
  const adviceRaw =
    (o.improvementAdvice as unknown) ??
    (o.improvements as unknown) ??
    '';

  const strongSkills = isStringArray(strong) ? strong : [];
  const weakSkills = isStringArray(weak) ? weak : [];
  const missingSkills = isStringArray(missing) ? missing : [];

  const matchNumber =
    typeof matchRaw === 'number'
      ? matchRaw
      : typeof matchRaw === 'string'
      ? Number(matchRaw)
      : undefined;

  const improvementAdvice =
    typeof adviceRaw === 'string' ? adviceRaw : '';

  // If nothing at all is present, bail out
  if (
    strongSkills.length === 0 &&
    weakSkills.length === 0 &&
    missingSkills.length === 0 &&
    (matchNumber === undefined || Number.isNaN(matchNumber)) &&
    !improvementAdvice
  ) {
    return null;
  }

  return {
    strongSkills,
    weakSkills,
    missingSkills,
    matchPercentage:
      matchNumber !== undefined && !Number.isNaN(matchNumber)
        ? matchNumber
        : 0,
    improvementAdvice,
  };
}

/* -------------------- Advice Block -------------------- */

function AdviceBlock({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const trimmed = text?.trim?.() ?? '';
  let parsed: unknown = null;
  let parsedOk = false;

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      parsed = JSON.parse(trimmed);
      parsedOk = true;
    } catch {
      parsedOk = false;
    }
  }

  if (parsedOk) {
    if (Array.isArray(parsed)) {
      return (
        <ol className={`list-decimal list-inside space-y-1 ${className}`}>
          {(parsed as unknown[]).map((item, i) => (
            <li key={i}>{String(item)}</li>
          ))}
        </ol>
      );
    }

    if (parsed && typeof parsed === 'object') {
      return (
        <ul className={`list-disc list-inside space-y-1 ${className}`}>
          {Object.values(parsed as Record<string, unknown>).map((v, i) => (
            <li key={i}>{String(v)}</li>
          ))}
        </ul>
      );
    }
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="mb-2 leading-relaxed" {...props} />,
        strong: (props) => <strong className="font-bold" {...props} />,
        ul: (props) => <ul className="list-disc list-inside space-y-1" {...props} />,
        ol: (props) => <ol className="list-decimal list-inside space-y-1" {...props} />,
        li: (props) => <li className="my-1" {...props} />,
      }}
    >
      {trimmed}
    </ReactMarkdown>
  );
}

/* -------------------- HTML entity decode -------------------- */

function decodeHtml(input: string) {
  if (!input) return input;
  const el = document.createElement('textarea');
  el.innerHTML = input;
  return el.value;
}

/* -------------------- Component -------------------- */

export default function Report({
  data,
  role,
  userName, // ⬅️ new prop
}: {
  data: BackendResponse;
  role?: string;
  userName?: string; // ⬅️ new prop type

}) {
  // Accept nested or top-level:
  const candidate = (data)?.skillGap ?? data;
  const normalized = normalizeToSkillGap(candidate);

  const [downloading, setDownloading] = useState(false);

  if (!normalized) {
    return <p className="text-sm text-gray-600">No report data available.</p>;
  }

  const {
    strongSkills = [],
    weakSkills = [],
    missingSkills = [],
    matchPercentage = 0,
    improvementAdvice = '',
  } = normalized;

  const roleFromProp = (role ?? '').trim();
const displayName =
    (typeof userName === 'string' && userName.trim()) ||
    // (candidate as any)?.userName ||  // only if your backend sends it
    'User';

  const transparentCard = 'bg-transparent border-0 shadow-none p-0';

  async function exportPDF() {
    if (downloading) return;
    setDownloading(true);

    try {
      const html = reportToHTML({
        role: roleFromProp || '—',
        matchPercentage: matchPercentage ?? 0,
        improvementAdvice,
        strongSkills,
        weakSkills,
        missingSkills,
        userName: displayName,      
});

      const fileName = `${(roleFromProp || 'role')
        .replace(/[^\w\- ]+/g, '')
        .trim()
        .replace(/\s+/g, '-')}-skill-gap-report.pdf`;

      const exportRes = await fetch('/api/skill-gap/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, fileName }),
      });

      if (!exportRes.ok) {
        const t = await exportRes.text().catch(() => '');
        throw new Error(t || 'PDF export failed');
      }

      const { publicUrl } = (await exportRes.json()) as { publicUrl: string };
      if (!publicUrl) throw new Error('PDF URL missing from response.');

      window.open(publicUrl, '_blank');
    } catch (err) {
      console.error('Export PDF error:', err);
      alert(err instanceof Error ? err.message : 'PDF export failed');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      {(typeof matchPercentage === 'number' || improvementAdvice) && (
        <Card className={transparentCard}>
          <div className="space-y-3">
            {typeof matchPercentage === 'number' && (
              <div>
                <div className="text-4xl font-bold">
                  <span className="text-[#c86ad6]">MATCH FOR </span>
                  {roleFromProp && (
                    <span className="bg-gradient-to-r from-[#991cac] via-[#6d71bb] to-[#991cac] bg-clip-text text-transparent italic">
                      {roleFromProp}
                    </span>
                  )}
                </div>
                <div className=" mt-5 mb-4 text-3xl font-bold" style={{ color: '#3D418A' }}>
                  {matchPercentage}% fit
                </div>
              </div>
            )}
            {improvementAdvice && (
              <div>
                <div className="text-2xl text-[#c86ad6] font-bold mb-1">Advice</div>
                <AdviceBlock className="whitespace-pre-line" text={decodeHtml(improvementAdvice)} />
              </div>
            )}
          </div>
        </Card>
      )}

      {strongSkills.length > 0 && (
        <Card className={transparentCard}>
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#c86ad6' }}>
            STRONG SKILLS
          </h3>
          <div className="flex flex-wrap gap-2">
            {strongSkills.map((s) => (
              <span
                key={s}
                className="px-2 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200"
              >
                {s}
              </span>
            ))}
          </div>
        </Card>
      )}

      {weakSkills.length > 0 && (
        <Card className={transparentCard}>
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#c86ad6' }}>
            WEAK SKILLS
          </h3>
          <div className="flex flex-wrap gap-2">
            {weakSkills.map((s) => (
              <span
                key={s}
                className="px-2 py-1 rounded-full text-sm bg-yellow-50 text-yellow-700 border border-yellow-200"
              >
                {s}
              </span>
            ))}
          </div>
        </Card>
      )}

      {missingSkills.length > 0 && (
        <Card className={transparentCard}>
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#c86ad6' }}>
            MISSING SKILLS (PRIORITY)
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {missingSkills.map((s) => (
              <li key={s}>{decodeHtml(s)}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={exportPDF}
          disabled={downloading}
          className="disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          aria-busy={downloading ? 'true' : 'false'}
        >
          {downloading && (
            <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
            </svg>
          )}
          {downloading ? 'Exporting…' : 'Download as PDF'}
        </Button>
      </div>
    </div>
  );
}
