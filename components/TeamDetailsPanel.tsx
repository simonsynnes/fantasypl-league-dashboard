// TeamDetailsPanel.tsx
import React from "react";
import { Player } from "@/pages/api/types";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teamDetails: Player[] | null;
}

interface FormationOffset {
  start: number;
  span: number;
}

function calculateOffsets(
  playersByPosition: Record<number, Player[]>
): Record<number, FormationOffset> {
  const columnsAvailable = 12;
  const formationOffsets: Record<number, FormationOffset> = {};
  let maxSpan = 0;

  // Calculate the span for each type and find the maximum span needed
  [1, 2, 3, 4].forEach((type) => {
    if (playersByPosition[type]) {
      const count = playersByPosition[type].length;
      const spanPerPlayer =
        type === 1 ? 3 : Math.floor(columnsAvailable / count); // Customize per type if needed
      formationOffsets[type] = {
        span: spanPerPlayer,
        start: 1, // Temporary start, will adjust later
      };
      maxSpan += spanPerPlayer * count;
    }
  });

  // Adjust the start positions to center the entire formation
  let currentPosition = Math.floor((columnsAvailable - maxSpan) / 2) + 1;
  [1, 2, 3, 4].forEach((type) => {
    if (formationOffsets[type]) {
      formationOffsets[type].start = currentPosition;
      currentPosition +=
        formationOffsets[type].span * playersByPosition[type].length;
    }
  });

  return formationOffsets;
}

const TeamDetailsPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  teamDetails,
}) => {
  const playersByPosition: Record<number, Player[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  // Group players by their element type
  teamDetails?.forEach((player) => {
    console.log(player);
    if (player.multiplier !== 0) {
      playersByPosition[player.playerDetails.element_type]?.push(player);
    }
  });

  // Define the animation variants
  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      <div>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "", stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/45/Football_field.svg')] bg-cover bg-center shadow-lg z-50 overflow-y-auto p-4 grid grid-rows-4"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-xl bg-white p-2 rounded-full"
            >
              Close
            </button>
            {Object.keys(playersByPosition).map((key) => (
              <div
                className="flex justify-center items-center space-x-2"
                key={key}
              >
                {playersByPosition[parseInt(key)].map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md"
                  >
                    <img
                      src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.playerDetails.photo.slice(
                        0,
                        -4
                      )}.png`}
                      alt={player.playerDetails.web_name}
                      className="w-20 h-24 mb-2 rounded-full"
                    />
                    <p className="text-sm"></p>
                    <span className="text-xs">
                      {player.playerDetails.event_points}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default TeamDetailsPanel;
