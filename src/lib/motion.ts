import { useReducedMotion } from "framer-motion";

export const QUESTION_MOTION = {
  enterDuration: 0.25,
  exitDuration: 0.2,
  revealDuration: 0.18,
  revealStagger: 0.06,
};

export function useQuestionMotion() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return {
      enterDuration: 0,
      exitDuration: 0,
      revealDuration: 0,
      revealStagger: 0,
      reduceMotion: true,
    };
  }

  return {
    ...QUESTION_MOTION,
    reduceMotion: false,
  };
}
