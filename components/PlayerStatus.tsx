import React, { useEffect, useState } from "react";

interface Player {
  id: number;
  webName: string;
  nowCost: number;
  costChangeEvent: number;
  news: string;
  statusColor: string; // Dynamic color based on player status severity
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

  return (
    <div className="my-4 p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-bold mb-2">Recent Player Updates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="p-2 border rounded hover:bg-gray-100"
            style={{
              borderColor: player.statusColor,
              color: player.statusColor,
            }}
          >
            <h3 className="font-semibold">{player.webName}</h3>
            <p>Current Price: £{(player.nowCost / 10).toFixed(1)}</p>
            <p>Price Change This event: £{player.costChangeEvent.toFixed(1)}</p>
            <p>Status: {player.news || "No recent updates"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus;
