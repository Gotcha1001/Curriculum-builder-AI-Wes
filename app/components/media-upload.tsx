// components/media-upload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

export function MediaUpload({
  label,
  accept,
  onUploaded,
}: {
  label: string;
  accept: "image/*" | "video/*";
  onUploaded: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const sigRes = await fetch("/api/cloudinary/sign", { method: "POST" });
      const sig = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
        { method: "POST", body: formData },
      );
      const uploaded = await uploadRes.json();
      onUploaded(uploaded.secure_url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Button type="button" variant="outline" disabled={loading} asChild>
        <span>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {label}
        </span>
      </Button>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />
    </label>
  );
}
