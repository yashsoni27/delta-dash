interface driverEvo {
  code: string;
  driverId: string;
  name: string;
  nationality: string;
  rounds: {
    rounds: number;
    position: number;
    points: number;
  }[];
}

interface Evolutions {
  season: string;
  totalRounds: number;
  driversEvolution?: driverEvo[];
}

interface StandingEvolutionProps {
  title: string;
  standings: Evolutions;
}

const StandingEvolution = ({title, standings}: StandingEvolutionProps) => {
  // console.log(standings);
  // const data = 
  return (
    <>
      <div>{title} Standing Evolution</div>
    </>
  );
};

export default StandingEvolution;
