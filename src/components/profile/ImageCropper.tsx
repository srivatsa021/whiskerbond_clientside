import React, { useEffect, useMemo, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  src: string;
  onCancel: () => void;
  onSave: (base64: string) => void;
  initialZoom?: number;
  initialPosition?: { x: number; y: number };
  size?: number; // square size in px for viewport (fallback)
  aspectRatio?: number; // width / height, 1 means square
  viewportHeight?: number; // height in px of the viewport when aspectRatio != 1
  outputHeight?: number; // export height in px when aspectRatio != 1
}

// Cropper with zoom/pan and 3x3 overlay grid. Supports square and horizontal rectangle.
export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCancel,
  onSave,
  initialZoom = 1,
  initialPosition = { x: 0, y: 0 },
  size = 360,
  aspectRatio = 1,
  viewportHeight,
  outputHeight,
}) => {
  const isRect = aspectRatio !== 1;
  const vH = isRect ? (viewportHeight ?? 240) : size;
  const vW = isRect ? Math.round(vH * aspectRatio) : size;
  const cH = isRect ? (outputHeight ?? 720) : size;
  const cW = isRect ? Math.round(cH * aspectRatio) : size;

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState(initialPosition);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number } | null>(
    null
  );

  const gridLines = useMemo(() => {
    return (
      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="border border-white/30" />
        ))}
      </div>
    );
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning || !startPan) return;
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;
    setStartPan({ x: e.clientX, y: e.clientY });
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    setStartPan(null);
  };

  const exportCropped = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = cW;
    canvas.height = cH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Compute scale and draw image with current transform into canvas
    const scale = zoom;

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Center of canvas corresponds to viewport center + user translation
    const centerX = cW / 2 + position.x;
    const centerY = cH / 2 + position.y;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cW, cH);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onSave(dataUrl);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY;
      setZoom((z) => {
        const next = Math.min(5, Math.max(0.5, z + delta * 0.0015));
        return next;
      });
    };
    el.addEventListener("wheel", wheelHandler, { passive: false });
    return () => el.removeEventListener("wheel", wheelHandler);
  }, []);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden rounded-md bg-black"
        style={{ width: vW, height: vH, touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          ref={imgRef}
          src={src}
          alt="crop"
          className="select-none"
          draggable={false}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        {gridLines}
      </div>

      <div className="px-2">
        <div className="mb-3 text-sm font-medium">Zoom</div>
        <Slider
          value={[zoom] as any}
          min={0.5}
          max={5}
          step={0.01}
          onValueChange={(v) => setZoom(v[0] as unknown as number)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" type="button" onClick={() => onSave(src)}>
          Use Original
        </Button>
        <Button type="button" onClick={exportCropped}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;
