"use client";
import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface UploadWidgetProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadWidget({ onFile, disabled = false }: UploadWidgetProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);

      if (rejected.length > 0) {
        const msg = rejected[0].errors[0]?.message ?? "Invalid file";
        setError(msg);
        return;
      }

      const file = accepted[0];
      if (!file) return;

      // Preview
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFileName(file.name);
      onFile(file);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: MAX_SIZE_BYTES,
    maxFiles: 1,
    disabled,
  });

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    setError(null);
  }

  return (
    <div className="space-y-3">
      {!preview ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors cursor-pointer",
            isDragActive
              ? "border-flora-500 bg-flora-50"
              : "border-gray-300 hover:border-flora-400 hover:bg-gray-50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Upload plant image. Click or drag and drop."
          role="button"
          tabIndex={disabled ? -1 : 0}
        >
          <input {...getInputProps()} aria-label="File input" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-flora-100 mb-4">
            <Upload className="h-7 w-7 text-flora-600" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? "Drop your image here" : "Drag & drop or click to upload"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            JPEG, PNG, WebP · Max {MAX_SIZE_MB} MB
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
          <div className="relative h-64 w-full">
            <Image
              src={preview}
              alt={`Preview of ${fileName}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
              <span className="text-sm text-gray-600 truncate">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={clearFile}
              disabled={disabled}
              className="shrink-0 ml-3 rounded-lg p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
