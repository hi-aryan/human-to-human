import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SpeakButton } from "./SpeakButton";
import type { SliderQuestion } from "@/types/game";

type SliderQuestionCardProps = {
  question: SliderQuestion;
  onAnswer: (questionId: string, value: number) => void;
  hasAnswered?: boolean;
  ttsState: "idle" | "loading" | "playing" | "error";
  ttsSpeak: (text: string) => void;
  ttsStop: () => void;
};

export function SliderQuestionCard({
  question,
  onAnswer,
  hasAnswered = false,
  ttsState,
  ttsSpeak,
  ttsStop,
}: SliderQuestionCardProps) {
  const { config } = question;
  // Initialize to middle position (or closest to middle for even positions)
  const initialValue = Math.floor((config.positions - 1) / 2);
  const [value, setValue] = useState(initialValue);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (hasAnswered || isConfirmed) return;
    setIsConfirmed(true);
    onAnswer(question.id, value);
  };

  const isDisabled = hasAnswered || isConfirmed;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-8 p-12 border border-border rounded-lg max-w-xl w-[90%]">
      <div className="flex items-center gap-3 w-full justify-center">
        <h2 className="text-2xl font-semibold text-center text-foreground flex-1">
          {question.text}
        </h2>
        <SpeakButton
          text={question.text}
          state={ttsState}
          onSpeak={() => ttsSpeak(question.text)}
          onStop={ttsStop}
        />
      </div>

      <div className="w-full px-4">
        <Slider
          positions={config.positions}
          value={value}
          labels={config.labels}
          labelStyle={config.labelStyle}
          onChange={setValue}
          disabled={isDisabled}
        />
      </div>

      <Button
        variant={isConfirmed ? "default" : "gameOutline"}
        effect="expand"
        className="h-auto py-4 px-8 text-base"
        onClick={handleConfirm}
        disabled={isDisabled}
      >
        {isConfirmed ? "Confirmed" : "Confirm"}
      </Button>
    </div>
  );
}
