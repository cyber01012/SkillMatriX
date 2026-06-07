
'use client';
import React from 'react';
import clsx from 'clsx';

type Tab = { id: string; label: string };

export default function Tabs({
  tabs,
  value,
  onChange,
}: { tabs: Tab[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.id)}
            className={clsx(
              'px-4 py-2 -mb-px border-b-2 transition',
              selected
                ? 'border-(--ui-primary) text---ui-primary)'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
