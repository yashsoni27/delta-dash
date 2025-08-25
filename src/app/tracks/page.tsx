"use client";
import { useState, useEffect } from "react";
import TrackCard from "@/components/ui/TrackCard";
import { f1MediaService ,raceService } from "@/lib/api";

export default function TracksPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<null | { name: string; imageUrl: string }>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const raceCalendar = await raceService.getRaceCalendar();
        console.log("Checking :", raceCalendar);
        const uniqueCircuits: { [id: string]: any } = {};
        for (const race of raceCalendar.data.Races) {
          const c = race.Circuit;
          uniqueCircuits[c.circuitId] = {
            name: c.circuitName,
            location: c.Location.locality,
            country: c.Location.country,
            circuitId: c.circuitId,
          };
        }
        setTracks(Object.values(uniqueCircuits));
      } catch (err) {
        console.error("Failed to fetch circuit data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  {/*for modal image*/}
  async function handleCardClick(track: { name: string; circuitId: string }) {
    setModalLoading(true);
    const imageUrl = await f1MediaService.getTrackImg(track.circuitId);
    setModalLoading(false);

    setSelected({
      name: track.name,
      imageUrl: imageUrl || "", 
    });
  }

  function closeModal() {
    setSelected(null);
  }

  if (loading) return <div className="text-white p-10">Loading circuits...</div>;

  return (
    <div className="container mx-auto py-10 min-h-screen w-full">
      <h1 className="text-3xl font-bold mb-8 text-white">All F1 Circuits</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 justify-items-center">
        {tracks.map((track) => (
          <TrackCard
            key={track.circuitId}
            name={track.name}
            location={track.location}
            country={track.country}
            circuitId={track.circuitId}
            onClick={() => handleCardClick(track)}
          />
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="relative w-full max-w-[950px] max-h-[90vh] bg-black rounded-xl shadow-2xl flex flex-col p-0 overflow-hidden">
            <button
              className="absolute top-5 right-7 text-3xl text-white hover:text-red-400 bg-black/30 rounded-full p-1 z-10"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>
            <div className="p-8 pb-4">
              <h2 className="text-2xl font-bold mb-6 text-center text-white">{selected.name}</h2>
              {modalLoading && <p className="text-white text-center">Loading image...</p>}
            </div>
            <div className="flex-1 flex items-center justify-center px-8 pb-8">
              {selected.imageUrl && !modalLoading ? (
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="max-w-full max-h-[70vh] rounded-lg bg-[#222] object-contain"
                  style={{ width: "100%", height: "auto" }}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
