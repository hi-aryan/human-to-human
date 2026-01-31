import { getDecks, getDeck as getStaticDeck, type Deck, type Card } from "../lib/decks";
import { generateDeck as generateAIDeck } from "../lib/deckGenerator";
import type { Question } from "../types/game";
import { QuestionType } from "../types/game";

export type DeckInfo = { name: string; isAI: boolean };

// Adapter: convert Card → Question
function cardToQuestion(card: Card): Question {
  if (card.type === "buttons") {
    return {
      id: card.card_name,
      text: card.question,
      type: QuestionType.MULTIPLE_CHOICE,
      answers: card.answers.map((text, i) => ({ id: `a${i + 1}`, text })),
    };
  } else {
    return {
      id: card.card_name,
      text: card.question,
      type: QuestionType.SLIDER,
      config: {
        positions: 5,
        labels: [card.answers[0], "", "", "", card.answers[1]],
        labelStyle: "edges" as const,
      },
    };
  }
}

export function deckToQuestions(deck: Deck): Question[] {
  return deck.cards.map(cardToQuestion);
}

export function listDecks(): DeckInfo[] {
  return getDecks().map((d) => ({ name: d.deck_name, isAI: false }));
}

export function getDeck(name: string): Deck | undefined {
  return getStaticDeck(name);
}

export async function generateDeck(theme: string): Promise<Deck> {
  return generateAIDeck(theme);
}
