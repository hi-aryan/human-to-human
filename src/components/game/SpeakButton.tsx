import { Button } from "@/components/ui/button";

type SpeakButtonProps = {
  text: string;
  state: "idle" | "loading" | "playing" | "error";
  onSpeak: () => void;
  onStop: () => void;
};

// Speaker icon SVG
const SpeakerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

// Stop icon SVG
const StopIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

// Loading spinner SVG
const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function SpeakButton({ state, onSpeak, onStop }: SpeakButtonProps) {
  const handleClick = () => {
    if (state === "playing") {
      onStop();
    } else {
      onSpeak();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={state === "playing" ? "Stop reading" : state === "loading" ? "Loading audio" : "Read aloud"}
      className="h-8 w-8"
      disabled={state === "loading"}
      title={state === "playing" ? "Stop reading" : "Read aloud"}
    >
      {state === "loading" && (
        <LoadingSpinner className="h-4 w-4 animate-spin" />
      )}
      {state === "playing" && <StopIcon className="h-4 w-4" />}
      {(state === "idle" || state === "error") && <SpeakerIcon className="h-4 w-4" />}
    </Button>
  );
}
