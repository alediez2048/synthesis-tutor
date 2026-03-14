/**
 * Full-viewport overlay with transparent cutout.
 * No dimming — page stays fully visible; cutout allows clicks through.
 * Uses four divs to form a frame so the center (cutout) passes pointer events.
 */

const PADDING = 8;

export interface SpotlightMaskProps {
  targetRect: DOMRect | null;
  children?: React.ReactNode;
}

export function SpotlightMask({ targetRect, children }: SpotlightMaskProps) {
  if (!targetRect) {
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
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: y, ...frameStyle }} />
      <div style={{ position: "absolute", top: y + h, left: 0, right: 0, bottom: 0, ...frameStyle }} />
      <div style={{ position: "absolute", top: y, left: 0, width: x, height: h, ...frameStyle }} />
      <div style={{ position: "absolute", top: y, left: x + w, right: 0, height: h, ...frameStyle }} />
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
