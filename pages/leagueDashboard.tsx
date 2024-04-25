"use client";

import { useEffect, useState } from "react";

interface Team {
  id: number;
  entry_name: string;
  total: number;
}

interface LeagueData {
  standings: {
    results: Team[];
  };
}

const LeagueDashboard: React.FC = () => {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);

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

  if (!leagueData)
    return (
      <div className="flex justify-center items-center h-screen text-fpl-white bg-fpl-dark-purple">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-fpl-light-gray py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center fpl-light-gray mb-10">
          League Standings
        </h1>
        <div className="bg-fpl-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-fpl-light-purple">
            <h3 className="text-lg leading-6 font-medium text-fpl-white">
              Standings
            </h3>
          </div>
          <div className="border-t border-fpl-dark-purple">
            <dl>
              {leagueData?.standings.results.map((team) => (
                <div
                  key={team.id}
                  className="bg-fpl-white px-4 py-5 grid grid-cols-3 gap-4 sm:grid-cols-3"
                >
                  <dt className="text-sm font-medium text-fpl-dark-purple">
                    Team
                  </dt>
                  <dd className="mt-1 text-sm text-fpl-dark-purple sm:mt-0 sm:col-span-2">
                    {team.entry_name}
                  </dd>
                  <dt className="text-sm font-medium text-fpl-dark-purple">
                    Points
                  </dt>
                  <dd className="mt-1 text-sm text-fpl-dark-purple sm:mt-0 sm:col-span-2">
                    {team.total}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueDashboard;
