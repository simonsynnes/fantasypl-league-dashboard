import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

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
  const hasInjury = Boolean(player.news); // Assuming news contains injury status

  return (
    <div
      className="bg-white p-4 mb-2 rounded-lg shadow-lg transition duration-300 ease-in-out hover:shadow-xl"
      style={{ borderColor: "#CCCCCC" }}
    >
      <h3 className="font-semibold text-lg">
        {player.webName}
        {player.costChangeEvent > 0 ? (
          <span className="text-green-500 ml-2">↑</span>
        ) : player.costChangeEvent < 0 ? (
          <span className="text-red-500 ml-2">↓</span>
        ) : (
          <span className="text-gray-400 ml-2">
            {" "}
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="ml-1"
              style={{ color: player.statusColor }}
            />
          </span>
        )}
      </h3>
      {!hasInjury && (
        <div>
          <p className="text-sm">
            Current Price: £{(player.nowCost * 10).toFixed(1)}
          </p>
          <p className="text-sm">
            Price Change: £{player.costChangeEvent.toFixed(1)}
          </p>
        </div>
      )}
      {player.news !== null && <p className="text-sm">Status: {player.news}</p>}
    </div>
  );
};

export default PlayerCard;
