"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import Image from "next/image";

export type ExistingImage = { id?: number; url: string; alt?: string };

interface ImageUploaderProps {
  existingImages: ExistingImage[];
  pendingFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveExisting: (url: string) => void;
  onRemovePending: (fileName: string) => void;
  disabled?: boolean;
  hint?: string;
  title?: string;
  removeLabel?: string;
  existingLabel?: string;
  newLabel?: string;
  processingLabel?: string;
}

export function ImageUploader({
  existingImages,
  pendingFiles,
  onAddFiles,
  onRemoveExisting,
  onRemovePending,
  disabled,
  hint,
  title,
  removeLabel = "Remove",
  existingLabel = "Existing",
  newLabel = "New",
  processingLabel = "Processing...",
}: ImageUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const previews = useMemo(() => {
    return pendingFiles.slice(0, 1).map((file) => ({ file, url: URL.createObjectURL(file) }));
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (disabled || accepted.length === 0) return;
      setIsCompressing(true);
      try {
        const [first] = accepted;
        const compressed = await imageCompression(first, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        onAddFiles([compressed]);
      } catch (error) {
        console.error("Image compression failed", error);
        onAddFiles([accepted[0]]);
      } finally {
        setIsCompressing(false);
      }
    },
    [disabled, onAddFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".avif"] },
    multiple: false,
    maxFiles: 1,
    disabled,
  });

  return (
    <div className="space-y-4">
      {title && <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</p>}
      <div
        {...getRootProps()}
        className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center transition hover:border-black hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:border-white"
      >
        <input {...getInputProps()} />
        <div className="text-sm text-gray-700 dark:text-gray-200">
          {isDragActive ? "Drop images here" : hint || "Drag & drop images, or click to upload."}
        </div>
        {isCompressing && <p className="text-xs text-gray-500">{processingLabel}</p>}
      </div>

      {existingImages.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{existingLabel}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {existingImages.slice(0, 1).map((img) => (
              <div key={img.url} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <Image src={img.url} alt={img.alt || "Existing image"} width={320} height={220} className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.url)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white shadow hover:bg-black/85"
                  disabled={disabled}
                >
                  {removeLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingFiles.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{newLabel}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {previews.map((preview) => (
              <div key={preview.url} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <Image src={preview.url} alt={preview.file.name} width={320} height={220} className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemovePending(preview.file.name)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white shadow hover:bg-black/85"
                  disabled={disabled}
                >
                  {removeLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
