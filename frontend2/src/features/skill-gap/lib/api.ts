
import type { BackendResponse } from '../types/skill-gap';

export async function analyzeSkillGap(
  file: File,
  role: string,
  opts?: { username?: string; force?: boolean }
): Promise<BackendResponse> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('role', role);
  if (opts?.username) fd.append('username', opts.username);
  if (typeof opts?.force === 'boolean') fd.append('force', String(opts.force));

  // 🔸 Call the Next proxy route (Edge)
  const res = await fetch('/api/skill-gap', { method: 'POST', body: fd });
  const data = await res.json();

console.log("✅ /api/skill-gap route hit");


  if (!res.ok || data?.error) {
    throw new Error(data?.error || 'Failed to analyze');
  }
  return data;
}

// Reuse helper
export async function reuseSkillGap(id: number): Promise<BackendResponse> {
  const res = await fetch(`/api/skill-gap/reuse?id=${encodeURIComponent(String(id))}`, {
    method: 'GET',
  });
  const data = await res.json();
  if (!res.ok || data?.error) {
    throw new Error(data?.error || 'Failed to reuse');
  }
  return data;
}
