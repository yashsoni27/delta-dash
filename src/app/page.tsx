import CountdownCard from "@/components/ui/CountdownCard";
import StandingsTable from "@/components/ui/StandingsTable";

export default async function Home() {
  

  return (
    <main className="p-10 md:p-20 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:pt-0">
        <CountdownCard />
        {/* <Link
          href="/dashboard"
          className="p-5 border rounded-lg hover:bg-gray-900 transition-colors"
        >
          <h2 className="text-2xl">Dashboard</h2>
          <p>View current F1 season overview</p>
        </Link>*/}
      {/* </div>
      <div className="pt-5 flex flex-col md:flex-row gap-5"> */}
        <StandingsTable name={"Drivers"}/>
        <StandingsTable name={"Constructors"}/>
      </div>
    </main>
  );
}
