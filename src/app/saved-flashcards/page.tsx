"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Flashcard = {
  question: string;
  answer: string;
};

type Collection = {
  id: string;
  name: string;
  flashcards: Flashcard[];
};

export default function SavedFlashcardsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await fetch("/api/get-collections");
        const data = await response.json();
        if (data.success) {
          setCollections(data.collections as Collection[]);
        }
      } catch (error) {
        console.error("❌ Ошибка загрузки коллекций:", error);
      }
    }
    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#274060]">
        Saved Flashcard Collections
      </h1>

      <div className="max-w-3xl mx-auto space-y-6">
        {collections.map((collection) => (
          <div key={collection.id} className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-xl font-bold text-[#274060] mb-4">
              {collection.name}
            </h2>
            <button
              onClick={() => router.push(`/saved-flashcards/${collection.id}`)}
              className="mt-2 bg-[#274060] text-white py-2 px-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
            >
              View Collection
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
