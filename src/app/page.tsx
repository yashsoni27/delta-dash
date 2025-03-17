import CountdownCard from "@/components/ui/CountdownCard";
import StandingsTable from "@/components/ui/StandingsTable";

export default async function Home() {
  

  return (
    <main className="p-10 md:p-20 gap-5">
      <div className="flex flex-row gap-5">
        <CountdownCard />
        {/* <Link
          href="/dashboard"
          className="p-5 border rounded-lg hover:bg-gray-900 transition-colors"
        >
          <h2 className="text-2xl">Dashboard</h2>
          <p>View current F1 season overview</p>
        </Link>*/}
      </div>
      <div className="pt-5 flex gap-5">
        <StandingsTable name={"Drivers"}/>
        <StandingsTable name={"Constructors"}/>
      </div>
    </main>
  );
}
