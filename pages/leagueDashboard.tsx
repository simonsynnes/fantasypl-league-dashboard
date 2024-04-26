"use client";

import TeamDetailsPanel from "@/components/TeamDetailsPanel";
import {
  Player,
  StaticDataResponse,
  UserTeamResponse,
  fetchStaticData,
} from "@/pages/api/types";
import { useEffect, useState } from "react";

interface Team {
  id: number;
  entry: number;
  entry_name: string;
  rank: number;
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
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-purple-800 mb-10">
          League Standings
        </h1>
        <div className="bg-white shadow-xl overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-600 to-purple-800">
            <h3 className="text-lg leading-6 font-medium text-white">
              Standings
            </h3>
          </div>
          <div className="border-t border-purple-900">
            {leagueData?.standings.results.map((team) => (
              <div
                key={team.id}
                className="bg-white px-4 py-5 grid grid-cols-3 gap-4 sm:grid-cols-3 hover:bg-purple-50 cursor-pointer transition duration-150 ease-in-out"
                onClick={() => handleTeamClick(team.entry)}
              >
                <dt className="text-sm font-medium text-purple-900">Team</dt>
                <dd className="mt-1 text-sm text-purple-900 sm:mt-0 sm:col-span-2">
                  {team.entry_name}
                </dd>
                <dt className="text-sm font-medium text-purple-900">Points</dt>
                <dd className="mt-1 text-sm text-purple-900 sm:mt-0 sm:col-span-2">
                  {team.total}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedTeam !== null && (
        <TeamDetailsPanel
          isOpen={!!selectedTeam}
          onClose={() => setSelectedTeam(null)}
          teamDetails={teamDetails}
        />
      )}
    </div>
  );
};

export default LeagueDashboard;
