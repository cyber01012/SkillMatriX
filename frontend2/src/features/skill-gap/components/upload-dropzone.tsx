
'use client';

import React, { useState } from 'react';
import Button  from '@/components/resume-builder/Button';

type Props = {
  onFileSelected: (file: File) => void;
  maxSizeMB?: number;
};

export default function UploadDropzone({ onFileSelected, maxSizeMB = 5 }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const name = file.name.toLowerCase();

    if (!allowed.includes(file.type)) {
      if (!name.endsWith('.pdf') && !name.endsWith('.doc') && !name.endsWith('.docx')) {
        return 'Only PDF or DOC/DOCX allowed.';
      }
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Max size ${maxSizeMB} MB.`;
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.[0]) return;

    const file = files[0];
    const err = validate(file);

    if (err) setError(err);
    else {
      setError(null);
      onFileSelected(file);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      className={`border-2 border-dashed p-6 rounded-md text-center transition ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <p className="mb-2">Drag & drop your resume (PDF/DOC/DOCX), or</p>

      <input
        id="resume-file"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <label htmlFor="resume-file">
        <Button>Select File</Button>
      </label>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
