import React, { useEffect, useState } from "react";
import { EntryHistory, Player } from "@/pages/api/types";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFutbol,
  faTimes,
  faExchangeAlt,
  faUser,
  faRankingStar,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teamDetails: Player[] | null;
  userData: EntryHistory | null;
}

const TeamDetailsPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  teamDetails,
  userData,
}) => {
  const [userPoints, setUserPoints] = useState<number | undefined>(0);

  useEffect(() => {
    // Reset userPoints when userData changes
    setUserPoints(userData?.points);

    if (userData?.points === 0 && teamDetails) {
      let tempTotalPoints = 0;
      teamDetails.forEach((player) => {
        if (
          player.multiplier !== 0 &&
          player.playerDetails.event_points !== 0
        ) {
          tempTotalPoints += player.playerDetails.event_points;
        }
      });
      setUserPoints(tempTotalPoints); // Set the calculated points only when points are 0
    }
  }, [userData, teamDetails]); // Depend on userData and teamDetails to re-calculate when they change

  const playersByPosition: Record<number, Player[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  // Group players by their element type
  teamDetails?.forEach((player) => {
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
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={{ type: "", stiffness: 300, damping: 30 }}
          className="fixed inset-0 bg-white bg-cover bg-center shadow-lg z-50 overflow-y-auto p-4 grid grid-rows-4"
        >
          <div className="fixed inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/45/Football_field.svg')] bg-cover bg-center shadow-lg z-50 overflow-y-auto p-4 grid grid-rows-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-xl bg-white p-2 rounded-full"
            >
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
            {/* Score display */}
            <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faFutbol} className="text-xl" />
                <span className="font-semibold">Total Score: {userPoints}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faExchangeAlt} className="text-xl" />
                <span className="font-semibold">
                  Transfers: {userData?.event_transfers}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faFutbol} className="text-xl" />
                <span className="font-semibold">
                  Points on Bench: {userData?.points_on_bench}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faUser} className="text-xl" />
                <span className="font-semibold">
                  Overall Rank: {userData?.overall_rank}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faRankingStar} className="text-xl" />
                <span className="font-semibold">
                  Total Points: {userData?.total_points}
                </span>
              </div>
            </div>

            {Object.keys(playersByPosition).map((key) => (
              <div
                className="flex justify-center items-center space-x-2"
                key={`position-${key}`}
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
                      className="w-20 h-24 mb-2"
                    />
                    <p className="text-sm"></p>
                    <span className="text-xs">
                      {player.playerDetails.event_points}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TeamDetailsPanel;
