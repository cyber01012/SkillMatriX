
'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { filterBundle, recommendByFile, recommendBySkills } from '@/features/job-recommendation/lib/api';
import type { RecommendBundle, JobResponseDTO } from '@/features/job-recommendation/types';
import { getCurrentUser } from '@/features/auth/user';
import { GlassProfileBadgeAuto, UnderHeaderGlassStripAuto  } from "@/features/ProfileBadge";

import Card from '@/components/resume-builder/Card';
import Button from '@/components/resume-builder/Button';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ArrowLeft,
  Loader2,
  Search,
  SlidersHorizontal,
  Upload,
  Building2,
  MapPin,
  ExternalLink,
  Star,
  Target,
  Sparkles,
  ChevronDown,
  X as XIcon,
} from 'lucide-react';

type SortKey = 'scoreDesc' | 'scoreAsc' | 'titleAsc' | 'titleDesc';
type SkillsPayload = { strong: string[]; weak: string[]; missing: string[] };


function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  const ref = React.useRef<number>();
  return React.useCallback((...args: Parameters<T>) => {
    if (ref.current) window.clearTimeout(ref.current);
    ref.current = window.setTimeout(() => fn(...args), delay) as unknown as number;
  }, [fn, delay]) as T;
}



// ---- Brand palette (inspired by your ProfileCard)
const BRAND = {
  indigoDeep: '#2A2771',
  primary: '#3D418A',
  mint: '#A8E6CF',
  teal: '#26B291',
  border: '#E9EAF7',
  text: '#1B2230',
  subtext: '#6B7280',
  chipBg: '#F7F7FB',
};

// Score → color mapping
function scoreColors(score?: number) {
  const s = Number(score ?? 0);
  if (s >= 80) return { ring: '#22C55E', bg: '#ECFDF5', text: '#065F46' }; // green
  if (s >= 60) return { ring: '#F59E0B', bg: '#FEF3C7', text: '#92400E' }; // amber
  return { ring: '#EF4444', bg: '#FEE2E2', text: '#991B1B' }; // red
}


function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return String(err); }
}

function DashedDropzone({ onSelect, disabled }: { onSelect: (f: File) => void; disabled?: boolean }) {
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onSelect(f);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onSelect(f);
  };
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="border-4 border-dashed rounded-2xl p-8 text-center"
      style={{ borderColor: '#4B0082', background: '#F7F1FF' }}
    >
      <Upload className="mx-auto mb-3 text-[#3D418A]" />
      <p className="font-bold" style={{ color: '#3D418A' }}>Drag & drop your resume</p>
      <p className="text-sm text-[#3D418A]/70">— — — or — — —</p>
      <label className="inline-block mt-3">
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onPick}
          disabled={disabled}
        />
        <span
          className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md text-white"
          style={{ background: '#3D418A' }}
        >
          Choose file
        </span>
      </label>
    </div>
  );
}




function JobCard({ job }: { job: JobResponseDTO }) {
  const score = Math.max(0, Math.min(100, Number(job.matchScore ?? 0)));
  const pct = `${score}%`;
  const c = scoreColors(score);

  return (
    <div
      className="group rounded-2xl p-4 border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
      style={{
        // Vibrant but professional gradient like your ProfileCard vibe
        background:
          '#FFFFFF',
        borderColor: BRAND.border,
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Title: wrap, no ellipsis */}
          <h3 className="font-black leading-snug" style={{ color: BRAND.indigoDeep }}>
            {job.jobTitle}
          </h3>

          {/* Company + Location chips */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {job.companyName && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border"
                style={{ background: BRAND.chipBg, color: BRAND.primary, borderColor: BRAND.border }}
              >
                <span aria-hidden>🏢</span>
                <span className="break-words">{job.companyName}</span>
              </span>
            )}
            {job.jobGeo && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border"
                style={{ background: BRAND.chipBg, color: BRAND.subtext, borderColor: BRAND.border }}
              >
                <span aria-hidden>📍</span>
                <span className="break-words">{job.jobGeo}</span>
              </span>
            )}
          </div>
        </div>

        {/* Recommendation badge (tinted like your tags) */}
        {job.recommendationType && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border"
            style={{
              background: '#E6FFFA',
              color: '#0F766E',
              borderColor: BRAND.border,
              letterSpacing: '0.08em',
            }}
            title="Recommendation type"
          >
            {job.recommendationType}
          </span>
        )}
      </div>

      {/* Match + donut */}
      <div className="mt-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-widest uppercase">
          <span style={{ color: BRAND.primary }}>Match</span>
          <span
            className="px-1.5 py-0.5 rounded-md border"
            style={{ background: c.bg, color: c.text, borderColor: BRAND.border }}
          >
            {score}
          </span>
        </div>

        {/* Mini colorful donut (CSS-only) */}
        <div className="relative w-10 h-10" title={`Match ${pct}`}>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${c.ring} ${pct}, ${BRAND.border} 0)`,
              filter: 'drop-shadow(0 3px 10px rgba(28,33,61,.08))',
            }}
            aria-hidden
          />
          <div
            className="absolute inset-1.5 rounded-full bg-white border"
            style={{ borderColor: BRAND.border }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black leading-none" style={{ color: BRAND.text }}>
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Excerpt (hover expand) */}
      {job.jobExcerpt && (
        <div
          className="
            mt-3 text-sm
            overflow-hidden transition-[max-height] duration-300 ease-out
            max-h-[3.25rem] group-hover:max-h-36
          "
          style={{ color: BRAND.text }}
        >
          <p className="pr-2">{job.jobExcerpt}</p>
        </div>
      )}

      {/* Skills badges – colorful but soft like your ProfileCard */}
      {Array.isArray(job.matchedSkills) && job.matchedSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.matchedSkills.slice(0, 6).map((s, i) => {
            const bg = i % 3 === 0 ? '#EDE9FE' : i % 3 === 1 ? '#DBEAFE' : '#DCFCE7';
            const tc = i % 3 === 0 ? '#5B21B6' : i % 3 === 1 ? '#1D4ED8' : '#166534';
            return (
              <span
                key={`${s}-${i}`}
                className="text-[10px] px-2 py-1 rounded-full border"
                style={{ background: bg, color: tc, borderColor: BRAND.border }}
                title={s}
              >
                {s}
              </span>
            );
          })}
          {job.matchedSkills.length > 6 && (
            <span
              className="text-[10px] px-2 py-1 rounded-full border bg-white"
              style={{ color: BRAND.subtext, borderColor: BRAND.border }}
            >
              +{job.matchedSkills.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div
          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border"
          style={{ color: '#92400E', background: '#FFFBEB', borderColor: '#FEF3C7' }}
          title="Based on your profile"
        >
          ⭐ Curated
        </div>

        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-md border transition-colors hover:bg-white/70"
            style={{ color: BRAND.primary, borderColor: BRAND.border, background: '#FFF' }}
          >
            View job <span aria-hidden>↗</span>
          </a>
        )}
      </div>
    </div>
  );
}





function Section({ title, jobs }: { title: string; jobs: JobResponseDTO[] }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#3D418A]" />
          <h2 className="text-xl font-extrabold" style={{ color: '#1B2230' }}>{title}</h2>
        </div>
        <span className="text-xs font-semibold text-[#6B7280]">{jobs.length} jobs</span>
      </div>
      <div className="mt-2 h-px w-full" style={{ background: '#E9EAF7' }} />
      {jobs.length === 0 ? (
        <p className="text-sm text-[#6B7280] mt-3">No results.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-3">
          {jobs.map((j, idx) => (
            <JobCard key={`${j.id ?? idx}-${j.jobTitle}`} job={j} />
          ))}
        </div>
      )}
    </section>
  );
}


export default function JobRecommendationPage() {
  const params = useSearchParams();
  const { isLoggedIn } = getCurrentUser();

  const [bundle, setBundle] = React.useState<RecommendBundle | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState('');
  const [sort, setSort] = React.useState<SortKey>('scoreDesc');

  const recIdParam = params.get('recId');
  
  const from = (params.get('from') || 'home').toLowerCase();
  const fromSkillGap = from === 'skill-gap';
  const fromDashboard = from === 'dashboard';

  // ✅ Treat skill-gap & dashboard as trusted contexts (no blur)
  const shouldBlur = !isLoggedIn && !(fromSkillGap || fromDashboard);


  React.useEffect(() => {
    const init = async () => {
      setError(null);

    if (fromSkillGap) {
      // 0) If Skill-Gap CTA already fetched and stored, prefer showing that bundle immediately
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem('jobs-last-bundle') : null;
      if (cached) {
        try {
          const parsed: RecommendBundle = JSON.parse(cached) as RecommendBundle;
          setBundle(parsed);
          return; // ✅ we are done; show cached bundle (fetched using CV)
        } catch {
          // ignore corrupted cache, continue
        }
      }

      // 1) (Optional path) If sg-skills exists, fetch by skills
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('sg-skills') : null;
      if (raw) {
        try {
          const skills: SkillsPayload = JSON.parse(raw) as SkillsPayload;
          setLoading(true);
          const data = await recommendBySkills(skills);
          setBundle(data);
          if (data.recId) sessionStorage.setItem('jobs-last-rec-id', data.recId);
          sessionStorage.setItem('jobs-last-bundle', JSON.stringify(data));
        } catch (e: unknown) {
          setError(getErrorMessage(e) || 'Failed to load results');
        } finally {
          setLoading(false);
        }
        return;
      }

      // 2) Fallback to recId if provided (server-side filter flow)
      if (recIdParam) {
        setLoading(true);
        try {
          const data = await filterBundle(recIdParam, '', 'scoreDesc');
          setBundle(data);
          if (data.recId) sessionStorage.setItem('jobs-last-rec-id', data.recId);
          sessionStorage.setItem('jobs-last-bundle', JSON.stringify(data));
        } catch (e: unknown) {
          setError(getErrorMessage(e) || 'Failed to load results');
        } finally {
          setLoading(false);
        }
        return;
      }

      // 3) Nothing to show
      setBundle(null);
      return;
    }


      if (recIdParam) {
        setLoading(true);
        try {
          const data = await filterBundle(recIdParam, '', 'scoreDesc');
          setBundle(data);
          sessionStorage.setItem('jobs-last-rec-id', data.recId);
          sessionStorage.setItem('jobs-last-bundle', JSON.stringify(data));
        } catch (e: unknown) {
          setError(getErrorMessage(e) || 'Failed to load results');
        } finally {
          setLoading(false);
        }
        return;
      }

      setBundle(null);
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromSkillGap, recIdParam]);

  const onUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await recommendByFile(file);
      setBundle(data);
      sessionStorage.setItem('jobs-last-rec-id', data.recId);
      sessionStorage.setItem('jobs-last-bundle', JSON.stringify(data));
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  
const debouncedFilter = useDebouncedCallback((term: string, s: SortKey) => {
  void onFilter(term, s);
}, 350);

function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
  const val = e.target.value;
  setQ(val);
  debouncedFilter(val, sort);
}

function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
  const next = e.target.value as SortKey;
  setSort(next);
  void onFilter(q, next);
}

function clearSearch() {
  setQ('');
  void onFilter('', sort);
}

  const onFilter = async (nextQ: string, nextSort: SortKey) => {
    setQ(nextQ);
    setSort(nextSort);
    const recId = bundle?.recId || recIdParam || sessionStorage.getItem('jobs-last-rec-id');
    if (!recId) return;
    try {
      const data = await filterBundle(recId, nextQ, nextSort);
      const next = { ...(bundle ?? data), ...data };
      setBundle(next);
      sessionStorage.setItem('jobs-last-bundle', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-screen px-6 py-6 overflow-x-hidden" style={{ backgroundColor: '#a8e6cf' }}>
      <div className="mb-12 flex items-center justify-between">
      
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 text-[#3D418A]/60 hover:text-[#3D418A] transition-colors font-black text-xs tracking-widest uppercase group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Dashboard
                </button>
                <GlassProfileBadgeAuto
                    align="right"
                    showName={true}     // sirf photo chahiye to false
                    tooltip="Signed in"
                  />
                </div>

      <div className="max-w-6xl mx-auto px-5 pb-12">
        <h1 className="text-7xl md:text-7xl font-extrabold" style={{ color: '#3D418A' }}>Job Recommendations</h1>
        <p className="mt-1 text-[#3D418A]/70 font-semibold">
          {fromSkillGap ? 'Using your Skill-Gap skills. Providing Job recommendations.' : 'Upload your resume to get jobs.'}
        </p>
        <div className="mt-2 h-px w-full" style={{ background: '#3D418A' }} />

        

{/* Search & Filter */}
<div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
  {/* Search input with icon + clear */}
  <div className="relative">
    <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: `${BRAND.primary}80` }} />
    <input
      value={q}
      onChange={handleSearchInput}
      placeholder="Search job titles…"
      className="pl-9 pr-8 py-2 rounded-md border w-[min(420px,90vw)] focus:outline-none transition ring-0 focus:ring-2"
      style={{
        borderColor: BRAND.border,
        background: '#FFFFFF',
        color: BRAND.text,
        // mint ring like ProfileCard
        boxShadow: 'none',
      }}
    />
    {q && (
      <button
        onClick={clearSearch}
        aria-label="Clear search"
        className="absolute right-2 top-2 p-1 rounded hover:bg-[#F7F7FB] transition"
      >
        <XIcon size={14} style={{ color: BRAND.subtext }} />
      </button>
    )}
  </div>

  {/* Sort select */}
  <div className="flex items-center gap-2">
    <SlidersHorizontal style={{ color: BRAND.primary }} />
    <div className="relative">
      <select
        value={sort}
        onChange={handleSortChange}
        className="appearance-none py-2 pl-3 pr-8 rounded-md border focus:outline-none focus:ring-2 transition"
        style={{ borderColor: BRAND.border, background: '#FFF', color: BRAND.text }}
        title="Sort (applies to each section separately)"
      >
        <option value="scoreDesc">Sort by match ↓</option>
        <option value="scoreAsc">Sort by match ↑</option>
        <option value="titleAsc">Title A–Z</option>
        <option value="titleDesc">Title Z–A</option>
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-2.5 top-2.5" style={{ color: BRAND.subtext }} />
    </div>
  </div>
</div>



        {/* Loader */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-[#3D418A] animate-spin" />
              <p className="text-[#3D418A] font-black tracking-[0.3em] uppercase text-[10px]">Finding jobs…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag & drop when no context and not from skill-gap */}
        {!loading && !bundle && !fromSkillGap && (
          <div className="mt-8">
            <DashedDropzone onSelect={onUpload} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-md border-2 p-4" style={{ borderColor: '#4B0082', background: '#F7F1FF' }}>
            <p className="text-[#3D418A] font-bold">Error</p>
            <p className="text-[#3D418A]/80 text-sm">{error}</p>
          </div>
        )}

        {/* Results with guest blur */}
        
{/* Results with guest blur */}
{!loading && bundle && (
  <div className="relative">
    {/* BEFORE: {!isLoggedIn && <div .../>} */}
    {/* AFTER: */}
    {shouldBlur && <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/30 rounded-lg" />}

    {/* BEFORE: <div className={isLoggedIn ? '' : 'pointer-events-none select-none'}> */}
    {/* AFTER: */}
    <div className={shouldBlur ? 'pointer-events-none select-none' : ''}>
      <Section title="Recommended" jobs={bundle.recommendedJobs || []} />
      <Section title="Related" jobs={bundle.relatedJobs || []} />
      <Section title="Others to explore" jobs={bundle.otherJobs || []} />
    </div>

    {shouldBlur && (
      <div className="relative z-20 mt-4">
        <Card>
          <div className="p-4 flex items-center justify-between">
            <p className="text-[#3D418A] font-semibold">You’re viewing a preview.</p>
           <Link href="/">
              <Button className="bg-[#3D418A] text-white hover:bg-[#2F336F]">Log in to see all</Button>
            </Link>
          </div>
        </Card>
      </div>
    )}
  </div>
)}

      </div>
    </main>
  );
}
