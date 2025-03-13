"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

type Flashcard = {
  question: string;
  answer: string;
};

type Collection = {
  id: string;
  name: string;
  flashcards: Flashcard[];
};

export default function CollectionViewPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchCollection() {
      try {
        const response = await fetch(`/api/get-collections`);
        const data = await response.json();
        if (data.success) {
          const collection: Collection | undefined = data.collections.find(
            (col: Collection) => col.id === id
          );

          if (collection) {
            setCollectionName(collection.name);
            setFlashcards(collection.flashcards);
          } else {
            router.push("/saved-flashcards");
          }
        }
      } catch (error) {
        console.error("❌ Ошибка загрузки коллекции:", error);
      }
    }
    fetchCollection();
  }, [id, router]);

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 300);
  };

  if (flashcards.length === 0) {
    return <p className="text-center mt-10">Loading flashcards...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#274060]">{collectionName}</h1>

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
            <h2 className="text-2xl font-semibold">{flashcards[currentIndex].answer}</h2>
          </motion.div>
        </motion.div>
      </div>

      {/* Next Button */}
      <button
        onClick={nextCard}
        className="mt-6 bg-[#274060] text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-[#1f354d] transition-all shadow-md hover:shadow-xl hover:scale-105"
      >
        Next Card
      </button>

      {/* Back to Collections */}
      <button
        onClick={() => router.push("/saved-flashcards")}
        className="mt-4 bg-gray-600 text-white py-2 px-6 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-xl"
      >
        Back to Collections
      </button>
    </div>
  );
}
