"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ViewFlashcardsPage() {
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedFlashcards = localStorage.getItem("flashcards");
    if (storedFlashcards) {
      setFlashcards(JSON.parse(storedFlashcards));
    } else {
      router.push("/flashcards");
    }
  }, [router]);

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 300);
  };

  const handleSaveFlashcards = async () => {
    if (flashcards.length === 0) {
      alert("No flashcards to save!");
      return;
    }

    const collectionName = prompt("Enter a collection name:");
    if (!collectionName) {
      alert("Collection name is required!");
      return;
    }

    try {
      const response = await fetch("/api/save-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionName, flashcards }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ Flashcards saved in collection: ${collectionName}`);
      } else {
        alert("❌ Failed to save flashcards.");
      }
    } catch (error) {
      console.error("❌ Error saving flashcards:", error);
    }
  };

  if (flashcards.length === 0) {
    return <p className="text-center mt-10">Loading flashcards...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#274060]">
        Your Flashcards
      </h1>

      {/* Flashcard Container */}
      <div className="relative w-[500px] h-[300px] perspective-1000">
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front Side */}
          <motion.div
            className="absolute w-full h-full bg-white shadow-xl rounded-2xl flex items-center justify-center text-center p-6 cursor-pointer hover:scale-105 transition-transform border border-gray-200"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h2 className="text-2xl font-semibold text-[#274060]">
              {flashcards[currentIndex].question}
            </h2>
          </motion.div>

          {/* Back Side */}
          <motion.div
            className="absolute w-full h-full bg-[#274060] shadow-xl rounded-2xl flex items-center justify-center text-center p-6 text-white cursor-pointer hover:scale-105 transition-transform"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <h2 className="text-2xl font-semibold ">
              {flashcards[currentIndex].answer}
            </h2>
          </motion.div>
        </motion.div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSaveFlashcards} 
        className="mt-6 bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-xl hover:scale-105"
      >
        Save Flashcards
      </button>

      {/* Next Button */}
      <button
        onClick={nextCard}
        className="mt-6 bg-[#274060] text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-[#1f354d] transition-all shadow-md hover:shadow-xl hover:scale-105"
      >
        Next Card
      </button>
      
    </div>
  );
}
