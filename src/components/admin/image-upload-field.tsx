"use client";

import { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploadField({ value, onChange, label = "Image de couverture" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("eventCoverImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.serverData?.url ?? res?.[0]?.url;
      if (url) {
        onChange(url);
        setError(null);
      }
      setUploading(false);
    },
    onUploadError: (err) => {
      setError("Erreur lors de l'upload : " + err.message);
      setUploading(false);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    await startUpload([file]);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-nautilus-gray">{label}</div>

      {/* Preview */}
      {value ? (
        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-nautilus-border group">
          <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-nautilus-border hover:border-nautilus-gold/50 cursor-pointer transition-colors"
        >
          <ImageIcon className="h-8 w-8 text-nautilus-gray/40 mb-2" />
          <p className="text-xs text-nautilus-gray">Cliquer pour uploader</p>
        </div>
      )}

      {/* Upload button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-nautilus-border text-xs text-nautilus-gray hover:border-nautilus-gold/60 hover:text-nautilus-white transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? "Upload en cours…" : value ? "Changer l'image" : "Uploader une image"}
        </button>
        <span className="text-nautilus-gray/40 text-xs">ou</span>
        <input
          type="url"
          placeholder="coller une URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 rounded-lg border border-nautilus-border bg-transparent px-3 text-xs text-nautilus-white placeholder:text-nautilus-gray/40 focus:border-nautilus-gold/60 focus:outline-none transition-colors"
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
