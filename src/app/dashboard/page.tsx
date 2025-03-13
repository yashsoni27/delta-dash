import { Suspense } from 'react';
import { getSeason, getDriverStandings, getConstructorStandings, getRaceCalendar } from '@/lib/api';
// import SeasonOverview from '@/components/Dashboard/SeasonOverview';
// import TopDrivers from '@/components/Dashboard/TopDrivers';
// import TopConstructors from '@/components/Dashboard/TopConstructors';
// import UpcomingRace from '@/components/Dashboard/UpcomingRace';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default async function DashboardPage() {
  // const seasonData = await getSeason("2024");
  // console.log("Season Data", seasonData);
  // const driverStandings = await getDriverStandings("2024");
  // console.log(driverStandings);
  // const constructorStandings = await getConstructorStandings("2024");
  // console.log(constructorStandings);
  const raceCalendar = await getRaceCalendar("2024");
  console.log(raceCalendar);
  
  // // Find the next upcoming race
  // const currentDate = new Date();
  // const upcomingRace = raceCalendar.data.find((race: { date: string; time: string; }) => 
  //   new Date(race.date + 'T' + race.time) > currentDate
  // );
  
  // // Get top 5 drivers and constructors
  // const topDrivers = driverStandings.data.slice(0, 5);
  // const topConstructors = constructorStandings.data.slice(0, 5);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">F1 Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* <Suspense fallback={<LoadingSpinner />}>
          <SeasonOverview seasonData={seasonData} />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <UpcomingRace race={upcomingRace} />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <TopDrivers drivers={topDrivers} />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <TopConstructors constructors={topConstructors} />
        </Suspense> */}
      </div>
    </div>
  );
}