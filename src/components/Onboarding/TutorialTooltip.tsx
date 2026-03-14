/**
 * Positioned tooltip with Sam avatar, step text, and CTA button.
 */

import { COLORS } from "../../theme";
import { MagicButton } from "../shared/MagicButton";

export interface TutorialTooltipProps {
  samText: string;
  ctaLabel: string;
  onCta: () => void;
}

export function TutorialTooltip({
  samText,
  ctaLabel,
  onCta,
}: TutorialTooltipProps) {
  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 24,
        zIndex: 9995,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          background: COLORS.panel,
          borderRadius: 16,
          padding: 20,
          border: `2px solid ${COLORS.gold}`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
          maxWidth: 400,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <img
            src="/assets/sam-avatar.png"
            alt=""
            aria-hidden
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: `3px solid ${COLORS.gold}`,
              objectFit: "cover",
              flexShrink: 0,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.5,
              fontFamily: "Georgia, serif",
              color: COLORS.text,
              flex: 1,
            }}
          >
            {samText}
          </p>
        </div>
        <MagicButton variant="gold" onClick={onCta} style={{ width: "100%" }}>
          {ctaLabel}
        </MagicButton>
      </div>
    </div>
  );
}
