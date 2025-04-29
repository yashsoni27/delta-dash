import { PaginationInfo } from "@/types";

/* -------------------------------------------------------------------------- */
/*                     Transform Response for Jolpica API                     */
/* -------------------------------------------------------------------------- */
export function transformResponse<T>(
  mrData: any,
  dataKey: string
): { data: T } & PaginationInfo {
  return {
    data: mrData[`${dataKey}Table`],
    total: parseInt(mrData.total),
    limit: parseInt(mrData.limit),
    offset: parseInt(mrData.offset),
  };
}

/* -------------------------------------------------------------------------- */
/*                    Formats seconds into a minute format                    */
/* -------------------------------------------------------------------------- */
export function formatTime(timeString: string | number): string {
  if (typeof timeString === "string" && !timeString) return "";

  const seconds = Number(timeString);
  if (isNaN(seconds)) return "";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.round((seconds % 1) * 1000);

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

/* -------------------------------------------------------------------------- */
/*                   Converts minute format to total seconds                  */
/* -------------------------------------------------------------------------- */
export function minuteStrToSeconds(timeString: string): number {
  if (!timeString) return 0;

  const [minutePart, secondPart] = timeString.split(":");
  if (!minutePart || !secondPart) return 0;

  const minutes = parseInt(minutePart);
  const seconds = parseFloat(secondPart);

  if (isNaN(minutes) || isNaN(seconds)) return 0;

  return Number((minutes * 60 + seconds).toFixed(3));
}

/* -------------------------------------------------------------------------- */
/*              Formats a date string into a human-readable date              */
/* -------------------------------------------------------------------------- */
export function formatDate(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/*                Calculates time difference between two dates                */
/* -------------------------------------------------------------------------- */
export function getTimeDifference(date1: Date, date2: Date): string {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
}

/* -------------------------------------------------------------------------- */
/*                  Gets a color in hex code for a constructor                */
/* -------------------------------------------------------------------------- */
export function getConstructorHex(constructorName: string): string {
  const colors: Record<string, string> = {
    mercedes: "#27F4D2",
    red_bull: "#3671C6",
    ferrari: "#E80020",
    mclaren: "#FF8000",
    alpine: "#00A1E8",
    rb: "#6692FF",
    aston_martin: "#229971",
    williams: "#1868DB",
    sauber: "#52E252",
    haas: "#B6BABD",
  };

  return colors[constructorName] || "#333333";
}

/* -------------------------------------------------------------------------- */
/*               Gets a lighter version of the color in hexCode               */
/* -------------------------------------------------------------------------- */
export function lightenColor(hexColor: string, factor: number = 0.3) {
  hexColor = hexColor.replace('#', '');
  
  // Convert hex to RGB
  let r = parseInt(hexColor.substring(0, 2), 16);
  let g = parseInt(hexColor.substring(2, 4), 16);
  let b = parseInt(hexColor.substring(4, 6), 16);
  
  // Lighten each component
  r = Math.round(r + (255 - r) * factor);
  g = Math.round(g + (255 - g) * factor);
  b = Math.round(b + (255 - b) * factor);
  
  // Convert back to hex
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}

/* -------------------------------------------------------------------------- */
/*                   Gets a color in rgb for a constructor                    */
/* -------------------------------------------------------------------------- */
export function getConstructorColor(constructorName: string): string {
  const colors: Record<string, string> = {
    mercedes: "rgb(39,244,210,.25)",
    red_bull: "rgb(54,113,198,.25)",
    ferrari: "rgb(232,0,32,.25)",
    mclaren: "rgb(255,128,0,.25)",
    alpine: "rgb(0,161,232,.25)",
    rb: "rgb(102,146,255,.25)",
    aston_martin: "rgb(34,153,113,.25)",
    williams: "rgb(24,104,219,.25)",
    sauber: "rgb(82,226,82,.25)",
    haas: "rgb(182,186,189,.25)",
  };

  return colors[constructorName] || "#333333";
}

/* -------------------------------------------------------------------------- */
/*                   Gets color in gradient for constructors                  */
/* -------------------------------------------------------------------------- */
export function getConstructorGradient(constructorName: string): string {
  const baseColor = getConstructorColor(constructorName);
  // Extract RGB values to create a darker shade for the gradient
  const rgbMatch = baseColor.match(/rgb\((\d+),(\d+),(\d+),([.\d]+)\)/);

  if (rgbMatch) {
    const [_, r, g, b, a] = rgbMatch;
    // Create a darker variant for the gradient (reducing brightness by ~30%)
    const darkerR = Math.max(0, parseInt(r) * 0.1);
    const darkerG = Math.max(0, parseInt(g) * 0.1);
    const darkerB = Math.max(0, parseInt(b) * 0.1);

    return `linear-gradient(180deg, ${baseColor} 0%, rgb(${darkerR},${darkerG},${darkerB},${a}) 100%)`;
  }

  return baseColor;
}

/* -------------------------------------------------------------------------- */
/*                        Get jolpica DHL constructorId                       */
/* -------------------------------------------------------------------------- */
export function DHLtoJolpicaConstructor(constructorName: string): string {
  const constructors: Record<string, string> = {
    Mercedes: "mercedes",
    "Red Bull": "red_bull",
    Ferrari: "ferrari",
    McLaren: "mclaren",
    Alpine: "alpine",
    "Racing Bulls": "rb",
    "Aston Martin": "aston_martin",
    Williams: "williams",
    Sauber: "sauber",
    Haas: "haas",
  };

  return constructors[constructorName] || "Unknown";
}

export const capitalizeWords = (str: string): string => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export function circuitIdToF1Adapter(circuitId: string): string | null {
  const circuit: Record<string, string> = {
    albert_park: "Australia",
    shanghai: "China",
    suzuka: "Japan",
    bahrain: "Bahrain",
    jeddah: "Saudi_Arabia",
    miami: "Miami",
    imola: "Emilia_Romagna",
    monaco: "Monaco",
    catalunya: "Spain",
    villeneuve: "Canada",
    red_bull_ring: "Austria",
    silverstone: "Great_Britain",
    spa: "Belgium",
    hungaroring: "Hungary",
    zandvoort: "Netherlands",
    monza: "Italy",
    baku: "Azerbaijan",
    marina_bay: "Singapore",
    americas: "USA",
    rodriguez: "Mexico",
    interlagos: "Brazil",
    vegas: "Las_Vegas",
    losail: "Qatar",
    yas_marina: "Abu_Dhabi",
  };

  return circuit[circuitId] || null;
}

/* -------------------------------------------------------------------------- */
/*                     convert DHL table response to JSON                     */
/* -------------------------------------------------------------------------- */
export function convertPitStopTableToJson(htmlString: string) {
  if (!htmlString) {
    return null;
  }
  const cleanHtml = htmlString.replace(/\n/g, "").replace(/\s+/g, " ").trim();

  const results: {
    position: number;
    team: string;
    driver: string;
    time: number;
    lap: number;
    points: number;
  }[] = [];

  // Extract all table rows using regex
  const rowRegex = /<tr>.*?<\/tr>/g;
  const rows = cleanHtml.match(rowRegex) || [];

  const dataRows = rows.slice(1);

  // Skip the header row and process data rows
  dataRows.forEach((row) => {
    const position = row?.match(/<td[^>]*><strong>(\d+)<\/strong>/)?.[1];
    const team = row?.match(/<td>([^<]+)<\/td>/)?.[1]?.trim();
    const driver = row
      .match(/<td>([^<]+)<\/td>/g)?.[1]
      ?.replace(/<td>|<\/td>/g, "")
      .trim();
    const time = row.match(/<td>(\d+\.\d+)<\/td>/)?.[1];
    const lap = row.match(/<td>(\d+)<\/td>/)?.[1];
    const points = row.match(/<td><strong>(\d*)<\/strong>/)?.[1];

    if (position && team && driver && time && lap) {
      results.push({
        position: parseInt(position),
        team,
        driver,
        time: parseFloat(time),
        lap: parseInt(lap),
        points: points ? parseInt(points) : 0,
      });
    }
  });

  return results;
}
