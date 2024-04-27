"use client";

import TeamDetailsPanel from "@/components/TeamDetailsPanel";
import {
  EntryHistory,
  Player,
  StaticDataResponse,
  UserTeamResponse,
  fetchStaticData,
} from "@/pages/api/types";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Team {
  id: number;
  entry: number;
  entry_name: string;
  rank: number;
  last_rank: number;
  player_name: string;
  total: number;
}

interface LeagueData {
  standings: {
    results: Team[];
  };
}

const LeagueDashboard: React.FC = () => {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [teamDetails, setTeamDetails] = useState<Player[] | null>(null);
  const [staticData, setStaticData] = useState<StaticDataResponse | null>(null);
  const [userData, setUserData] = useState<EntryHistory | null>(null);

  const fetchData = async () => {
    const response = await fetch("/api/league");
    const data = (await response.json()) as LeagueData;
    setLeagueData(data);
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Refresh data every minute
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  // Fetch static data once on component mount
  useEffect(() => {
    const loadStaticData = async () => {
      const data = await fetchStaticData();
      setStaticData(data);
    };
    loadStaticData();
  }, []);

  const handleTeamClick = (teamId: number) => {
    fetchTeamData(teamId);
  };

  const fetchTeamData = async (teamId: number) => {
    const response = await fetch(`/api/team/${teamId}`);
    const data: UserTeamResponse = await response.json();
    setUserData(data.entry_history);
    console.log("data.entry_history", data.entry_history);
    // Enrich picks with static data
    if (staticData) {
      const enrichedPicks = data.picks.map((pick) => {
        console.log(pick);
        const playerDetails = staticData.elements.find(
          (player) => player.id === pick.element
        );
        return { ...pick, playerDetails };
      });
      setTeamDetails(
        enrichedPicks.map((pick: any) => {
          return { ...pick };
        })
      );
      console.log(
        "TEAM DETAILS",
        enrichedPicks.map((pick: any) => pick.playerDetails)
      );
    }
    setSelectedTeam(teamId);
  };

  if (!leagueData)
    return (
      <div className="flex justify-center items-center h-screen text-fpl-white bg-fpl-dark-purple">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-light-gray py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-dark-blue mb-10">
          League Standings
        </h1>
        <div className="bg-off-white shadow-xl overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-light-blue to-dark-blue">
            <h3 className="text-lg leading-6 font-medium text-white">
              Standings
            </h3>
          </div>
          <div className="border-t border-dark-blue">
            {leagueData.standings.results.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-off-white px-4 py-5 grid grid-cols-3 gap-4 sm:grid-cols-3 hover:bg-light-blue cursor-pointer transition duration-150 ease-in-out"
                onClick={() => handleTeamClick(team.entry)}
              >
                <dt className="text-sm font-medium text-dark-gray">Team</dt>
                <dd className="text-sm text-dark-gray sm:col-span-2 flex items-center">
                  {team.entry_name}
                  {team.rank < team.last_rank ? (
                    <FontAwesomeIcon
                      icon={faArrowUp}
                      className="ml-2 text-green-500"
                    />
                  ) : team.rank > team.last_rank ? (
                    <FontAwesomeIcon
                      icon={faArrowDown}
                      className="ml-2 text-red-500"
                    />
                  ) : null}
                </dd>
                <dt className="text-sm font-medium text-dark-gray">Points</dt>
                <dd className="text-sm text-dark-gray sm:col-span-2">
                  {team.total}
                </dd>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {selectedTeam !== null && (
        <TeamDetailsPanel
          isOpen={!!selectedTeam}
          onClose={() => setSelectedTeam(null)}
          teamDetails={teamDetails}
          userData={userData}
        />
      )}
    </div>
  );
};

export default LeagueDashboard;
