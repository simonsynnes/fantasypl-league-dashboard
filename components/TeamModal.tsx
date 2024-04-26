import React, { useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../shadcn/components/ui/dialog";
import { Button } from "../shadcn/components/ui/button";
import { Player } from "@/pages/api/types";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamDetails: Player[] | null; // Adjust the type according to your data structure
}

export const TeamModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  teamDetails,
}) => {
  useEffect(() => {
    console.log(teamDetails);
  }, [teamDetails]);

  // Function to return grid CSS classes based on player position
  const getPositionStyle = (elementType: number) => {
    switch (elementType) {
      case 1:
        return "col-span-3"; // Goalkeeper
      case 2:
        return "col-span-2"; // Defenders
      case 3:
        return "col-span-3"; // Midfielders
      case 4:
        return "col-span-3"; // Forwards
      default:
        return "";
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {teamDetails?.map((player, index) => (
        <div
          key={player.id}
          className={`flex flex-col items-center p-2 bg-white rounded-lg shadow ${getPositionStyle(
            player.element_type
          )}`}
        >
          <img
            src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo.slice(
              0,
              -4
            )}.png`}
            alt={player.web_name}
            className="w-24 h-24 rounded-full mb-2"
          />
          <h3 className="text-md font-semibold">
            {player.first_name} {player.second_name} ({player.web_name})
          </h3>
          <p className="text-sm">Cost: £{player.now_cost / 10}</p>
        </div>
      ))}
    </div>
  );
};
