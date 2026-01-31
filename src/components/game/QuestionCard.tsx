import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "./SpeakButton";
import type { MultipleChoiceQuestion } from "@/types/game";

type QuestionCardProps = {
  question: MultipleChoiceQuestion;
  onAnswer?: (questionId: string, answerId: string) => void;
  hasAnswered?: boolean;
  ttsState: "idle" | "loading" | "playing" | "error";
  ttsSpeak: (text: string) => void;
  ttsStop: () => void;
};

export function QuestionCard({ question, onAnswer, hasAnswered = false, ttsState, ttsSpeak, ttsStop }: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (answerId: string) => {
    if (hasAnswered) return;
    setSelectedId(answerId);
    onAnswer?.(question.id, answerId);
  };

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
      <div className="grid grid-cols-2 gap-4 w-full">
        {question.answers.map((answer) => (
          <Button
            key={answer.id}
            variant={selectedId === answer.id ? "default" : "gameOutline"}
            effect="expand"
            className="min-h-[72px] py-5 px-6 text-base whitespace-normal text-center"
            onClick={() => handleSelect(answer.id)}
            disabled={hasAnswered}
          >
            {answer.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
