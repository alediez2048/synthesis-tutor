/**
 * Full tutorial overlay: spotlight, tooltip, optional floating cursor.
 */

import { useEffect, useState, useCallback } from "react";
import { SpotlightMask } from "./SpotlightMask";
import { TutorialTooltip } from "./TutorialTooltip";
import { useTutorialFlow } from "../../hooks/useTutorialFlow";
import type { LessonState, LessonAction } from "../../state/types";
import { COLORS } from "../../theme";

export interface TutorialOverlayProps {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  onComplete: () => void;
}

function FloatingCursor({ targetRect }: { targetRect: DOMRect | null }) {
  if (!targetRect) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: targetRect.left + targetRect.width / 2 - 16,
        top: targetRect.top - 8,
        zIndex: 9996,
        width: 32,
        height: 32,
        pointerEvents: "none",
        animation: "cursor-bounce 1s ease-in-out infinite",
      }}
    >
      <span style={{ fontSize: 28 }}>👆</span>
    </div>
  );
}

export function TutorialOverlay({
  state,
  dispatch,
  onComplete,
}: TutorialOverlayProps) {
  const { step, config, skip, isLastStep } = useTutorialFlow(
    state,
    dispatch,
    onComplete
  );

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetRect = useCallback(() => {
    if (!config.spotlightTarget) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(
      `[data-tutorial-target="${config.spotlightTarget}"]`
    );
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [config.spotlightTarget]);

  useEffect(() => {
    updateTargetRect();
    const onResize = () => updateTargetRect();
    window.addEventListener("resize", onResize);
    const interval = setInterval(updateTargetRect, 200);
    return () => {
      window.removeEventListener("resize", onResize);
      clearInterval(interval);
    };
  }, [updateTargetRect, step]);

  const handleCta = useCallback(() => {
    if (isLastStep) {
      dispatch({ type: "COMPLETE_TUTORIAL" });
      onComplete();
    } else {
      dispatch({ type: "TUTORIAL_STEP", step: step + 1 });
    }
  }, [isLastStep, step, dispatch, onComplete]);

  return (
    <>
      <SpotlightMask targetRect={targetRect}>
        <TutorialTooltip
          samText={config.samText}
          ctaLabel={config.ctaLabel}
          onCta={handleCta}
        />
      </SpotlightMask>
      {config.requiresInteraction && (
        <FloatingCursor targetRect={targetRect} />
      )}
      <button
        type="button"
        onClick={skip}
        style={{
          position: "fixed",
          top: 12,
          right: 16,
          zIndex: 9997,
          background: "none",
          border: "none",
          fontSize: 13,
          fontFamily: "Georgia, serif",
          color: COLORS.textMuted,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Skip Tutorial
      </button>
    </>
  );
}
