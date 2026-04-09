'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  accept?: string;
  multiple?: boolean;
  onMultiple?: (urls: string[]) => void;
  preview?: 'square' | 'wide' | 'none';
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  folder = 'uploads',
  accept = 'image/*',
  multiple = false,
  onMultiple,
  preview = 'square',
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFiles(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    setError('');

    try {
      const urls: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filename, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filename);
        urls.push(publicUrl);
      }

      if (multiple && onMultiple) {
        onMultiple(urls);
      } else {
        onChange(urls[0]);
      }
    } catch (err: any) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="pol-label">{label}</label>}

      {/* Preview */}
      {value && preview !== 'none' && (
        <div className={`relative overflow-hidden rounded-xl bg-stone-100 border border-stone-200 ${preview === 'wide' ? 'h-40' : 'h-32 w-32'}`}>
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="pol-btn-secondary text-sm flex items-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {multiple ? 'Upload Photos' : 'Upload Image'}
            </>
          )}
        </button>
        {value && !multiple && (
          <span className="text-xs text-stone-400 truncate max-w-[200px]">Image uploaded ✓</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
