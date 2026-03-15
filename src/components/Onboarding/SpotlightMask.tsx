/**
 * Full-viewport overlay with transparent cutout and dimmed background.
 * Uses four divs to form a dark frame around the spotlight target.
 * The cutout area passes pointer events through so users can interact.
 */

const PADDING = 8;
const DIM_BG = "rgba(0, 0, 0, 0.6)";

export interface SpotlightMaskProps {
  targetRect: DOMRect | null;
  children?: React.ReactNode;
}

export function SpotlightMask({ targetRect, children }: SpotlightMaskProps) {
  if (!targetRect) {
    // No spotlight target — show tooltip without dimming so user can interact freely
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9990,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>{children}</div>
      </div>
    );
  }

  const x = Math.max(0, targetRect.left - PADDING);
  const y = Math.max(0, targetRect.top - PADDING);
  const w = targetRect.width + PADDING * 2;
  const h = targetRect.height + PADDING * 2;

  const frameStyle = {
    pointerEvents: "auto" as const,
    background: DIM_BG,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        pointerEvents: "none",
      }}
    >
      {/* Top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: y, ...frameStyle }} />
      {/* Bottom */}
      <div style={{ position: "absolute", top: y + h, left: 0, right: 0, bottom: 0, ...frameStyle }} />
      {/* Left */}
      <div style={{ position: "absolute", top: y, left: 0, width: x, height: h, ...frameStyle }} />
      {/* Right */}
      <div style={{ position: "absolute", top: y, left: x + w, right: 0, height: h, ...frameStyle }} />
      {/* Spotlight ring */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          pointerEvents: "none",
          borderRadius: 8,
          boxShadow: "0 0 0 2px rgba(212, 168, 67, 0.6)",
          animation: "spotlight-pulse 2s ease-in-out infinite",
        }}
      />
      <div style={{ pointerEvents: "auto" }}>{children}</div>
    </div>
  );
}
