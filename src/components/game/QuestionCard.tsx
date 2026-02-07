import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getContrastTextColor } from "@/lib/utils";
import { useQuestionMotion } from "@/lib/motion";
import type { MultipleChoiceQuestion } from "@/types/game";

type QuestionCardProps = {
  question: MultipleChoiceQuestion;
  onAnswer?: (questionId: string, answerId: string) => void;
  hasAnswered?: boolean;
  myColor?: string | null;
};

export function QuestionCard({ question, onAnswer, hasAnswered = false, myColor }: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const { enterDuration, exitDuration, revealDuration, revealStagger, reduceMotion } = useQuestionMotion();

  // Reset state when question changes and reveal answers on next frame
  useEffect(() => {
    setSelectedId(null);
    setShowAnswers(false);
    const raf = requestAnimationFrame(() => setShowAnswers(true));
    return () => cancelAnimationFrame(raf);
  }, [question.id]);

  const handleSelect = (answerId: string) => {
    if (hasAnswered || !showAnswers) return;
    setSelectedId(answerId);
    onAnswer?.(question.id, answerId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: exitDuration, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ duration: enterDuration, ease: [0.4, 0, 0.2, 1] }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-8 p-12 w-1/2"
    >
      <h2 className="text-4xl font-semibold text-center text-foreground leading-[1.1] w-[66.666667vw]">
        {question.text}
      </h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        {question.answers.map((answer, index) => {
          const isSelected = selectedId === answer.id;
          return (
            <motion.div
              key={answer.id}
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              animate={showAnswers ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: revealDuration, delay: index * revealStagger }}
            >
              <Button
                variant="gameOutline"
                effect="expand"
                className="min-h-[144px] py-10 px-12 text-base whitespace-normal text-center w-full break-words"
                style={
                  isSelected && myColor
                    ? {
                        backgroundColor: myColor,
                        color: getContrastTextColor(myColor),
                        borderColor: myColor,
                      }
                    : undefined
                }
                onClick={() => handleSelect(answer.id)}
                disabled={hasAnswered || !showAnswers}
              >
                {answer.text}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
