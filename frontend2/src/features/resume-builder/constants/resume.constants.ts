
export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const A4_MM = { width: 210, height: 297 } as const;
export const FOOTER_RESERVE_PX = 64;

export const CONTENT_TOP_PX = 32;
export const CONTENT_BOTTOM_PX = 0;
export const SAFE_BUFFER_PX = 2;

export const OVERFLOW_GUARD_PX = 8;
export const LAST_LINE_THRESHOLD_PX = 10;


export type TemplateId = 'ats' | 'two-column' | 'design-x';

export const TEMPLATE_REGISTRY: { id: TemplateId; name: string; description?: string }[] = [
  { id: 'ats',        name: 'ATS',   description: 'Plain, high readability' },
  { id: 'two-column', name: '2‑column',       description: 'Compact, balanced layout' },
  { id: 'design-x',   name: 'Design‑X',         description: 'Modern sidebar accent' },
];

export const DEFAULT_TEMPLATE_ID: TemplateId = 'ats';

export const FONT_OPTIONS = [
  { label: 'System (default)', value: 'system-ui, sans-serif' },
  { label: 'Inter',            value: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia',          value: 'Georgia, serif' },
  { label: 'Monaco',           value: 'Monaco, Menlo, monospace' },
];

export const DEFAULT_STYLES = {
  accentColor: '#0ea5e9', // resume accent (not UI)
  fontFamily: 'system-ui, sans-serif',
} as const;
