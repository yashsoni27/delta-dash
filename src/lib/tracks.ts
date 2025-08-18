export type Track = {
  name: string;
  location: string;
  slug: string;
  country: string;
  image: string;                
  remoteDetailFilename: string; 
};

export const tracks: Track[] = [
  {
    name: "Albert Park Circuit",
    location: "Melbourne, Australia",
    slug: "albert_park",
    country: "Australia",
    image: "albert_park.avif",
    remoteDetailFilename: "Australia_Circuit.webp",
  },
  {
    name: "Shanghai International Circuit",
    location: "Shanghai, China",
    slug: "shanghai",
    country: "China",
    image: "shanghai.avif",
    remoteDetailFilename: "China_Circuit.webp",
  },
  {
    name: "Suzuka International Racing Course",
    location: "Suzuka, Japan",
    slug: "suzuka",
    country: "Japan",
    image: "suzuka.avif",
    remoteDetailFilename: "Japan_Circuit.webp",
  },
  {
    name: "Bahrain International Circuit",
    location: "Sakhir, Bahrain",
    slug: "bahrain",
    country: "Bahrain",
    image: "bahrain.avif",
    remoteDetailFilename: "Bahrain_Circuit.webp",
  },
  {
    name: "Jeddah Corniche Circuit",
    location: "Jeddah, Saudi Arabia",
    slug: "jeddah",
    country: "Saudi_Arabia",
    image: "jeddah.avif",
    remoteDetailFilename: "Saudi_Arabia_Circuit.webp",
  },
  {
    name: "Miami International Autodrome",
    location: "Miami, USA",
    slug: "miami",
    country: "Miami",
    image: "miami.avif",
    remoteDetailFilename: "Miami_Circuit.webp",
  },
  {
    name: "Imola (Autodromo Enzo e Dino Ferrari)",
    location: "Imola, Italy",
    slug: "imola",
    country: "Imola",
    image: "imola.avif",
    remoteDetailFilename: "Imola_Circuit.webp",
  },
  {
    name: "Circuit de Monaco",
    location: "Monte Carlo, Monaco",
    slug: "monaco",
    country: "Monaco",
    image: "monaco.avif",
    remoteDetailFilename: "Monaco_Circuit.webp",
  },
  {
    name: "Circuit de Barcelona-Catalunya",
    location: "Barcelona, Spain",
    slug: "catalunya",
    country: "Spain",
    image: "catalunya.avif",
    remoteDetailFilename: "Spain_Circuit.webp",
  },
  {
    name: "Circuit Gilles Villeneuve",
    location: "Montreal, Canada",
    slug: "gilles_villeneuve",
    country: "Canada",
    image: "gilles_villeneuve.avif",
    remoteDetailFilename: "Canada_Circuit.webp",
  },
  {
    name: "Red Bull Ring",
    location: "Spielberg, Austria",
    slug: "red_bull_ring",
    country: "Austria",
    image: "red_bull_ring.avif",
    remoteDetailFilename: "Austria_Circuit.webp",
  },
  {
    name: "Silverstone Circuit",
    location: "Silverstone, United Kingdom",
    slug: "silverstone",
    country: "Great_Britain",
    image: "silverstone.avif",
    remoteDetailFilename: "Great_Britain_Circuit.webp",
  },
  {
    name: "Circuit de Spa-Francorchamps",
    location: "Stavelot, Belgium",
    slug: "spa",
    country: "Belgium",
    image: "spa.avif",
    remoteDetailFilename: "Belgium_Circuit.webp",
  },
  {
    name: "Hungaroring",
    location: "Budapest, Hungary",
    slug: "hungaroring",
    country: "Hungary",
    image: "hungaroring.avif",
    remoteDetailFilename: "Hungary_Circuit.webp",
  },
  {
    name: "Circuit Zandvoort",
    location: "Zandvoort, Netherlands",
    slug: "zandvoort",
    country: "Netherlands",
    image: "zandvoort.avif",
    remoteDetailFilename: "Netherlands_Circuit.webp",
  },
  {
    name: "Monza (Autodromo Nazionale Monza)",
    location: "Monza, Italy",
    slug: "monza",
    country: "Italy",
    image: "monza.avif",
    remoteDetailFilename: "Italy_Circuit.webp",
  },
  {
    name: "Baku City Circuit",
    location: "Baku, Azerbaijan",
    slug: "baku",
    country: "Azerbaijan",
    image: "baku.avif",
    remoteDetailFilename: "Azerbaijan_Circuit.webp",
  },
  {
    name: "Marina Bay Street Circuit",
    location: "Singapore",
    slug: "marina_bay",
    country: "Singapore",
    image: "marina_bay.avif",
    remoteDetailFilename: "Singapore_Circuit.webp",
  },
  {
    name: "Circuit of the Americas",
    location: "Austin, USA",
    slug: "americas",
    country: "USA",
    image: "americas.avif",
    remoteDetailFilename: "USA_Circuit.webp",
  },
  {
    name: "Autódromo Hermanos Rodríguez",
    location: "Mexico City, Mexico",
    slug: "hermanos_rodriguez",
    country: "Mexico",
    image: "hermanos_rodriguez.avif",
    remoteDetailFilename: "Mexico_Circuit.webp",
  },
  {
    name: "Interlagos (Autódromo José Carlos Pace)",
    location: "São Paulo, Brazil",
    slug: "interlagos",
    country: "Brazil",
    image: "interlagos.avif",
    remoteDetailFilename: "Brazil_Circuit.webp",
  },
  {
    name: "Las Vegas Street Circuit",
    location: "Las Vegas, USA",
    slug: "las_vegas",
    country: "Las_Vegas",
    image: "las_vegas.avif",
    remoteDetailFilename: "Las_Vegas_Circuit.webp",
  },
  {
    name: "Losail International Circuit",
    location: "Lusail, Qatar",
    slug: "losail",
    country: "Qatar",
    image: "losail.avif",
    remoteDetailFilename: "Qatar_Circuit.webp",
  },
  {
    name: "Yas Marina Circuit",
    location: "Abu Dhabi, UAE",
    slug: "yas_marina",
    country: "Abu_Dhabi",
    image: "yas_marina.avif",
    remoteDetailFilename: "Abu_Dhabi_Circuit.webp",
  },
];

export const BASE_F1MEDIA_URL =
  "https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000000/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/";

export function getCircuitDetailImageUrl(remoteDetailFilename: string): string {
  return `${BASE_F1MEDIA_URL}${remoteDetailFilename}`;
}

