"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { compressToTarget, LOGO_MAX_BYTES } from "@/lib/compressImage";

const VIEWPORT = 260; // px, square

export default function LogoCropper({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (result: { blob: Blob; dataUrl: string }) => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const [previewBytes, setPreviewBytes] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // fit image so the shorter side fills the viewport
      draw();
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = VIEWPORT;
    canvas.height = VIEWPORT;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, VIEWPORT, VIEWPORT);

    const baseScale = Math.max(VIEWPORT / img.width, VIEWPORT / img.height);
    const scale = baseScale * zoom;
    const w = img.width * scale;
    const h = img.height * scale;
    const x = VIEWPORT / 2 - w / 2 + offset.x;
    const y = VIEWPORT / 2 - h / 2 + offset.y;
    ctx.drawImage(img, x, y, w, h);
  }, [zoom, offset]);

  useEffect(() => {
    draw();
  }, [draw]);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.startX;
    const dy = e.clientY - dragging.current.startY;
    setOffset({ x: dragging.current.ox + dx, y: dragging.current.oy + dy });
  }
  function onPointerUp() {
    dragging.current = null;
  }

  async function handleUsePhoto() {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const result = await compressToTarget(canvasRef.current);
      setPreviewBytes(result.blob.size);
      onConfirm(result);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-[var(--text-dim)]">
        Drag to reposition, use the slider to zoom. Your logo is saved at 80kb or smaller — small
        and fast to load everywhere it appears.
      </p>

      <div
        className="relative overflow-hidden rounded-full border-2 touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ width: VIEWPORT, height: VIEWPORT, borderColor: "var(--border-strong)" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <canvas ref={canvasRef} width={VIEWPORT} height={VIEWPORT} />
      </div>

      <label className="flex w-full max-w-xs flex-col gap-1 text-xs text-[var(--text-dim)]">
        Zoom
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </label>

      {previewBytes !== null && (
        <p className="font-data text-xs text-[var(--text-dim)]">
          Final size: {(previewBytes / 1024).toFixed(1)}kb / {(LOGO_MAX_BYTES / 1024).toFixed(0)}kb max
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm text-[var(--text-dim)] hover:text-[var(--text)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUsePhoto}
          disabled={busy}
          className="rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          style={{ background: "var(--gradient-brand)" }}
        >
          {busy ? "Compressing…" : "Use this logo"}
        </button>
      </div>
    </div>
  );
}
