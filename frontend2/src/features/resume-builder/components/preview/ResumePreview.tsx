
'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  createRef,
} from 'react';

import TemplatePicker from '@/features/resume-builder/components/TemplatePicker';
import type { Resume } from '@/features/resume-builder/types/resume';
import { splitIntoSentences } from '@/features/resume-builder/lib/textSplit';
import type { TemplateId } from '@/features/resume-builder/constants/resume.constants';

import ClassicTemplate from '@/features/resume-builder/templates/ClassicTemplate';
import DesignXTemplate from '@/features/resume-builder/templates/DesignXTemplate';
import CompactTemplate from '@/features/resume-builder/templates/CompactTemplate';

/** ✅ Define TemplateProps for type safety */
type TemplateProps = {
  resume: Resume;
  children?: React.ReactNode;
};

/**
 * Template registry
 */
const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<TemplateProps>> = {
  ats: ClassicTemplate,
  'two-column': CompactTemplate,
  'design-x': DesignXTemplate,
  color: DesignXTemplate, // backward-compatible alias
};

type Props = {
  resume: Resume;
  templateId?: TemplateId;
  accentColor?: string;
  fontFamily?: string;
  mode?: 'builder' | 'print'; // <-- NEW
};

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_PX_DEFAULT = 794;
const A4_HEIGHT_PX_DEFAULT = 1123;
const MIN_SCALE = 0.35;
const MAX_SCALE = 2.0;

const FOOTER_RESERVE_PX = 64;
const CONTENT_TOP_PX = 32;
const CONTENT_BOTTOM_PX = 0;
const CONTENT_PADDING_PX = CONTENT_TOP_PX + CONTENT_BOTTOM_PX;
const SAFE_BUFFER_PX = 2;
const OVERFLOW_GUARD_PX = 8;
const LAST_LINE_THRESHOLD_PX = 10;


type Chunk = { key: string; node: React.ReactNode };
type Rect = { top: number; bottom: number; height: number };

/** Map template -> heading classes */
function getTemplateClasses(id: TemplateId | 'color') {
  return {
    name:
      id === 'two-column'
        ? 'text-xl font-semibold text-gray-900'
        : 'text-2xl font-bold text-gray-900',
    sectionTitle:
      id === 'design-x' || id === 'color'
        ? 'text-xs font-semibold tracking-wider uppercase text-[var(--accent)] mb-2'
        : 'section-title mb-2',
  };
}

/** ===========================
 * Two-column helpers (as per your request)
 * =========================== */
const isTwoColumnTemplate = (id: TemplateId | 'color') => id === 'two-column';

/** Header should be full-width (top), not inside grid */
const isHeaderKey = (key: string) => key.startsWith('header-');


/** LEFT column should contain Skills (labels + chips) */
const isLeftColumnKey = (key: string) =>
  key.startsWith('skills-') || key.startsWith('skill-');
// or: const isLeftColumnKey = (key: string) => /^skills?-/i.test(key);

/** RIGHT column contains Experience + Education (i.e., not header, not skills) */
const isRightColumnKey = (key: string) => !isHeaderKey(key) && !isLeftColumnKey(key);

export default function ResumePreview({
  resume,
  templateId = 'ats',
  accentColor = '#0ea5e9',
  fontFamily = 'inherit',
  mode = 'builder',
}: Props) {
  // ✅ Local state to manage template selection in builder (kept as-is)
  const [selectedTemplateId] = useState<TemplateId>(templateId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [fitToScreen, setFitToScreen] = useState(true);

  const [A4WidthPxReal, setA4WidthPxReal] = useState<number>(A4_WIDTH_PX_DEFAULT);
  const [A4HeightPxReal, setA4HeightPxReal] = useState<number>(A4_HEIGHT_PX_DEFAULT);

  
  // ADD below existing refs/state near containerRef/scale
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Panning/drag support (works in normal + fullscreen)
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  // Separate ref for fullscreen scroll container
  const fullscreenRef = useRef<HTMLDivElement>(null);
  
  // Prevent auto-centering during/after drag
  const [suppressAutoCenter, setSuppressAutoCenter] = useState(false);

  // Track if mouse actually moved to treat mouseup as drag (not click)
  const [dragMoved, setDragMoved] = useState(false);

  // Measure real pixels for A4 (mm -> px on this device)
  useEffect(() => {
    const probe = document.createElement('div');
    probe.style.position = 'fixed';
    probe.style.left = '-9999px';
    probe.style.top = '0';
    probe.style.width = `${A4_WIDTH_MM}mm`;
    probe.style.height = `${A4_HEIGHT_MM}mm`;
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);

    // ✅ Defer state update to avoid cascading renders
    requestAnimationFrame(() => {
      setA4WidthPxReal(probe.clientWidth);
      setA4HeightPxReal(probe.clientHeight);
      document.body.removeChild(probe);
    });
  }, []);

  // === PRINT sizing (mm) — keep measure & render identical ===
  const PADDING_MM_PRINT = 15; // ← text inset; set 0 for edge-to-edge text
  const FOOTER_MM_PRINT = 20; // ← footer height in mm (0 = hide footer)
  const ACCENT_STRIP_MM = 8; // ← blue strip thickness (increase from 6 to 8mm)

  // Content box (mm) inside the page
  const CONTENT_WIDTH_MM_PRINT = A4_WIDTH_MM - 2 * PADDING_MM_PRINT;
  const CONTENT_HEIGHT_MM_PRINT = A4_HEIGHT_MM - 2 * PADDING_MM_PRINT - FOOTER_MM_PRINT;

  // px per mm from measured A4 height
  const pxPerMm = A4HeightPxReal / A4_HEIGHT_MM;

  const HEADER_RESERVE_MM = 18; // try 16–22mm

  // Per-page usable height in px (drives pagination cap)
  const PAGE_CONTENT_MAX =
    mode === 'print'
      ? Math.max(
          0,
          A4HeightPxReal - pxPerMm * (2 * PADDING_MM_PRINT + FOOTER_MM_PRINT) - SAFE_BUFFER_PX
        )
      : Math.max(0, A4HeightPxReal - FOOTER_RESERVE_PX - CONTENT_PADDING_PX - SAFE_BUFFER_PX);

  // Content height in mm fed to templates
  const CONTENT_MAX_MM =
    mode === 'print'
      ? CONTENT_HEIGHT_MM_PRINT
      : (PAGE_CONTENT_MAX / A4HeightPxReal) * A4_HEIGHT_MM - HEADER_RESERVE_MM;

  const recalcFit = () => {
    const el = containerRef.current;
    if (!el) return;
    const pad = 24;
    const w = Math.max(0, el.clientWidth - pad);
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, w / A4WidthPxReal));
    setScale(next);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !fitToScreen) return;
    recalcFit();
    const obs = new ResizeObserver(recalcFit);
    obs.observe(el);
    return () => obs.disconnect();
  }, [fitToScreen, A4WidthPxReal]);

  
  const centerPreview = (opts?: { vertical?: 'top' | 'middle' }) => {
    if (suppressAutoCenter) return; // ⛔️ skip while/just-after drag
    const el = containerRef.current;
    if (!el) return;
    const left = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    const top =
      opts?.vertical === 'middle'
        ? Math.max(0, (el.scrollHeight - el.clientHeight) / 2)
        : 0;
    el.scrollTo({ left, top, behavior: 'smooth' });
  };


  const handleFit = () => {
    setFitToScreen(true);
    requestAnimationFrame(() => setTimeout(() => centerPreview(), 50));
  };

  const onClickPage = () => {
    setFitToScreen(false);
    setScale(1.0);
    setTimeout(() => centerPreview({ vertical: 'middle' }), 10);
  };

  
// Minimum zoom for fullscreen (normal view untouched)
const FS_MIN_SCALE = 1.05; // 115% — change to 1.20 or 1.25 if you want bigger
const effectiveFsScale = Math.max(scale, FS_MIN_SCALE);

  // ADD helpers for fullscreen
  
const enterFullScreen = () => {
  setIsFullScreen(true);
  setFitToScreen(false);
  // Prevent body scroll under overlay
  document.documentElement.style.overflow = 'hidden';

  // ✅ open from TOP-LEFT (no centering)
  setTimeout(() => {
    if (fullscreenRef.current) {
      fullscreenRef.current.scrollTo({ left: 0, top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, 30);
};


  const exitFullScreen = () => {
    setIsFullScreen(false);
    // Restore body scroll
    document.documentElement.style.overflow = '';
  };

  // ESC to exit fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) exitFullScreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullScreen]);

  
// ADD: Shared pan handlers. Will attach to both containers.

const beginPan = (e: React.MouseEvent, which: 'normal' | 'fullscreen') => {
  const container = which === 'fullscreen' ? fullscreenRef.current : containerRef.current;
  if (!container) return;

  setIsPanning(true);
  setSuppressAutoCenter(true);   // 🚫 disable auto-center while dragging
  setDragMoved(false);           // reset moved flag

  container.style.cursor = 'grabbing';
  container.style.userSelect = 'none';

  panStartRef.current = {
    x: e.clientX,
    y: e.clientY,
    scrollLeft: container.scrollLeft,
    scrollTop: container.scrollTop,
  };
};

const doPan = (e: React.MouseEvent, which: 'normal' | 'fullscreen') => {
  if (!isPanning || !panStartRef.current) return;
  const container = which === 'fullscreen' ? fullscreenRef.current : containerRef.current;
  if (!container) return;

  const dx = e.clientX - panStartRef.current.x;
  const dy = e.clientY - panStartRef.current.y;

  container.scrollLeft = panStartRef.current.scrollLeft - dx;
  container.scrollTop = panStartRef.current.scrollTop - dy;

  if (Math.abs(dx) + Math.abs(dy) > 3) {
    setDragMoved(true); // mark real movement so click won't fire
  }
};

const endPan = (which: 'normal' | 'fullscreen') => {
  setIsPanning(false);
  const container = which === 'fullscreen' ? fullscreenRef.current : containerRef.current;
  if (container) {
    container.style.cursor = '';
    container.style.userSelect = '';
  }
  panStartRef.current = null;

  // thoda delay ke baad auto-center allow karo
  setTimeout(() => setSuppressAutoCenter(false), 50);
};


  const header = useMemo(() => resume.personal, [resume.personal]);

  const Template = TEMPLATE_COMPONENTS[templateId] ?? ClassicTemplate;
  const classes = useMemo(() => getTemplateClasses(templateId), [templateId]);
  const isTwoColumn = isTwoColumnTemplate(templateId);

  /** ===========================
   * Build content as "chunks"
   * =========================== */
  const chunks: Chunk[] = useMemo(() => {
    const list: Chunk[] = [];

    const photoUrl = resume.personal.photo;
    const photoPosition = resume.personal.photoPosition ?? 'right';

    const PHOTO_RIGHT_CLASS =
      'h-35 w-35 rounded-lg overflow-hidden border border-gray-200'; // square & bigger
    const PHOTO_LEFT_CLASS =
      'h-30 w-30 rounded-full overflow-hidden border border-gray-200'; // circle

    // Header block (full-width)
    list.push({
      key: 'header-main',
      node: (
        <>
          {photoUrl && photoPosition === 'right' ? (
            // RIGHT: name + square bigger avatar
            <div className="grid grid-cols-[1fr_auto] gap-4 items-start mb-2">
              <div>
                <h1 className={classes.name}>{header.fullName || 'Your Name'}</h1>
                {(header.title ||
                  header.location ||
                  header.email ||
                  header.phone ||
                  header.website) && (
                  <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {header.title && <span>{header.title}</span>}
                    {header.location && <span>{header.location}</span>}
                    {header.email && <span>{header.email}</span>}
                    {header.phone && <span>{header.phone}</span>}
                    {header.website && <span>{header.website}</span>}
                  </div>
                )}
              </div>

              <div className={PHOTO_RIGHT_CLASS}>
                <img
                  src={photoUrl}
                  alt="Profile"
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : (
            // LEFT or no photo: circle avatar left, text right
            <div className="grid grid-cols-[auto_1fr] gap-4 items-center mb-2">
              {photoUrl ? (
                <div className={PHOTO_LEFT_CLASS}>
                  <img
                    src={photoUrl}
                    alt="Profile"
                    crossOrigin="anonymous"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}

              <div>
                <h1 className={classes.name}>{header.fullName || 'Your Name'}</h1>
                {(header.title ||
                  header.location ||
                  header.email ||
                  header.phone ||
                  header.website) && (
                  <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {header.title && <span>{header.title}</span>}
                    {header.location && <span>{header.location}</span>}
                    {header.email && <span>{header.email}</span>}
                    {header.phone && <span>{header.phone}</span>}
                    {header.website && <span>{header.website}</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ),
    });

    // Summary by sentences (still full-width, part of header area)
    // Summary — render as a single block, preserve user newlines
    if (header.summary) {
      list.push({
        key: 'header-summary',
        node: (
          <div className="text-sm text-gray-700 mt-3 whitespace-pre-line break-words">
            {header.summary}
          </div>
        ),
      });
      list.push({ key: 'header-divider', node: <div className="border-b border-gray-200 my-4" /> });
    } else {
      list.push({
        key: 'header-divider-nosummary',
        node: <div className="border-b border-gray-200 my-4" />,
      });
    }

    // Experience (RIGHT column)
    if (resume.experience.length > 0) {
      list.push({ key: 'exp-title', node: <h2 className={classes.sectionTitle}>Experience</h2> });

      resume.experience.forEach((exp) => {
        list.push({
          key: `exp-head-${exp.id}`,
          node: (
            <div className="mb-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <div className="font-semibold text-gray-800">
                  {exp.role || 'Role'}{' '}
                  <span className="text-gray-500">— {exp.company || 'Company'}</span>
                </div>
                {(exp.startDate || exp.endDate) && (
                  <span className="text-xs text-gray-600">
                    • {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                  </span>
                )}
              </div>
              {exp.location && <div className="text-xs text-gray-600">{exp.location}</div>}
            </div>
          ),
        });

        (exp.bullets ?? [])
          .filter(Boolean)
          .forEach((b, i) => {
            list.push({
              key: `exp-bullet-${exp.id}-${i}`,
              node: (
                <div className="ml-5 text-sm text-gray-700 mb-1">
                  <span className="inline-block mr-2">•</span>
                  <span>{b}</span>
                </div>
              ),
            });
          });

        list.push({ key: `exp-gap-${exp.id}`, node: <div className="h-2" /> });
      });
    }

    // Education (RIGHT column)
    if (resume.education.length > 0) {
      list.push({ key: 'edu-title', node: <h2 className={classes.sectionTitle}>Education</h2> });

      resume.education.forEach((ed) => {
        list.push({
          key: `edu-head-${ed.id}`,
          node: (
            <div className="mb-1">
              <div className="font-semibold text-gray-800">
                {ed.degree || 'Degree'} {ed.field ? `— ${ed.field}` : ''}{' '}
                <span className="text-gray-500">at {ed.institution || 'Institution'}</span>
              </div>
              <div className="text-xs text-gray-600">
                {ed.location}{' '}
                {(ed.startDate || ed.endDate) && (
                  <span>
                    {' · '}
                    {ed.startDate} {ed.endDate ? `— ${ed.endDate}` : ''}
                  </span>
                )}
              </div>
            </div>
          ),
        });

        if (ed.description) {
          splitIntoSentences(ed.description).forEach((s, i) => {
            list.push({
              key: `edu-desc-${ed.id}-${i}`,
              node: <p className="text-sm text-gray-700 mb-2">{s}</p>,
            });
          });
        }

        list.push({ key: `edu-gap-${ed.id}`, node: <div className="h-2" /> });
      });
    }

 
      // Skills (LEFT column in two-column; horizontal wrapping in ATS/DesignX)
      if (resume.skills.length > 0) {
        const hasHard = resume.skills.some((s) => (s.category ?? 'Hard') === 'Hard');
        const hasSoft = resume.skills.some((s) => s.category === 'Soft');

        list.push({ key: 'skills-title', node: <h2 className={classes.sectionTitle}>Skills</h2> });

        if (hasHard) {
          // Label
          list.push({
            key: 'skills-hard-label',
            node: <div className="text-xs font-semibold text-gray-500 mb-1">Hard Skills</div>,
          });

          // ✅ Group ALL hard skill chips in a single flex-wrap container (so they line up horizontally)
          const hardChips = resume.skills
            .filter((s) => (s.category ?? 'Hard') === 'Hard')
            .map((s, i) => (
              <span
                key={`chip-hard-${s.name}-${i}`}
                className="inline-flex items-center mr-2 mb-2.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs border border-gray-200"
              >
                {s.name}
                {s.level && <span className="ml-1 text-gray-500">({s.level})</span>}
              </span>
            ));

          // NOTE: key starts with 'skills-' so it stays on LEFT in the two-column filter
          list.push({
            key: 'skills-hard-chips',
            node: <div className="flex flex-wrap gap-y-1">{hardChips}</div>,
          });

          list.push({ key: 'skills-hard-gap', node: <div className="h-2" /> });
        }

        if (hasSoft) {
          // Label
          list.push({
            key: 'skills-soft-label',
            node: <div className="text-xs font-semibold text-gray-500 mb-1">Soft Skills</div>,
          });

          // ✅ Group ALL soft skill chips in a single flex-wrap container
          const softChips = resume.skills
            .filter((s) => s.category === 'Soft')
            .map((s, i) => (
              <span
                key={`chip-soft-${s.name}-${i}`}
                className="inline-flex items-center mr-2 mb-2.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs border border-gray-200"
              >
                {s.name}
                {s.level && <span className="ml-1 text-gray-500">({s.level})</span>}
              </span>
            ));

          list.push({
            key: 'skills-soft-chips',
            node: <div className="flex flex-wrap gap-y-1">{softChips}</div>,
          });

          list.push({ key: 'skills-soft-gap', node: <div className="h-2" /> });
        }
      }


    return list;
  }, [resume, header, classes]);

  /** ===========================
   * Measure chunk positions (off-screen A4 width)
   * =========================== */
  const measureContentRef = useRef<HTMLDivElement>(null);
  const measureRefs = useMemo(() => chunks.map(() => createRef<HTMLDivElement>()), [chunks]);
  const [measuredRects, setMeasuredRects] = useState<Rect[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      const contentRect = measureContentRef.current?.getBoundingClientRect();
      const contentTop = contentRect?.top ?? 0;

      const rects: Rect[] = measureRefs.map((r) => {
        const rect = r.current?.getBoundingClientRect();
        if (!rect) return { top: 0, bottom: 0, height: 0 };
        const top = rect.top - contentTop;
        const bottom = rect.bottom - contentTop;
        return {
          top: Math.ceil(top),
          bottom: Math.ceil(bottom),
          height: Math.ceil(rect.height),
        };
      });

      setMeasuredRects(rects);
    };

    // Wait for fonts for accurate wrap
    if ('fonts' in document && document.fonts.ready instanceof Promise) {
      document.fonts.ready.then(() => requestAnimationFrame(measure));
    } else {
      requestAnimationFrame(measure);
    }
  }, [chunks, measureRefs]);

  /** ===========================
   * Paginate (rect-based) with guard margins — two-column aware
   * =========================== */
  const pages = useMemo<Chunk[][]>(() => {
    const cap = PAGE_CONTENT_MAX - OVERFLOW_GUARD_PX;

    // Fallback pagination prior to exact measurement
    if (!measuredRects.length || measuredRects.length !== chunks.length) {
      const nextPages: Chunk[][] = [];
      let curr: Chunk[] = [];
      let currH = 0;

      chunks.forEach((chunk, idx) => {
        const h = measuredRects[idx]?.height ?? 24;
        const tooTall = h > cap;

        if (tooTall && curr.length > 0) {
          nextPages.push(curr);
          curr = [chunk];
          currH = h;
        } else if (currH + h > cap && curr.length > 0) {
          nextPages.push(curr);
          curr = [chunk];
          currH = h;
        } else {
          curr.push(chunk);
          currH += h;
        }

        const leftover = PAGE_CONTENT_MAX - currH;
        if (leftover > 0 && leftover < LAST_LINE_THRESHOLD_PX && curr.length > 1) {
          const last = curr.pop()!;
          nextPages.push(curr);
          curr = [last];
          currH = h;
        }
      });
      if (curr.length) nextPages.push(curr);
      return nextPages.length ? nextPages : [chunks];
    }

    // ✅ Precise pagination using measured rects (max bottom across columns)
    const nextPages: Chunk[][] = [];
    let curr: Chunk[] = [];
    let pageStart = 0;       // top of the current page section (in measuring coords)
    let currMaxBottom = 0;   // max bottom across accepted chunks on this page

    chunks.forEach((chunk, i) => {
      const rect = measuredRects[i];
      const tooTall = rect.height > cap;

      const proposedMaxBottom = Math.max(currMaxBottom || pageStart, rect.bottom);
      const usedIfAdded = proposedMaxBottom - pageStart;

      if (tooTall && curr.length > 0) {
        nextPages.push(curr);
        curr = [chunk];
        pageStart = currMaxBottom || pageStart; // new page starts where prev ended
        currMaxBottom = rect.bottom;
        return;
      }

      if (usedIfAdded > cap && curr.length > 0) {
        nextPages.push(curr);
        curr = [chunk];
        pageStart = currMaxBottom || pageStart;
        currMaxBottom = rect.bottom;
        return;
      }

      // Accept this chunk
      curr.push(chunk);
      currMaxBottom = proposedMaxBottom;

      const usedNow = currMaxBottom - pageStart;
      const leftover = PAGE_CONTENT_MAX - usedNow;
      if (leftover > 0 && leftover < LAST_LINE_THRESHOLD_PX && curr.length > 1) {
        const last = curr.pop()!;
        nextPages.push(curr);
        curr = [last];
        pageStart = currMaxBottom - rect.height; // conservative
        currMaxBottom = rect.bottom;
      }
    });

    if (curr.length) nextPages.push(curr);
    return nextPages.length ? nextPages : [chunks];
  }, [chunks, measuredRects, PAGE_CONTENT_MAX]);

  /** ===========================
   * Derived preview sizes (builder mode)
   * =========================== */
  const mmToPx = (mm: number) => (A4HeightPxReal / A4_HEIGHT_MM) * mm;
  const PAGE_GAP_MM = 6;
  const pageGapPx = mmToPx(PAGE_GAP_MM) * scale;
  const scaledPageWidth = A4WidthPxReal * scale;
  const scaledPageHeight = A4HeightPxReal * scale;

  /** ===========================
   * PRINT MODE: plain A4 pages, no toolbar/scale
   * =========================== */
  const showAccentSidebar = templateId === 'design-x' && ACCENT_STRIP_MM > 0;
  if (mode === 'print') {
    // DEBUG
    console.log('[print] pages =', pages.length);

    return (
      <>
        <div id="resume-preview-print" className="print-root">
          {pages.map((page, pIdx) => (
            <div
              key={`print-page-${pIdx}`}
              className="page"
              style={{
                width: `${A4_WIDTH_MM}mm`,
                height: `${A4_HEIGHT_MM}mm`,
                background: '#fff',
                position: 'relative',
                overflow: 'hidden',
                ['--accent' as string]: accentColor,
                fontFamily,
              } as React.CSSProperties}
            >
              {/* FULL-BLEED accent strip */}
              
              
              {showAccentSidebar && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${ACCENT_STRIP_MM}mm`,
                    background: 'var(--accent)',
                  }}
                />
              )}


              {/* CONTENT BOX — absolute mm-based, MATCHES measuring box */}
              <Template resume={resume}>
                <div
                  className="box-content"
                  style={{
                    position: 'absolute',
                    left: `${PADDING_MM_PRINT}mm`,
                    top: `${PADDING_MM_PRINT}mm`,
                    width: `${CONTENT_WIDTH_MM_PRINT}mm`,
                    height: `${CONTENT_HEIGHT_MM_PRINT}mm`,
                    overflow: 'hidden',
                    fontFamily,
                  }}
                >
                  {/* Header full-width first */}
                  {page
                    .filter((chunk) => isHeaderKey(chunk.key))
                    .map((chunk) => (
                      <div key={chunk.key}>{chunk.node}</div>
                    ))}

                  {/* Two columns below header — LEFT wider (3fr) for Skills, RIGHT (2fr) for Exp/Edu */}
                  {isTwoColumn ? (
                    <div className="grid gap-x-6" style={{ gridTemplateColumns: '1fr 4fr' }}>
                      {/* LEFT: Skills */}
                      <div className="space-y-2.5">
                        {page
                          .filter((chunk) => isLeftColumnKey(chunk.key))
                          .map((chunk) => (
                            <div key={chunk.key}>{chunk.node}</div>
                          ))}
                      </div>
                      {/* RIGHT: Experience + Education */}
                      <div>
                        {page
                          .filter((chunk) => isRightColumnKey(chunk.key))
                          .map((chunk) => (
                            <div key={chunk.key}>{chunk.node}</div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    // Non two-column → render rest in flow
                    page
                      .filter((chunk) => !isHeaderKey(chunk.key))
                      .map((chunk) => <div key={chunk.key}>{chunk.node}</div>)
                  )}
                </div>
              </Template>

              {/* Footer (print) — shown only if FOOTER_MM_PRINT > 0 */}
              {FOOTER_MM_PRINT > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 flex items-center text-[11px] text-gray-400 border-t border-gray-200"
                  style={{
                    height: `${FOOTER_MM_PRINT}mm`,
                    paddingLeft: `${PADDING_MM_PRINT}mm`,
                    paddingRight: `${PADDING_MM_PRINT}mm`,
                  }}
                >
                  <span>Page {pIdx + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hidden measuring container (PRINT) — SAME mm content width, NO px padding */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: -100000,
            top: 0,
            width: `${CONTENT_WIDTH_MM_PRINT}mm`, // ✅ MATCH render content width
            pointerEvents: 'none',
            visibility: 'hidden',
            ['--accent' as string]: accentColor,
            fontFamily,
          }}
        >
          <Template resume={resume}>
            <div ref={measureContentRef} style={{ fontFamily, ['--accent' as string]: accentColor }}>
              {/* Header full-width in measuring layout */}
              {chunks.map((chunk, i) =>
                isHeaderKey(chunk.key) ? (
                  <div key={`measure-${chunk.key}`} ref={measureRefs[i]}>
                    {chunk.node}
                  </div>
                ) : null
              )}

              {/* Two columns below header — mirror actual render */}
              {isTwoColumn ? (
                <div className="grid gap-x-6" style={{ gridTemplateColumns: '1fr 4fr' }}>
                  {/* LEFT: Skills */}
                  <div className="space-y-2.5">
                    {chunks.map((chunk, i) =>
                      isLeftColumnKey(chunk.key) ? (
                        <div key={`measure-${chunk.key}`} ref={measureRefs[i]}>
                          {chunk.node}
                        </div>
                      ) : null
                    )}
                  </div>
                  {/* RIGHT: Experience + Education */}
                  <div>
                    {chunks.map((chunk, i) =>
                      isRightColumnKey(chunk.key) ? (
                        <div key={`measure-${chunk.key}`} ref={measureRefs[i]}>
                          {chunk.node}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              ) : (
                // Non two-column measuring
                chunks.map((chunk, i) =>
                  !isHeaderKey(chunk.key) ? (
                    <div key={`measure-${chunk.key}`} ref={measureRefs[i]}>
                      {chunk.node}
                    </div>
                  ) : null
                )
              )}
            </div>
          </Template>
        </div>
      </>
    );
  }

  /** ===========================
   * BUILDER MODE: toolbar + zoom + scaled canvas
   * =========================== */
  return (
    
    <div id="resume-preview" className="h-full w-full flex flex-col">
      {/* Toolbar (builder only) */}
      <div className="flex items-center justify-between mb-2 preview-toolbar">
        <div className="text-sm text-gray-600">
          Preview (A4) — Use Fit / 100% or click a page to center
        </div>
        <div className="flex items-center gap-2 zoom-bar">
          <button
            className="btn-ghost"
            onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - 0.1).toFixed(2)))}
          >
            −
          </button>
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step="0.05"
            value={scale}
            onChange={(e) => {
              setFitToScreen(false);
              setScale(parseFloat(e.target.value));
            }}
          />
          <button
            className="btn-ghost"
            onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + 0.1).toFixed(2)))}
          >
            +
          </button>
          <button className="btn-secondary" onClick={handleFit} title="Fit to screen">
            Fit
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setFitToScreen(false);
              setScale(1.0);
              setTimeout(() => centerPreview(), 10);
            }}
            title="Actual size"
          >
            100%
          </button>
          
          
<button
  className="btn-secondary flex items-center gap-1"
  onClick={enterFullScreen}
  title="Full Screen"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  {/* Full Screen */}
</button>


        </div>
      </div>

      {/* Scaled preview window (builder only) */}
      <div
        ref={containerRef}
        className="relative flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3 overflow-y-auto overflow-x-auto viewer-overlay"
        style={{ scrollBehavior: 'smooth' , cursor: isPanning ? 'grabbing' : 'grab' }}        
        onMouseDown={(e) => {
          if (e.button !== 0) return; // only left click
          e.preventDefault();         // avoid text/image selection interference
          beginPan(e, 'normal');
        }}
        onMouseMove={(e) => doPan(e, 'normal')}
        onMouseUp={() => endPan('normal')}
        onMouseLeave={() => endPan('normal')}
      >
        
        {/* Hover overlay to prompt full screen */}
        <div
          className="pointer-events-auto"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '8px',
          }}
        >
          {/* <button
            className="btn-secondary"
            onClick={enterFullScreen}
            title="Click to Full Screen"
          >
            ☐
          </button> */}
        </div>

        
        {pages.map((page, pIdx) => (
          
        <div
          key={`page-wrap-${pIdx}`}
          className={"relative mx-auto"}
          style={{
            width: `${scaledPageWidth}px`,
            height: `${scaledPageHeight}px`,
            marginBottom: `${pageGapPx}px`,
          }}
          onClick={() => {
            if (dragMoved || isPanning) return;
            onClickPage();
          }}
        >
            <div
              className="relative z-0 shadow-md bg-white overflow-hidden will-change-transform"
              style={{
                width: `${A4_WIDTH_MM}mm`,
                height: `${A4_HEIGHT_MM}mm`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                ['--accent' as string]: accentColor,
                fontFamily,
              }}
            >
              <div className="h-full w-full">
                <Template resume={resume}>
                  <div
                    className="box-content px-10 pb-0"
                    style={{
                      paddingTop: `${HEADER_RESERVE_MM}mm`, // header space
                      height: `${CONTENT_MAX_MM}mm`,
                      overflow: 'hidden',
                      fontFamily,
                      ['--accent' as string]: accentColor,
                    } as React.CSSProperties}
                  >
                    {/* Header full-width first */}
                    {page
                      .filter((chunk) => isHeaderKey(chunk.key))
                      .map((chunk) => (
                        <div key={chunk.key}>{chunk.node}</div>
                      ))}

                    {/* Two columns below header — LEFT wider (3fr) for Skills, RIGHT (2fr) for Exp/Edu */}
                    {isTwoColumn ? (
                      <div className="grid gap-x-6" style={{ gridTemplateColumns: '1fr 4fr' }}>
                        {/* LEFT: Skills */}
                        <div className="space-y-2.5">
                          {page
                            .filter((chunk) => isLeftColumnKey(chunk.key))
                            .map((chunk) => (
                              <div key={chunk.key}>{chunk.node}</div>
                            ))}
                        </div>
                        {/* RIGHT: Experience + Education */}
                        <div>
                          {page
                            .filter((chunk) => isRightColumnKey(chunk.key))
                            .map((chunk) => (
                              <div key={chunk.key}>{chunk.node}</div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      // Non two-column → render rest in flow
                      page
                        .filter((chunk) => !isHeaderKey(chunk.key))
                        .map((chunk) => <div key={chunk.key}>{chunk.node}</div>)
                    )}
                  </div>
                </Template>

                {/* Footer reserve */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex items-center px-10 text-[11px] text-gray-400 border-t border-gray-200"
                  style={{ height: `${FOOTER_RESERVE_PX}px` }}
                >
                  <span>Page {pIdx + 1}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden measuring container (builder mode) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: -100000,
          top: 0,
          width: `${A4_WIDTH_MM}mm`,
          pointerEvents: 'none',
          visibility: 'hidden',
          ['--accent' as string]: accentColor,
          fontFamily,
        }}
      >
        <Template resume={resume}>
          <div
            className="px-10 pb-0"
            ref={measureContentRef}
            style={{
              paddingTop: `${HEADER_RESERVE_MM}mm`,
              fontFamily,
              ['--accent' as string]: accentColor,
            } as React.CSSProperties}
          >
            {/* Header full-width measuring */}
            {chunks.map((chunk, i) =>
              isHeaderKey(chunk.key) ? (
                <div key={`measure-${chunk.key}`} ref={measureRefs[i]}>
                  {chunk.node}
                </div>
              ) : null
            )}

            {/* Two columns below header — mirror actual render */}
            {isTwoColumn ? (
              <div className="grid gap-x-6" style={{ gridTemplateColumns: '1fr 4fr' }}>
                {/* LEFT: Skills */}
                <div className="space-y-2.5">
                  {chunks.map((chunk, i) =>
                    isLeftColumnKey(chunk.key) ? (
                      <div key={`measure-${chunk.key}`} ref={measureRefs[i]}>
                        {chunk.node}
                      </div>
                    ) : null
                  )}
                </div>
                {/* RIGHT: Experience + Education */}
                <div>
                  {chunks.map((chunk, i) =>
                    isRightColumnKey(chunk.key) ? (
                      <div key={`measure-${chunk.key}`} ref={measureRefs[i]}>
                        {chunk.node}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ) : (
              // Non two-column measuring
              chunks.map((chunk, i) =>
                !isHeaderKey(chunk.key) ? (
                  <div key={`measure-${chunk.key}`} ref={measureRefs[i]}>
                    {chunk.node}
                  </div>
                ) : null
              )
            )}
          </div>
        </Template>
      </div>
      
{isFullScreen && (
  <div
    className="fixed inset-0 z-50 bg-black/70"
  >
    {/* Close (X) button */}
    <button
      onClick={exitFullScreen}
      className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-md px-3 py-1.5"
      title="Exit Full Screen (Esc)"
    >
      ✕
    </button>

    
  {/* Scroll/pan container */}
    <div
      ref={fullscreenRef}
      className="w-full h-full overflow-auto"
      style={{
        padding: '24px',
        cursor: isPanning ? 'grabbing' : 'grab',

        // ✅ Horizontal center, vertical top:
        display: 'flex',
        justifyContent: 'center', // center horizontally
        alignItems: 'flex-start', // top aligned
      }}
      onMouseDown={(e) => beginPan(e, 'fullscreen')}
      onMouseMove={(e) => doPan(e, 'fullscreen')}
      onMouseUp={() => endPan('fullscreen')}
      onMouseLeave={() => endPan('fullscreen')}
    >

      {/* Inner centering container */}
      <div
        // className="mx-auto"
        style={{
          width: `${A4WidthPxReal * effectiveFsScale}px`,
          // Stack all pages vertically, centered
        }}
      >
        {pages.map((page, pIdx) => (
          <div
            key={`fs-page-${pIdx}`}
            className="relative mb-6"
            style={{
              width: `${A4WidthPxReal * effectiveFsScale}px`,
              height: `${A4HeightPxReal * effectiveFsScale}px`,
            }}
          >
            <div
              className="relative z-0 shadow-2xl bg-white overflow-hidden will-change-transform"
              style={{
                width: `${A4_WIDTH_MM}mm`,
                height: `${A4_HEIGHT_MM}mm`,
                transform: `scale(${effectiveFsScale})`,
                transformOrigin: 'top left',
                ['--accent' as string]: accentColor,
                fontFamily,
              }}
            >
              <div className="h-full w-full">
                <Template resume={resume}>
                  <div
                    className="box-content px-10 pb-0"
                    style={{
                      paddingTop: `${HEADER_RESERVE_MM}mm`,
                      height: `${CONTENT_MAX_MM}mm`,
                      overflow: 'hidden',
                      fontFamily,
                      ['--accent' as string]: accentColor,
                    } as React.CSSProperties}
                  >
                    {/* Header full-width first */}
                    {page
                      .filter((chunk) => isHeaderKey(chunk.key))
                      .map((chunk) => (
                        <div key={chunk.key}>{chunk.node}</div>
                      ))}

                    {/* Two columns below header */}
                    {isTwoColumn ? (
                      <div className="grid gap-x-6" style={{ gridTemplateColumns: '1fr 4fr' }}>
                        <div className="space-y-2.5">
                          {page
                            .filter((chunk) => isLeftColumnKey(chunk.key))
                            .map((chunk) => (
                              <div key={chunk.key}>{chunk.node}</div>
                            ))}
                        </div>
                        <div>
                          {page
                            .filter((chunk) => isRightColumnKey(chunk.key))
                            .map((chunk) => (
                              <div key={chunk.key}>{chunk.node}</div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      page
                        .filter((chunk) => !isHeaderKey(chunk.key))
                        .map((chunk) => <div key={chunk.key}>{chunk.node}</div>)
                    )}
                  </div>
                </Template>

                {/* Footer reserve (same as builder) */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex items-center px-10 text-[11px] text-gray-400 border-t border-gray-200"
                  style={{ height: `${FOOTER_RESERVE_PX}px` }}
                >
                  <span>Page {pIdx + 1}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zoom hint (optional) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/80">
        Drag to pan • Use toolbar to zoom • Press Esc to exit
      </div>
    </div>
  </div>
)}

    </div>
  );
}
