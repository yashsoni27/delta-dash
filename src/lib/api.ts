// API keys and endpoints
const JOLPICA_API_BASE = 'https://api.jolpi.ca/ergast/f1/';
const API_KEY = process.env.JOLPICA_API_KEY || '';

// Interface for API response types
interface ApiResponse<T> {
  data: T;
  status: number;
}

// Generic fetch function with error handling
async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${JOLPICA_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data as T;
}

// Season information
export async function getCurrentSeason() {
  return fetchFromApi('/season/current');
}

// Driver standings
export async function getDriverStandings(season = 'current') {
  return fetchFromApi(`/standings/drivers/${season}`);
}

// Constructor standings
export async function getConstructorStandings(season = 'current') {
  return fetchFromApi(`/standings/constructors/${season}`);
}

// Race calendar
export async function getRaceCalendar(season = 'current') {
  return fetchFromApi(`/races/${season}`);
}

// Race results
export async function getRaceResults(season: string, round: string) {
  return fetchFromApi(`/results/${season}/${round}`);
}

// Driver information
export async function getDriverInfo(driverId: string) {
  return fetchFromApi(`/drivers/${driverId}`);
}

// Constructor information
export async function getConstructorInfo(constructorId: string) {
  return fetchFromApi(`/constructors/${constructorId}`);
}