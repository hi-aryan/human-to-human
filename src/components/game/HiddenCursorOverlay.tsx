import { useEffect, useState, useRef } from "react";

type HiddenCursorOverlayProps = {
  isHidden: boolean;
};

type OverlayState = "idle" | "announcing" | "banner";

const ANNOUNCEMENT_DURATION_MS = 3000;

export function HiddenCursorOverlay({ isHidden }: HiddenCursorOverlayProps) {
  const [state, setState] = useState<OverlayState>("idle");
  const announcementTimerRef = useRef<number | null>(null);
  const previousIsHiddenRef = useRef<boolean>(false);

  useEffect(() => {
    // Track when isHidden transitions from false to true
    const justBecameHidden = isHidden && !previousIsHiddenRef.current;
    previousIsHiddenRef.current = isHidden;

    // Clear any existing timer
    if (announcementTimerRef.current !== null) {
      window.clearTimeout(announcementTimerRef.current);
      announcementTimerRef.current = null;
    }

    if (justBecameHidden) {
      // Entering hidden cursor round - show announcement
      setState("announcing");
      
      // After 3 seconds, transition to banner
      announcementTimerRef.current = window.setTimeout(() => {
        setState("banner");
        announcementTimerRef.current = null;
      }, ANNOUNCEMENT_DURATION_MS);
    } else if (!isHidden && state !== "idle") {
      // Exiting hidden cursor round - return to idle
      setState("idle");
    }

    // Cleanup on unmount
    return () => {
      if (announcementTimerRef.current !== null) {
        window.clearTimeout(announcementTimerRef.current);
      }
    };
  }, [isHidden]);

  // Don't render anything if idle
  if (state === "idle") return null;

  return (
    <>
      {/* Fullscreen announcement overlay */}
      {state === "announcing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
                <path d="M2 2l20 20" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Cursors Hidden
              </h2>
              <p className="text-muted-foreground">
                Other players' cursors are hidden for this question
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Persistent banner at bottom */}
      {state === "banner" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary/10 border-t border-primary/20 backdrop-blur-sm animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
              <path d="M2 2l20 20" />
            </svg>
            <span className="text-sm font-medium text-foreground">
              Hidden cursor round
            </span>
          </div>
        </div>
      )}
    </>
  );
}
