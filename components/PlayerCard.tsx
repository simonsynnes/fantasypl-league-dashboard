import React from "react";

interface Player {
  id: number;
  webName: string;
  nowCost: number;
  costChangeEvent: number;
  news: string;
  statusColor: string;
}

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const isRiser = player.costChangeEvent > 0;
  const isFaller = player.costChangeEvent < 0;

  return (
    <div
      className="p-2 border rounded hover:bg-gray-100"
      style={{ borderColor: player.statusColor }}
    >
      <h3 className="font-semibold">{player.webName}</h3>
      <p>Current Price: £{(player.nowCost * 10).toFixed(1)}</p>
      <p>
        Price Change: £{player.costChangeEvent.toFixed(1)}{" "}
        {isRiser && <span className="text-green-500">↑</span>}
        {isFaller && <span className="text-red-500">↓</span>}
      </p>
      <p style={{ color: player.statusColor }}>
        Status: {player.news || "No recent updates"}
      </p>
    </div>
  );
};

export default PlayerCard;
