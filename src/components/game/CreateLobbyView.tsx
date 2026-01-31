import { useState } from "react";
import { Button } from "@/components/ui/button";

type CreateLobbyViewProps = {
  onCreateLobby: (config: { deck: string }) => void;
};

const DECKS = [
  { value: "(not yet) friends", label: "Friends", disabled: false },
  { value: "coworkers", label: "Coworkers", disabled: true },
  { value: "couples", label: "Couples", disabled: true },
  { value: "party", label: "Party", disabled: true },
];

export function CreateLobbyView({ onCreateLobby }: CreateLobbyViewProps) {
  const [deck, setDeck] = useState("(not yet) friends");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateLobby({ deck });
  };

  return (
    <div className="flex items-center justify-center h-full w-full bg-background">
      <div className="w-full max-w-md px-8 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Create a Lobby</h1>
          <p className="text-muted-foreground">
            Configure your quiz deck and invite others to join
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Deck</label>
            <div className="grid grid-cols-2 gap-3">
              {DECKS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => !d.disabled && setDeck(d.value)}
                  disabled={d.disabled}
                  className={`px-4 py-3 rounded-md border transition-all relative ${
                    d.disabled
                      ? "border-input bg-muted opacity-50 cursor-not-allowed"
                      : deck === d.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{d.label}</span>
                    {d.disabled && (
                      <span className="text-xs text-muted-foreground">Coming Soon</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" effect="expand">
            Create Lobby
          </Button>
        </form>
      </div>
    </div>
  );
}
