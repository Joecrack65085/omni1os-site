// src/lib/compressImage.ts
// Takes a canvas and squeezes it under a target byte size by stepping
// down JPEG quality first, then physical dimensions if quality alone
// isn't enough. Returns both the Blob (to upload) and a data URL
// (for the "here's what will be saved" preview).

export const LOGO_MAX_BYTES = 80 * 1024; // 80kb hard cap

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))),
      "image/jpeg",
      quality
    );
  });
}

function scaleCanvas(source: HTMLCanvasElement, factor: number): HTMLCanvasElement {
  const target = document.createElement("canvas");
  target.width = Math.max(32, Math.round(source.width * factor));
  target.height = Math.max(32, Math.round(source.height * factor));
  const ctx = target.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, target.width, target.height);
  return target;
}

export async function compressToTarget(
  sourceCanvas: HTMLCanvasElement,
  maxBytes: number = LOGO_MAX_BYTES
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  let working = sourceCanvas;

  // Cap starting resolution — logos don't need to be huge.
  if (working.width > 512) {
    working = scaleCanvas(working, 512 / working.width);
  }

  let quality = 0.92;
  let blob = await canvasToBlob(working, quality);

  // Step quality down first.
  while (blob.size > maxBytes && quality > 0.35) {
    quality -= 0.1;
    blob = await canvasToBlob(working, quality);
  }

  // If still too big, shrink physical dimensions and retry.
  let safety = 0;
  while (blob.size > maxBytes && working.width > 64 && safety < 8) {
    working = scaleCanvas(working, 0.85);
    quality = 0.85;
    blob = await canvasToBlob(working, quality);
    while (blob.size > maxBytes && quality > 0.35) {
      quality -= 0.1;
      blob = await canvasToBlob(working, quality);
    }
    safety++;
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return { blob, dataUrl, width: working.width, height: working.height };
}

// Rough dominant-colour extraction for the "auto theme from logo" flow —
// samples pixels and buckets them, returns the top 3 most common colours
// as hex strings (skips near-white/near-black/low-saturation pixels so we
// don't end up "detecting" a plain background as the brand colour).
export function extractPalette(canvas: HTMLCanvasElement, count = 3): string[] {
  const ctx = canvas.getContext("2d")!;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = new Map<string, number>();

  for (let i = 0; i < data.length; i += 4 * 7) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lightness = (max + min) / 2 / 255;
    const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    if (lightness > 0.92 || lightness < 0.08 || saturation < 0.18) continue;

    const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    });
}
