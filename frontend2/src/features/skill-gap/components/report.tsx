
'use client';

import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { reportToHTML } from '@/features/skill-gap/utils/reportToHTML';
import type { BackendResponse, SkillGap } from '../types/skill-gap';
// import Card from '@/components/resume-builder/Card'; // ❌ unused — remove
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
    [];

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

/* -------------------- Small helpers -------------------- */

function clampPct(n: number) {
  return Math.max(0, Math.min(100, n));
}


/* -------------------- StackedBar (pure CSS) -------------------- */
function StackedBar({ strong, weak, missing }: { strong: number; weak: number; missing: number }) {
  const total = Math.max(1, strong + weak + missing);
  const ps = (strong / total) * 100;
  const pw = (weak / total) * 100;
  const pm = (missing / total) * 100;

  return (
    <div className="w-full">
      <div className="h-3 w-full rounded-full overflow-hidden border flex" style={{ borderColor: '#E9EAF7' }}>
        <div className="h-full" style={{ width: `${ps}%`, background: '#16a34aCC' }} title={`Strong ${ps.toFixed(0)}%`} />
        <div className="h-full" style={{ width: `${pw}%`, background: '#f59e0bCC' }} title={`Weak ${pw.toFixed(0)}%`} />
        <div className="h-full" style={{ width: `${pm}%`, background: '#ef4444CC' }} title={`Missing ${pm.toFixed(0)}%`} />
      </div>
      <div className="mt-2 flex gap-4 text-xs font-semibold" style={{ color: '#6B7280' }}>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#16a34a' }} />
          Strong: {strong}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
          Weak: {weak}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
          Missing: {missing}
        </span>
      </div>
    </div>
  );
}

/* -------------------- Interactive Donut (SVG, accessible) -------------------- */
function InteractiveDonut({
  percent,
  label = 'Match',
  size = 128,
  stroke = 12,
  copyOnClick = true,
}: {
  percent: number;
  label?: string;
  size?: number;
  stroke?: number;
  copyOnClick?: boolean;
}) {
  const p = clampPct(percent);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (p / 100) * circumference;
  const remainder = circumference - filled;

  const primary = '#3D418A'; // arc color
  const track = '#E9EAF7';   // background track color
  const text = '#1B2230';
  const subtext = '#6B7280';

  const [hovered, setHovered] = React.useState(false);
  const [focusVisible, setFocusVisible] = React.useState(false);
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  async function onActivate() {
    if (!copyOnClick) return;
    try {
      await navigator.clipboard.writeText(`${p.toFixed(1)}% ${label.toLowerCase()}`);
      setHovered(true);
      setTimeout(() => setHovered(false), 350);
    } catch {
      // ignore clipboard errors silently
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Interactive layer (button-like for keyboard users) */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`${label} ${p.toFixed(0)} percent`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setTooltip(null);
        }}
        onMouseMove={onMouseMove}
        onFocus={() => setFocusVisible(true)}
        onBlur={() => setFocusVisible(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onActivate();
          }
        }}
        onClick={onActivate}
        className="rounded-full outline-none"
        style={{
          width: size,
          height: size,
          boxShadow:
            hovered || focusVisible
              ? '0 8px 22px rgba(61, 65, 138, .20)'
              : '0 6px 18px rgba(28,33,61,.08)',
          transition: 'box-shadow 180ms ease, transform 180ms ease',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          cursor: copyOnClick ? 'pointer' : 'default',
        }}
      >
        {/* SVG Donut */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
            {/* Track */}
            <circle
              r={radius}
              cx={0}
              cy={0}
              fill="none"
              stroke={track}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            {/* Arc (animated sweep) */}
            <circle
              r={radius}
              cx={0}
              cy={0}
              fill="none"
              stroke={hovered ? '#2F336F' : primary}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${remainder}`}
              strokeDashoffset={0}
              style={{ transition: 'stroke-dasharray 420ms ease, stroke 200ms ease' }}
            />
          </g>
        </svg>

        {/* Inner disc */}
        <div
          className="absolute rounded-full bg-white border"
          style={{ inset: stroke / 1.5, borderColor: '#E9EAF7' }}
        />

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-2">
          <div>
            <div className="text-2xl font-extrabold" style={{ color: text }}>
              {p.toFixed(0)}%
            </div>
            <div className="text-xs font-semibold" style={{ color: subtext }}>
              {label}
            </div>
          </div>
        </div>

        {/* Tooltip (follows cursor) */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border bg-white px-2 py-1 text-xs font-semibold shadow"
            style={{
              left: Math.min(Math.max(tooltip.x + 8, 4), size - 4),
              top: Math.min(Math.max(tooltip.y + 8, 4), size - 4),
              borderColor: '#E9EAF7',
              color: text,
              boxShadow: '0 8px 20px rgba(28,33,61,.12)',
              whiteSpace: 'nowrap',
            }}
          >
            {p.toFixed(1)}% {label}
            {copyOnClick && <span className="opacity-60"> • Click to copy</span>}
          </div>
        )}
      </div>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<'strong' | 'weak' | 'missing' | 'improve' | 'detail'>('strong');

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

  // ---- Metrics: keep your server matchPercentage if provided; also compute derived metrics
  const total = Math.max(1, strongSkills.length + weakSkills.length + missingSkills.length);
  const computedMatch = ((strongSkills.length + 0.6 * weakSkills.length) / total) * 100;
  const matchFinal = typeof matchPercentage === 'number' && !Number.isNaN(matchPercentage)
    ? clampPct(matchPercentage)
    : clampPct(computedMatch);
  const coverage = clampPct(((strongSkills.length + weakSkills.length) / total) * 100);
  const gapIndex = clampPct(((missingSkills.length + 0.4 * weakSkills.length) / total) * 100);

  // ---- Heuristic improvements (no backend change)
  const improvements = useMemo(() => {
    const topMissing = missingSkills.slice(0, 5).map((s) => ({
      skill: s,
      action: `Complete a mini-project or short course on ${s}`,
      expectedGainPercent: 8,
    }));
    const topWeak = weakSkills.slice(0, 5).map((s) => ({
      skill: s,
      action: `Practice 2–3 hands-on tasks in ${s}`,
      expectedGainPercent: 4,
    }));
    return [...topMissing, ...topWeak].slice(0, 6);
  }, [missingSkills, weakSkills]);

  async function exportPDF() {
    if (downloading) return;
    setDownloading(true);

    try {
      // NOTE: Keep your existing connection/signature as-is
      const html = reportToHTML({
        role: roleFromProp || '—',
        matchPercentage: matchPercentage ?? 0, // do not change your current arg
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

      const win = window.open(publicUrl, '_blank');
      if (!win) window.location.href = publicUrl;
    } catch (err) {
      console.error('Export PDF error:', err);
      alert(err instanceof Error ? err.message : 'PDF export failed');
    } finally {
      setDownloading(false);
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="space-y-6">
      {/* HEADER: Role + badges + Export */}
      <div
        className="rounded-2xl p-4 md:p-5 border"
        style={{
          background:
            'linear-gradient(135deg, rgba(77,77,189,.08), rgba(147,51,234,.08))',
          borderColor: '#E9EAF7',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#3D418A' }}>
              Role
            </div>
            <div className="text-2xl md:text-3xl font-extrabold" style={{ color: '#1B2230' }}>
              {roleFromProp || 'Target Role'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase px-3 py-2 rounded-full border"
              style={{ background: '#3D418A14', color: '#3D418A', borderColor: '#E9EAF7' }}
            >
              Match <span className="px-2 py-1 rounded-full bg-white border" style={{ borderColor: '#E9EAF7' }}>{matchFinal.toFixed(1)}%</span>
            </span>
            <span
              className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase px-3 py-2 rounded-full border"
              style={{ background: '#26B2911A', color: '#26B291', borderColor: '#26B29140' }}
            >
              Coverage <span className="px-2 py-1 rounded-full bg-white border" style={{ borderColor: '#26B29140' }}>{coverage.toFixed(1)}%</span>
            </span>
            <span
              className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase px-3 py-2 rounded-full border"
              style={{ background: '#eef2ff', color: '#3D418A', borderColor: '#E9EAF7' }}
            >
              Gap Index <span className="px-2 py-1 rounded-full bg-white border" style={{ borderColor: '#E9EAF7' }}>{gapIndex.toFixed(1)}%</span>
            </span>

<Button
          // variant="primary"
          onClick={exportPDF}
          disabled={downloading}
          className="disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          style={{ background: '#fff', color: '#3D418A', borderColor: '#3D418A33' }}
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
            {/* <Button
              onClick={exportPDF}
              className="inline-flex items-center gap-2 border"
              style={{ background: '#fff', color: '#3D418A', borderColor: '#3D418A33' }}
            >
              {downloading ? 'Exporting…' : 'Download as PDF'}
            </Button> */}
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Match', value: `${matchFinal.toFixed(1)}%`, hint: 'Overall score based on Strong/Weak' },
          { title: 'Coverage', value: `${coverage.toFixed(1)}%`, hint: 'Required skills covered (Strong + Weak)' },
          { title: 'Missing', value: `${missingSkills.length}`, hint: 'Skills not detected' },
          { title: 'Strong', value: `${strongSkills.length}`, hint: 'High-confidence skills' },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-2xl p-4 border bg-white"
            style={{ borderColor: '#E9EAF7', boxShadow: '0 10px 30px rgba(28,33,61,.08)' }}
          >
            <div className="text-sm font-semibold" style={{ color: '#6B7280' }}>{c.title}</div>
            <div className="mt-1 text-3xl font-black" style={{ color: '#1B2230' }}>{c.value}</div>
            <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>{c.hint}</div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div
          className="md:col-span-2 rounded-2xl p-5 border bg-white"
          style={{ borderColor: '#E9EAF7', boxShadow: '0 10px 30px rgba(28,33,61,.08)' }}
        >
          <h3 className="text-sm font-extrabold tracking-widest uppercase" style={{ color: '#3D418A' }}>
            Overall Match
          </h3>
          <div className="mt-4 flex items-center justify-center">
            <InteractiveDonut percent={matchFinal} label="Match" />
          </div>
        </div>

        <div
          className="md:col-span-3 rounded-2xl p-5 border bg-white"
          style={{ borderColor: '#E9EAF7', boxShadow: '0 10px 30px rgba(28,33,61,.08)' }}
        >
          <h3 className="text-sm font-extrabold tracking-widest uppercase" style={{ color: '#3D418A' }}>
            Distribution (Strong vs Weak vs Missing)
          </h3>
          <div className="mt-4">
            <StackedBar
              strong={strongSkills.length}
              weak={weakSkills.length}
              missing={missingSkills.length}
            />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div
        className="rounded-2xl border bg-white"
        style={{ borderColor: '#E9EAF7', boxShadow: '0 10px 30px rgba(28,33,61,.08)' }}
      >
        {/* Tab headers */}
        <div className="flex flex-wrap gap-2 p-3 border-b" style={{ borderColor: '#E9EAF7' }}>
          {[
            { key: 'strong', label: `Strong (${strongSkills.length})` },
            { key: 'weak', label: `Weak (${weakSkills.length})` },
            { key: 'missing', label: `Missing (${missingSkills.length})` },
            { key: 'improve', label: 'Improvements' },
            { key: 'detail', label: 'Match Detail' },
          ].map((t) => {
            const active = activeTab === (t.key as any);
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={[
                  'px-3 py-2 rounded-full text-sm font-bold transition-colors border',
                  active ? 'bg-white' : 'bg-[#F7F7FB]',
                ].join(' ')}
                style={{
                  color: active ? '#3D418A' : '#2F336F',
                  borderColor: active ? '#3D418A33' : '#E9EAF7',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {/* Strong */}
          {activeTab === 'strong' && (
            <div className="flex flex-wrap gap-2">
              {strongSkills.length === 0 ? (
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  No strong skills detected.
                </div>
              ) : (
                strongSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border bg-white"
                    style={{ borderColor: '#16a34a33', color: '#16a34a', boxShadow: '0 10px 30px rgba(28,33,61,.08)' }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: '#16a34a' }} />
                    {s}
                  </span>
                ))
              )}
            </div>
          )}

          {/* Weak */}
          {activeTab === 'weak' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {weakSkills.length === 0 ? (
                  <div className="text-sm" style={{ color: '#6B7280' }}>
                    No weak skills detected.
                  </div>
                ) : (
                  weakSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border bg-white"
                      style={{ borderColor: '#f59e0b33', color: '#b45309', boxShadow: '0 10px 30px rgba(28,33,61,.08)' }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                      {s}
                    </span>
                  ))
                )}
              </div>
              {weakSkills.length > 0 && (
                <div className="rounded-xl p-3 border bg-[#FFF] flex items-start gap-3" style={{ borderColor: '#E9EAF7' }}>
                  <span className="w-2.5 h-2.5 mt-1.5 rounded-full" style={{ background: '#f59e0b' }} />
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Tip: Weak skills add to Match %, but less than Strong. Quick practice can convert them into Strong.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Missing */}
          {activeTab === 'missing' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {missingSkills.length === 0 ? (
                  <div className="text-sm" style={{ color: '#6B7280' }}>
                    Great! No missing skills detected for this role.
                  </div>
                ) : (
                  missingSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border bg-white"
                      style={{ borderColor: '#ef444433', color: '#b91c1c', boxShadow: '0 10px 30px rgba(28,33,61,.08)' }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                      {s}
                    </span>
                  ))
                )}
              </div>
              {missingSkills.length > 0 && (
                <div className="rounded-xl p-3 border bg-[#FFF] flex items-start gap-3" style={{ borderColor: '#E9EAF7' }}>
                  <span className="w-2.5 h-2.5 mt-1.5 rounded-full" style={{ background: '#ef4444' }} />
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Missing skills have the highest negative impact on Match %. Target top 2–3 first.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Improvements */}
          {activeTab === 'improve' && (
            <div className="space-y-4">
              {/* Advice from backend (Markdown/JSON supported) */}
              {improvementAdvice && (
                <div
                  className="rounded-xl p-4 border bg-white"
                  style={{ borderColor: '#E9EAF7', boxShadow: '0 10px 30px rgba(28,33,61,.08)' }}
                >
                  <div className="text-sm font-extrabold tracking-widest uppercase mb-2" style={{ color: '#3D418A' }}>
                    Advice
                  </div>
                  <AdviceBlock className="whitespace-pre-line" text={decodeHtml(improvementAdvice)} />
                </div>
              )}

              {/* Heuristic actionable items */}
              {improvements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {improvements.map((im, i) => (
                    <div
                      key={`${im.skill}-${i}`}
                      className="rounded-xl p-4 border bg-white"
                      style={{ borderColor: '#E9EAF7', boxShadow: '0 6px 16px rgba(28,33,61,.06)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold" style={{ color: '#1B2230' }}>
                            {im.skill}
                          </div>
                          <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                            {im.action}
                          </div>
                        </div>
                        <span
                          className="text-xs font-extrabold tracking-widest uppercase px-2 py-1 rounded-full border"
                          style={{ color: '#3D418A', background: '#fff', borderColor: '#E9EAF7' }}
                        >
                          +{im.expectedGainPercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  Nothing to recommend — looks solid!
                </div>
              )}
            </div>
          )}

          {/* Match Detail */}
          {activeTab === 'detail' && (
            <div className="overflow-x-auto">
              <table className="min-w-full border" style={{ borderColor: '#E9EAF7' }}>
                <thead>
                  <tr className="bg-[#F7F7FB]">
                    <th className="px-3 py-2 text-left text-xs font-extrabold uppercase tracking-widest" style={{ color: '#3D418A' }}>
                      Skill
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-extrabold uppercase tracking-widest" style={{ color: '#3D418A' }}>
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-extrabold uppercase tracking-widest" style={{ color: '#3D418A' }}>
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {strongSkills.map((s) => (
                    <tr key={`s-${s}`} className="border-t" style={{ borderColor: '#E9EAF7' }}>
                      <td className="px-3 py-2 text-sm" style={{ color: '#1B2230' }}>{s}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#16a34a' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: '#16a34a' }} />
                          Strong
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm" style={{ color: '#6B7280' }}>Detected with high confidence.</td>
                    </tr>
                  ))}
                  {weakSkills.map((s) => (
                    <tr key={`w-${s}`} className="border-t" style={{ borderColor: '#E9EAF7' }}>
                      <td className="px-3 py-2 text-sm" style={{ color: '#1B2230' }}>{s}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#b45309' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                          Weak
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm" style={{ color: '#6B7280' }}>Mentioned but needs strengthening.</td>
                    </tr>
                  ))}
                  {missingSkills.map((s) => (
                    <tr key={`m-${s}`} className="border-t" style={{ borderColor: '#E9EAF7' }}>
                      <td className="px-3 py-2 text-sm" style={{ color: '#1B2230' }}>{s}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#b91c1c' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                          Missing
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm" style={{ color: '#6B7280' }}>Not detected in resume.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Export Button (kept) */}
      <div className="flex gap-2">
        {/* <Button
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
        </Button> */}
      </div>

      {/* Footer note */}
      <div className="text-xs text-right" style={{ color: '#6B7280' }}>
        Computed using counts. Similarity reuse (if any) handled upstream.
      </div>
    </div>
  );
}
