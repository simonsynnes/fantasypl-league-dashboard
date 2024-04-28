import React, { useEffect, useState } from "react";
import PlayerCard from "./PlayerCard"; // Make sure the PlayerCard is either in this file or imported correctly

interface Player {
  id: number;
  webName: string;
  nowCost: number;
  costChangeEvent: number;
  news: string;
  statusColor: string;
}

const PlayerStatus: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerUpdates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/players/updates");
        if (!response.ok) {
          throw new Error("Failed to fetch player updates");
        }
        const data: Player[] = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to fetch player updates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerUpdates();
  }, []);

  if (isLoading) {
    return (
      <div className="my-4 p-4 bg-white shadow rounded-lg">
        Loading player data...
      </div>
    );
  }

  const risers = players.filter((player) => player.costChangeEvent > 0);
  const fallers = players.filter((player) => player.costChangeEvent < 0);
  const injured = players.filter((player) => player.news);

  return (
    <div className="my-4 p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-bold mb-2">Recent Player Updates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {risers.map((player) => (
          <PlayerCard player={player} key={player.id} />
        ))}
        {fallers.map((player) => (
          <PlayerCard player={player} key={player.id} />
        ))}
        {injured.map((player) => (
          <PlayerCard player={player} key={player.id} />
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus;
