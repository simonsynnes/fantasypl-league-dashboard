import React, { useEffect, useState } from "react";

export interface PlayerUpdate {
  id: number;
  webName: string;
  nowCost: number;
  costChangeEvent: number;
  news: string;
  statusColor: string;
  updateDate: string;
}

interface DateGroup {
  date: string;
  risers: PlayerUpdate[];
  fallers: PlayerUpdate[];
}

const formatDate = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
};

const PlayerStatus: React.FC = () => {
  const [dateGroups, setDateGroups] = useState<DateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerUpdates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/players/updates");
        if (!response.ok) {
          throw new Error("Failed to fetch player updates");
        }
        const players: PlayerUpdate[] = await response.json();
        const groupedByDate: { [key: string]: DateGroup } = {};

        players.forEach((player) => {
          const dateKey = formatDate(player.updateDate);
          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = {
              date: dateKey,
              risers: [],
              fallers: [],
            };
          }
          if (player.costChangeEvent > 0) {
            groupedByDate[dateKey].risers.push(player);
          } else if (player.costChangeEvent < 0) {
            groupedByDate[dateKey].fallers.push(player);
          }
        });

        setDateGroups(Object.values(groupedByDate));
      } catch (error) {
        console.error("Failed to fetch player updates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerUpdates();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">Loading player data...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h2 className="text-2xl font-bold mb-4">Price Changes</h2>
      {dateGroups.map((group) => (
        <div key={group.date} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">{group.date}</h3>
          <div className="flex flex-wrap justify-between">
            <Section title="Price Risers" players={group.risers} />
            <Section title="Price Fallers" players={group.fallers} />
          </div>
        </div>
      ))}
    </div>
  );
};

const Section: React.FC<{ title: string; players: PlayerUpdate[] }> = ({
  title,
  players,
}) => {
  return (
    <div className="flex flex-col w-full p-2">
      <h4 className="text-md font-bold mb-2">{title}</h4>
      <div className="flex flex-col gap-2">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="bg-white p-4 mb-2 rounded-lg shadow-lg transition duration-300 ease-in-out hover:shadow-xl"
          >
            <h5 className="text-lg font-semibold text-gray-800">
              {player.webName}
              {player.costChangeEvent > 0 ? (
                <span className="text-green-500 ml-2">↑</span>
              ) : player.costChangeEvent < 0 ? (
                <span className="text-red-500 ml-2">↓</span>
              ) : (
                <span className="text-gray-400 ml-2">→</span>
              )}
            </h5>
            <p>Current Price: £{(player.nowCost * 10).toFixed(1)}</p>
            <p>Price Change: £{player.costChangeEvent.toFixed(1)} </p>
            {player.news && (
              <p style={{ color: player.statusColor }}>Status: {player.news}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus;
