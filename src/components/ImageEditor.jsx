import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

/* A few default filter presets (applied live in the preview AND baked into the
 * exported image via the canvas filter). */
const FILTERS = [
  { key: "original", label: "Original", css: "none" },
  { key: "bw", label: "B&W", css: "grayscale(1)" },
  { key: "warm", label: "Warm", css: "sepia(0.28) saturate(1.25) brightness(1.03)" },
  { key: "cool", label: "Cool", css: "saturate(1.1) hue-rotate(-12deg) brightness(1.02)" },
  { key: "vivid", label: "Vivid", css: "saturate(1.5) contrast(1.12)" },
  { key: "bright", label: "Bright", css: "brightness(1.12) contrast(1.05)" },
];

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/* Crop (+ filter) to a compact JPEG. Capped by `maxSize` (longer edge) and
 * q0.82 so images stay small (fast to load) — a web photo lands ~60–150KB. */
async function getCroppedBlob(src, area, filterCss, maxSize = 1280) {
  const image = await createImage(src);
  let w = area.width;
  let h = area.height;
  if (w > maxSize) {
    const s = maxSize / w;
    w = maxSize;
    h = h * s;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext("2d");
  if (filterCss && filterCss !== "none") ctx.filter = filterCss;
  ctx.drawImage(
    image,
    area.x, area.y, area.width, area.height,
    0, 0, canvas.width, canvas.height
  );
  return await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82)
  );
}

export function ImageEditor({ src, aspect = 1, rounded, busy, maxSize = 1280, onCancel, onApply }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState("original");
  const [area, setArea] = useState(null);
  const [working, setWorking] = useState(false);

  const filterCss = FILTERS.find((f) => f.key === filter)?.css || "none";
  const onCropComplete = useCallback((_a, px) => setArea(px), []);
  const disabled = working || busy;

  const apply = async () => {
    if (!area) return;
    setWorking(true);
    try {
      const blob = await getCroppedBlob(src, area, filterCss, maxSize);
      if (blob) await onApply(blob);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={panel}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Edit image</div>

        <div style={stage}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={rounded ? "round" : "rect"}
            showGrid={!rounded}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{ mediaStyle: { filter: filterCss } }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#52525b", marginTop: 12 }}>
          <span style={{ width: 40 }}>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </label>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                padding: "5px 10px",
                fontSize: 12,
                borderRadius: 8,
                cursor: "pointer",
                border: filter === f.key ? "1px solid #09090b" : "1px solid #e4e4e7",
                background: filter === f.key ? "#09090b" : "#fff",
                color: filter === f.key ? "#fff" : "#27272a",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button type="button" className="btn ghost" onClick={onCancel} disabled={disabled}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={apply} disabled={disabled || !area}>
            {disabled ? "Applying…" : "Apply & Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(9,9,11,0.55)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};
const panel = {
  width: "min(560px, 96vw)",
  background: "#fff",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
};
const stage = {
  position: "relative",
  width: "100%",
  height: 340,
  background: "#18181b",
  borderRadius: 10,
  overflow: "hidden",
};
