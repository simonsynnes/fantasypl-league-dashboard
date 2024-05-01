import React from "react";
import PlayerCard from "./PlayerCard";
import { PlayerUpdate } from "./PlayerStatus";

interface InjurySectionProps {
  players: PlayerUpdate[];
}

const InjurySection: React.FC<InjurySectionProps> = ({ players }) => {
  if (players.length === 0) return null;

  return (
    <section aria-labelledby="injury-section-title" className="my-4 px-2">
      <h2
        id="injury-section-title"
        className="text-xl font-bold mb-2 text-center"
      >
        Injured Players
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  );
};

export default InjurySection;
