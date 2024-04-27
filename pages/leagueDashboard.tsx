"use client";

import TeamDetailsPanel from "@/components/TeamDetailsPanel";
import SearchInput from "@/components/SearchInput";
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
interface PaginatedLeagueData extends LeagueData {
  currentPage: number;
  itemsPerPage: number;
}

const initialPaginatedLeagueData = (
  data: LeagueData[]
): PaginatedLeagueData[] =>
  data.map((league) => ({
    ...league,
    currentPage: 1,
    itemsPerPage: 10,
  }));

const LeagueDashboard: React.FC = () => {
  const [leagueData, setLeagueData] = useState<PaginatedLeagueData[] | null>(
    null
  );
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [teamDetails, setTeamDetails] = useState<Player[] | null>(null);
  const [staticData, setStaticData] = useState<StaticDataResponse | null>(null);
  const [userData, setUserData] = useState<EntryHistory | null>(null);
  const [userId, setUserId] = useState<string>("581576");

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/leagues/${userId}`);
      const data: LeagueData[] = await response.json();
      setLeagueData(initialPaginatedLeagueData(data));
    };

    fetchData().catch(console.error);
  }, [userId]);

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

  const handlePageChange = (leagueIndex: number, newPage: number) => {
    setLeagueData((current) => {
      if (current === null) {
        return null; // Return null immediately if current state is null
      }
      // Map through current state to adjust only the targeted league's currentPage
      return current.map((league, index) =>
        index === leagueIndex ? { ...league, currentPage: newPage } : league
      );
    });
  };

  if (!leagueData || leagueData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-white bg-gray-800">
        Loading or no data available...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SearchInput onSearch={setUserId} />
      <h1 className="text-3xl font-bold text-center text-dark-blue mb-10">
        Your leagues
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagueData.map((league: any, index: number) => (
          <div
            key={index}
            className="bg-off-white shadow-xl overflow-hidden sm:rounded-lg mb-4 p-4"
          >
            {/* League Header */}
            <div className="bg-gradient-to-r from-light-blue to-dark-blue text-white text-lg font-medium px-6 py-4 rounded-t-lg">
              <h3 className="text-lg leading-6 font-medium text-white">
                {league.league.name}
              </h3>
            </div>
            {/* Teams */}
            <div className="border-t border-dark-blue p-2">
              {league.standings.results
                .slice(
                  (league.currentPage - 1) * league.itemsPerPage,
                  league.currentPage * league.itemsPerPage
                )
                .map((team: any) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`bg-off-white px-4 py-5 grid grid-cols-3 gap-4 sm:grid-cols-3 hover:bg-light-blue cursor-pointer transition duration-150 ease-in-out ${
                      team.entry.toString() === userId
                        ? "bg-blue-100 border-l-4 border-blue-500"
                        : ""
                    }`}
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
                    <dt className="text-sm font-medium text-dark-gray">
                      Points
                    </dt>
                    <dd className="text-sm text-dark-gray sm:col-span-2">
                      {team.total}
                    </dd>
                  </motion.div>
                ))}
            </div>
            {/* Pagination */}
            <div className="flex justify-between p-4">
              <button
                onClick={() => handlePageChange(index, league.currentPage - 1)}
                disabled={league.currentPage === 1}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(index, league.currentPage + 1)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={
                  league.currentPage * league.itemsPerPage >=
                  league.standings.results.length
                }
              >
                Next
              </button>
            </div>
          </div>
        ))}
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
