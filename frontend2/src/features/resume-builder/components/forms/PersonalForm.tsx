
'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import type { PersonalInfo } from '@/features/resume-builder/types/resume';

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {}; // SSR safety
  const raw = localStorage.getItem("accessToken");
  if (!raw) return {};
  const token = raw.replace(/^"|"$/g, "").trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type Props = {
  value: PersonalInfo;
  onChange: (next: PersonalInfo) => void;
  submitAttempt?: boolean; // NEW
};

export type PersonalFormHandle = {
  validate: () => { valid: boolean; firstErrorId?: string };
  focusFirstError: () => void;
};

const Field = ({
  label,
  required,
  error,
  children,
  hint,
  fieldId,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  fieldId?: string;
}) => (
  <label className="block mb-3">
    <span className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-600">*</span>}
    </span>
    {children}
    {error && (
      <p id={`${fieldId}-error`} className="mt-1 text-sm text-red-600">
        {error}
      </p>
    )}
    {hint && !error && (
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    )}
  </label>
);

const PersonalForm = forwardRef<PersonalFormHandle, Props>(
  ({ value, onChange, submitAttempt }, ref) => {
    const fileRef = useRef<HTMLInputElement>(null);

    // Typed setter (no "any")
    const set = <K extends keyof PersonalInfo>(key: K, v: PersonalInfo[K]) =>
      onChange({ ...value, [key]: v });

    const handlePhoto = (file?: File | null) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => set('photo', String(reader.result || ''));
      reader.readAsDataURL(file);
    };

    const removePhoto = () => set('photo', undefined);

    // Photo preview logic
    const pos = value.photoPosition ?? 'right';
    const isLeft = pos === 'left';
    const thumbClass =
      isLeft
        ? 'h-20 w-20 rounded-full overflow-hidden border border-gray-200'
        : 'h-24 w-24 rounded-lg overflow-hidden border border-gray-200';

    /** ---------------------------
     * Validation state & helpers
     * --------------------------- */
    const [touched, setTouched] = React.useState<{ fullName?: boolean; email?: boolean }>({});

    const isEmpty = (s?: string) => !s || !s.trim();

    const isValidEmail = (s?: string) =>
      !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());


// ✅ Add this right after isEmpty / isValidEmail helpers:
const computedErrors = useMemo(() => {
  const errs: { fullName?: string; email?: string } = {};

  if (touched.fullName || submitAttempt) {
    if (isEmpty(value.fullName)) {
      errs.fullName = 'This field is required';
    }
  }

  if (touched.email || submitAttempt) {
    if (isEmpty(value.email)) {
      errs.email = 'This field is required';
    } else if (!isValidEmail(value.email)) {
      errs.email = 'Please enter a valid email address';
    }
  }

  return errs;
}, [value.fullName, value.email, touched, submitAttempt]);

    // Compute first error field id (for parent focus)

    const firstErrorId = useMemo(() => {
      if (!value.fullName?.trim()) return 'fullName';
      if (!value.email?.trim() || !isValidEmail(value.email)) return 'email';
      return undefined;
    }, [value.fullName, value.email]);

    // Expose validate + focus APIs to parent
      useImperativeHandle(
        ref,
        () => ({
          validate: () => ({ valid: !firstErrorId, firstErrorId }),
          focusFirstError: () => {
            if (!firstErrorId) return;
            const el = document.getElementById(firstErrorId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              requestAnimationFrame(() => (el as HTMLElement).focus?.());
            }
          },
        }),
        [firstErrorId]
      );


    
    // ✅ Replace with:
    const showFullNameError = computedErrors.fullName;
    const showEmailError    = computedErrors.email;

const [loadingEnhance, setLoadingEnhance] = React.useState(false);
const [showPromptModal, setShowPromptModal] = React.useState(false);
const [promptNotes, setPromptNotes] = React.useState("");
const [loadingGenerate, setLoadingGenerate] = React.useState(false);

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

async function handleEnhanceSummary() {
  try {
    setLoadingEnhance(true);
    const res = await fetch(`${API_BASE}/api/ai/enhance-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify({ summary: value.summary }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Enhance failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    if (data.summary) set("summary", data.summary);
  } finally {
    setLoadingEnhance(false);
  }
}

async function handleGenerateFromNotes() {
  try {
    setLoadingGenerate(true);
    const res = await fetch(`${API_BASE}/api/ai/generate-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify({ notes: promptNotes }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Generate failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    if (data.summary) {
      set("summary", data.summary);
      setShowPromptModal(false);
      setPromptNotes("");
    }
  } finally {
    setLoadingGenerate(false);
  }
}
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Personal Details</h3>

        {/* Optional Photo */}
        <div className="mb-4">
          <div className="flex items-center gap-4">
            <div className={`${thumbClass} bg-gray-100 flex items-center justify-center`}>
              {value.photo ? (
                <img src={value.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">No Photo</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload Photo
                </button>

                {value.photo && (
                  <button
                    type="button"
                    className="btn-ghost text-red-600"
                    onClick={removePhoto}
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0])}
              />

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">Photo Position</span>
                  <select
                    className="input"
                    value={pos}
                    onChange={(e) =>
                      set('photoPosition', e.target.value as 'left' | 'right')
                    }
                  >
                    <option value="right">Right (square)</option>
                    <option value="left">Left (circle)</option>
                  </select>
                </label>
                <div className="self-end">
                  <span className="text-xs text-gray-500">
                    JPG/PNG, suggested size ≥ 200×200
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <Field
          label="Full Name"
          required
          error={showFullNameError}
          fieldId="fullName"
        >
          <input
            id="fullName"
            type="text"
            className={`input ${showFullNameError ? 'input-error' : ''}`}
            value={value.fullName}
            placeholder="e.g. Hafsa Yousuf"            
            onChange={(e) => {
              set('fullName', e.target.value);
            }}
            onBlur={() => {
              setTouched(prev => ({ ...prev, fullName: true }));
            }}
            required
            aria-invalid={!!showFullNameError}
            aria-describedby="fullName-error"
          />
        </Field>

        {/* Professional Title */}
        <Field label="Professional Title">
          <input
            type="text"
            className="input"
            value={value.title || ''}
            placeholder="e.g. Frontend Developer"
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>

        {/* Email */}
        <Field
          label="Email"
          required
          error={showEmailError}
          fieldId="email"
        >
          <input
            id="email"
            type="email"
            className={`input ${showEmailError ? 'input-error' : ''}`}
            value={value.email}
            placeholder="e.g. hafsa@example.com"            
            onChange={(e) => {
              set('email', e.target.value);
            }}
            onBlur={() => {
              setTouched(prev => ({ ...prev, email: true }));
            }}
            required
            aria-invalid={!!showEmailError}
            aria-describedby="email-error"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Phone">
            <input
              type="text"
              className="input"
              value={value.phone || ''}
              placeholder="+92..."
              onChange={(e) => set('phone', e.target.value)}
            />
          </Field>
          <Field label="Location">
            <input
              type="text"
              className="input"
              value={value.location || ''}
              placeholder="Karachi, PK"
              onChange={(e) => set('location', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Website / Portfolio" hint="Add your portfolio URL if available">
          <input
            type="url"
            className="input"
            value={value.website || ''}
            placeholder="https://..."
            onChange={(e) => set('website', e.target.value)}
          />
        </Field>

{showPromptModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-lg w-full max-w-md">
      <h3 className="font-semibold text-lg mb-2">Describe Your Experience</h3>

      <textarea
        className="input min-h-120px w-full"
        value={promptNotes}
        onChange={(e) => setPromptNotes(e.target.value)}
        placeholder="e.g. Worked 2 years as a frontend dev, React, UI/UX..."
      />

      <div className="mt-4 flex justify-end gap-3">
        <button
          className="btn-ghost"
          onClick={() => setShowPromptModal(false)}
        >
          Cancel
        </button>

        <button
          className="btn-primary"
          onClick={handleGenerateFromNotes}
          disabled={loadingGenerate}
        >
          {loadingGenerate ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  </div>
)}
        <Field label="Summary" hint="Brief professional summary">
  <div className="flex gap-3 items-start">
    <textarea
      className="input min-h-96px flex-1"
      value={value.summary || ''}
      placeholder="Write your summary here..."
      onChange={(e) => set('summary', e.target.value)}
    />

    <div className="flex flex-col gap-2 w-40">
      <button
        type="button"
        className="btn-secondary"
        onClick={handleEnhanceSummary}
        disabled={loadingEnhance}
      >
        {loadingEnhance ? "Enhancing..." : "Enhance with AI"}
      </button>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => setShowPromptModal(true)}
      >
        Generate with AI
      </button>
    </div>
  </div>
</Field>
      </div>
    );
  }
);

PersonalForm.displayName = 'PersonalForm';
export default PersonalForm;
