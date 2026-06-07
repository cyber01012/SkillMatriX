
// File: features/skill-gap/components/file-picker.tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import Button from '@/components/resume-builder/Button';

export type FilePickerProps = {
  onFileSelected: (file: File | null) => void;
  label?: string;
  maxSizeMB?: number;
  className?: string;
  onPickStart?: () => void;  // 👈 NEW
  onPickEnd?: () => void;    // 👈 NEW
};

export default function FilePicker({
  onFileSelected,
  label = 'Drag & drop your resume (PDF/DOC/DOCX), or',
  maxSizeMB = 5,
  className = '',
  onPickStart,
  onPickEnd,
}: FilePickerProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validate = (file: File): string | null => {
    const lower = file.name.toLowerCase();
    const mimeOk = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].includes(file.type);
    const extOk = lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx');
    if (!mimeOk && !extOk) return 'Only PDF or DOC/DOCX files are allowed.';
    if (file.size > maxSizeMB * 1024 * 1024) return `Max size ${maxSizeMB} MB.`;
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    try { onPickStart?.(); } catch {}
    if (!files?.[0]) { onFileSelected(null); onPickEnd?.(); return; }
    const f = files[0];
    const err = validate(f);
    if (err) {
      setError(err);
      setFileName(null);
      onFileSelected(null);
      onPickEnd?.();
      return;
    }
    setError(null);
    setFileName(f.name);
    onFileSelected(f);
    onPickEnd?.();
  };

  const openDialog = useCallback(() => inputRef.current?.click(), []);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      role="button"
      tabIndex={0}
      onClick={openDialog}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openDialog(); }}
      className={[
        'rounded-xl border-2 border-dashed p-6 text-center transition',
        dragOver ? 'border-[#2ED3A6] bg-[#E8FBF4]' : 'border-[#9BDDC9] bg-[#EFFFF7]',
        'cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2ED3A6]/30',
        className,
      ].join(' ')}
      aria-label="Upload your resume"
    >
      <p className="mb-3 text-[#3D418A] font-semibold">{label}</p>

      <input
        ref={inputRef}
        id="file-picker-input"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex justify-center">
        <Button
          type="button"
          onClick={(e) => { e.stopPropagation(); openDialog(); }}
          className={[
            'cursor-pointer',
            'bg-[#3D418A] hover:bg-[#2F336F] active:bg-[#292D66] text-white',
            'focus-visible:ring-4 focus-visible:ring-[#3D418A]/30',
            'transition-all duration-150 hover:shadow-md active:scale-[.99]',
          ].join(' ')}
        >
          Select File
        </Button>
      </div>

      {fileName && (
        <p className="text-sm text-[#3D418A]/90 mt-2">
          Selected: <span className="font-medium">{fileName}</span>
        </p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
