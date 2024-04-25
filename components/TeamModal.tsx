import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../shadcn/components/ui/dialog";
import { Button } from "../shadcn/components/ui/button";
import { useEffect } from "react";
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="relative w-full max-w-4xl p-8">
        <DialogTitle className="text-2xl font-bold">Team Details</DialogTitle>
        <DialogDescription className="mb-4">
          This is a detailed view of the team lineup.
        </DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter and map players by their position/element_type */}
          {teamDetails
            ?.sort((a, b) => a.element_type - b.element_type)
            .map((player, index) => (
              <div
                key={player.id}
                className="flex flex-col items-center p-2 bg-white rounded-lg shadow"
              >
                <img
                  src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo.slice(
                    0,
                    player.photo.length - 4
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
        <DialogClose asChild>
          <Button className="absolute top-4 right-4">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
