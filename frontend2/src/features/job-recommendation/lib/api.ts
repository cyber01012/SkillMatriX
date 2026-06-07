
type SkillsPayload = { strong: string[]; weak: string[]; missing: string[] };
type RecommendBundle = {
  recId?: string;
  recommendedJobs: string[];
  relatedJobs: string[];
  otherJobs: string[];
};

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem('accessToken') ?? '';
  const token = raw.replace(/^"|"$/g, '').trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function recommendByFile(file: File): Promise<RecommendBundle> {
  const fd = new FormData();
  fd.append('file', file, file.name);

  const res = await fetch('/api/job-recommendation', {
    method: 'POST',
    headers: authHeader(),
    body: fd,
  });

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      parsed && typeof parsed.error === 'string'
        ? parsed.error
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return parsed as RecommendBundle;
}

export async function recommendBySkills(skills: SkillsPayload): Promise<RecommendBundle> {
  const res = await fetch('/api/job-recommendation/by-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(skills),
  });

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      parsed && typeof parsed.error === 'string'
        ? parsed.error
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return parsed as RecommendBundle;
}

export async function filterBundle(recId: string, q: string, sort: string): Promise<RecommendBundle> {
  const url = `/api/job-recommendation/filter?recId=${encodeURIComponent(recId)}&q=${encodeURIComponent(
    q
  )}&sort=${encodeURIComponent(sort)}`;

  const res = await fetch(url, { headers: authHeader() });
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      parsed && typeof parsed.error === 'string'
        ? parsed.error
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return parsed as RecommendBundle;
}
