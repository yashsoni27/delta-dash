"use client";
import { useState } from "react";
import { tracks, getCircuitDetailImageUrl } from "@/lib/tracks";
import TrackCard from "@/components/ui/TrackCard";

export default function TracksPage() {
  const [selected, setSelected] = useState<null | { name: string; imageUrl: string }>(null);

  function handleCardClick(track: { name: any; location?: string; slug?: string; country?: string; remoteDetailFilename: any; }) {
    setSelected({
      name: track.name,
      imageUrl: getCircuitDetailImageUrl(track.remoteDetailFilename)
    });
  }

  function closeModal() {
    setSelected(null);
  }

  return (
    <div className="container mx-auto py-10 min-h-screen w-full ">
  <h1 className="text-3xl font-bold mb-8 text-white">All F1 Circuits</h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 justify-items-center">
    {tracks.map((track) => (
      <TrackCard
        key={track.slug}
        name={track.name}
        location={track.location}
        image={track.image}
        onClick={() => handleCardClick(track)}
      />
    ))}
  </div>

      {/* Detailed Image */}
      {selected && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
    <div
      className="
        relative
        w-full
        max-w-[950px]
        max-h-[90vh]
        bg-[#181c23]
        rounded-xl
        shadow-2xl
        flex flex-col
        p-0
        overflow-hidden
        "
    >
      <button
        className="absolute top-5 right-7 text-3xl text-white hover:text-red-400 bg-black/30 rounded-full p-1 z-10"
        onClick={closeModal}
        aria-label="Close modal"
      >
        ×
      </button>
      <div className="p-8 pb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">{selected.name}</h2>
      </div>
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <img
          src={selected.imageUrl}
          alt={selected.name}
          className="max-w-full max-h-[70vh] rounded-lg bg-[#222] object-contain"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
     
    </div>
  </div>
)}

    </div>
  );
}
