import React, { useEffect, useState } from "react";

interface Player {
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
  risers: Player[];
  fallers: Player[];
  injured: Player[];
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
        const players: Player[] = await response.json();
        const groupedByDate: { [key: string]: DateGroup } = {};

        players.forEach((player) => {
          const dateKey = formatDate(player.updateDate);
          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = {
              date: dateKey,
              risers: [],
              fallers: [],
              injured: [],
            };
          }
          if (player.costChangeEvent > 0) {
            groupedByDate[dateKey].risers.push(player);
          } else if (player.costChangeEvent < 0) {
            groupedByDate[dateKey].fallers.push(player);
          }
          if (player.news) {
            groupedByDate[dateKey].injured.push(player);
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
      <h2 className="text-2xl font-bold mb-4">Recent Player Updates</h2>
      {dateGroups.map((group) => (
        <div key={group.date} className="mb-8">
          <h3 className="text-lg font-semibold underline mb-2">{group.date}</h3>
          <div className="flex flex-wrap justify-between">
            <Section title="Price Risers" players={group.risers} />
            <Section title="Price Fallers" players={group.fallers} />
            <Section title="Injured Players" players={group.injured} />
          </div>
        </div>
      ))}
    </div>
  );
};

const Section: React.FC<{ title: string; players: Player[] }> = ({
  title,
  players,
}) => {
  return (
    <div className="w-full lg:w-1/3 p-2">
      <h4 className="text-md font-bold mb-2">{title}</h4>
      <div
        className={`grid grid-cols-1 ${
          players.length > 5 ? "md:grid-cols-2" : ""
        } gap-4`}
      >
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`bg-white p-4 mb-2 rounded-lg shadow ${
              index >= 5 ? "mt-4" : ""
            }`}
          >
            <h5 className="font-semibold">
              {player.webName}
              {player.costChangeEvent > 0 ? (
                <span className="text-green-500 mx-1">↑</span>
              ) : player.costChangeEvent == 0 ? (
                <span></span>
              ) : (
                <span className="text-red-500 mx-1">↓</span>
              )}
            </h5>
            <p>Current Price: £{(player.nowCost * 10).toFixed(1)}</p>
            <p>Price Change: £{player.costChangeEvent.toFixed(1)} </p>
            <p style={{ color: player.statusColor }}>
              Status: {player.news || "No recent updates"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus;
