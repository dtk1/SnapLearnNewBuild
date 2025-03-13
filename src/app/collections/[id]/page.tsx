"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ✅ Use this instead of params prop

export default function ViewCollectionPage() {
  const { id } = useParams(); // ✅ Get id dynamically
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch(`/api/get-flashcards?collectionId=${id}`);
        const data = await response.json();
        setFlashcards(data.flashcards);
      } catch (error) {
        console.error("❌ Error fetching flashcards:", error);
      }
    };

    if (id) fetchFlashcards(); // ✅ Prevent fetching if id is undefined
  }, [id]);

  if (!id) {
    return <p className="text-center mt-10 text-red-500">Invalid collection ID</p>;
  }

  if (flashcards.length === 0) {
    return <p className="text-center mt-10">Loading flashcards...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#274060]">Flashcards in Collection</h1>
      {flashcards.map((card, index) => (
        <div key={index} className="border-b border-gray-300 py-3">
          <p className="text-lg font-semibold">{card.question}</p>
          <p className="text-gray-600">{card.answer}</p>
        </div>
      ))}
    </div>
  );
}
