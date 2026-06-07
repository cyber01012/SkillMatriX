'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // ← ADD
import Input from '@/components/resume-builder/Input';
import Button from '@/components/common/Button';
import { Target, X, Search } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSuggestWithAI?: (current?: string) => Promise<string | void>;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  autoFocus?: boolean;
};

const ROLE_GROUPS: { title: string; roles: string[] }[] = [
  {
    title: 'Engineering',
    roles: [
      'Frontend Developer',
      'Backend Developer',
      'Full-Stack Developer',
      'Mobile Developer',
      'DevOps Engineer',
      'QA Engineer',
    ],
  },
  {
    title: 'Data',
    roles: [
      'Data Analyst',
      'Machine Learning Engineer',
      'Data Scientist',
      'Business Intelligence Analyst',
    ],
  },
  {
    title: 'Cloud & Platform',
    roles: ['Cloud Engineer', 'Platform Engineer', 'Site Reliability Engineer (SRE)'],
  },
  {
    title: 'Product & Design',
    roles: ['UI/UX Designer', 'Product Designer', 'Product Manager'],
  },
];

export default function RoleInput({
  value,
  onChange,
  onSuggestWithAI,
  label = 'Target Role',
  placeholder = 'e.g., Frontend Developer',
  helperText = 'Pick from quick roles or type your own.',
  required = false,
  autoFocus = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(value || '');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(value || '');
  }, [value]);

  const flatRoles = useMemo(() => ROLE_GROUPS.flatMap((g) => g.roles), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatRoles.slice(0, 8);
    return flatRoles.filter((r) => r.toLowerCase().includes(q)).slice(0, 8);
  }, [flatRoles, query]);

  const handlePick = (role: string) => {
    onChange(role);
    setQuery(role);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      handleClear();
    }
    if (e.key === 'Enter' && query.trim()) {
      onChange(query.trim());
    }
  };

  return (
    <div className="space-y-3">
      {/* Label + helper */}
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-black tracking-[0.2em] uppercase text-[#3D418A] flex items-center gap-1">
          <Target size={18} className="text-[#a43bb4]" />
          <span
            className="text-[15px] bg-clip-text text-transparent bg-gradient-to-r from-[#333777] via-[#c86ad6] to-[#26b2d1]"
            aria-label={label}
          >
            {label}
          </span>
          {required && <span className="ml-1 text-[#c86ad6]" aria-hidden>*</span>}
        </label>

        <span className="text-[10px] font-bold text-[#3D418A]/50">
          {helperText}
        </span>
      </div>

      {/* Glass card container */}
      <div className="rounded-3xl p-3 md:p-4 glass-morphism border border-white/50 shadow-xl">
        {/* Input with left icon + clear */}
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[#3D418A]/50">
            <Search size={18} />
          </span>

          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => {
              if (query.trim() !== value) onChange(query.trim());
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label={label}
            className="
              input !pl-10 !pr-24
              !rounded-2xl !bg-white/90
              focus:!ring-2 focus:!ring-[#26b2d1]/50 focus:!border-[#26b2d1]
            "
          />

          {/* Clear */}
          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-2.5 text-[#3D418A]/50 hover:text-[#3D418A] transition-colors cursor-pointer"
              aria-label="Clear"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <X size={18} />
            </motion.button>
          )}
        </div>

        {/* Suggestions list (based on query) */}
        {filtered.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filtered.map((role) => {
              const active = role === value;
              return (
                <motion.button
                  key={role}
                  type="button"
                  onClick={() => handlePick(role)}
                  className={[
                    'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer',
                    active ? 'active-chip' : 'chip',
                  ].join(' ')}
                  aria-pressed={active}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                >
                  {role}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        {/* Role groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ROLE_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#3D418A]/50">
                {group.title}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.roles.slice(0, 6).map((role) => {
                  const active = role === value;
                  return (
                    <motion.button
                      key={role}
                      type="button"
                      onClick={() => handlePick(role)}
                      className={[
                        'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer',
                        active ? 'active-chip' : 'chip',
                      ].join(' ')}
                      aria-pressed={active}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    >
                      {role}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions (kept minimal for now) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] font-bold text-[#3D418A]/50">
            Tip: Press <kbd className="kbd">Ctrl</kbd>/<kbd className="kbd">Cmd</kbd> + <kbd className="kbd">K</kbd> to clear
          </div>
        </div>
      </div>
    </div>
  );
}