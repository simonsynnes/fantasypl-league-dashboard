import React, { useState } from "react";
import PlayerCard from "./PlayerCard";
import { PlayerUpdate } from "./PlayerStatus";

interface InjurySectionProps {
  players: PlayerUpdate[];
}

const InjurySection: React.FC<InjurySectionProps> = ({ players }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Set the number of players per page

  if (players.length === 0) return null;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPlayers = players.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(players.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <section aria-labelledby="injury-section-title" className="my-4 px-2">
      <h2
        id="injury-section-title"
        className="text-xl font-bold mb-2 text-center"
      >
        Injured Players
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {currentPlayers.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
      <div className="flex justify-center mt-4">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-4 py-2 border rounded mx-1 ${
              currentPage === number ? "bg-gray-300" : "bg-white"
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    </section>
  );
};

export default InjurySection;
