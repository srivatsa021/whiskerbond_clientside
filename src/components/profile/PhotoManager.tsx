import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImagePlus, Pencil, Trash } from "lucide-react";
import ImageCropper from "./ImageCropper";

interface PhotoManagerProps {
  value: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({ value, onChange, max = 10 }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchQueue, setBatchQueue] = useState<string[]>([]);
  const [batchPos, setBatchPos] = useState(0);

  const canAddMore = value.length < max;

  const openFilePicker = () => fileInputRef.current?.click();

  const filesToDataUrls = (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || []);
    e.target.value = "";
    if (!fileList.length) return;

    const remaining = Math.max(0, max - value.length);
    if (remaining <= 0) return;

    const selected = fileList.slice(0, remaining);
    const dataUrls = await filesToDataUrls(selected);

    // Start batch cropping
    setBatchQueue(dataUrls);
    setBatchPos(0);
    setRawSrc(dataUrls[0]);
    setEditingIndex(value.length); // append mode
    setDialogOpen(true);
  };

  const editExisting = (idx: number) => {
    setRawSrc(value[idx]);
    setEditingIndex(idx);
    setDialogOpen(true);
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  const handleSaveCrop = (base64: string) => {
    let next = [...value];
    if (editingIndex === value.length) {
      next.push(base64);
    } else if (editingIndex !== null && editingIndex >= 0) {
      next[editingIndex] = base64;
    }
    onChange(next.slice(0, max));

    if (batchQueue.length && batchPos < batchQueue.length - 1) {
      const nextPos = batchPos + 1;
      setBatchPos(nextPos);
      setRawSrc(batchQueue[nextPos]);
      setEditingIndex(next.length); // append next
    } else {
      // End batch
      setDialogOpen(false);
      setEditingIndex(null);
      setRawSrc(null);
      setBatchQueue([]);
      setBatchPos(0);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {value.map((img, idx) => (
          <div key={idx} className="relative h-36 w-full rounded-md overflow-hidden bg-muted">
            <img src={img} alt={`photo-${idx}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-end gap-1 p-1 justify-end bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition">
              <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => editExisting(idx)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="destructive" className="h-7 w-7" onClick={() => removeAt(idx)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            onClick={openFilePicker}
            className="h-36 w-full rounded-md border border-dashed flex items-center justify-center hover:bg-muted/50 transition"
          >
            <div className="flex flex-col items-center text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs mt-1">Add Photo</span>
            </div>
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) {
          setDialogOpen(false);
          setBatchQueue([]);
          setBatchPos(0);
          setRawSrc(null);
          setEditingIndex(null);
        } else {
          setDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-[720px]" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); }}}>
          <DialogHeader>
            <DialogTitle>{editingIndex === value.length ? "Add Photo" : "Edit Photo"}{batchQueue.length ? ` (${batchPos + 1}/${batchQueue.length})` : ""}</DialogTitle>
          </DialogHeader>
          {rawSrc && (
            <ImageCropper src={rawSrc} onCancel={() => {
              if (batchQueue.length && batchPos < batchQueue.length - 1) {
                const nextPos = batchPos + 1;
                setBatchPos(nextPos);
                setRawSrc(batchQueue[nextPos]);
                setEditingIndex(value.length + nextPos);
              } else {
                setDialogOpen(false);
              }
            }} onSave={handleSaveCrop} aspectRatio={2.5} viewportHeight={240} outputHeight={720} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoManager;
