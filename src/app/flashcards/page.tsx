"use client";

import { useState } from "react";

export default function GenerateFlashcardsPage() {
  const [note, setNote] = useState("");
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const generateFlashcards = async () => {
    if (!note.trim()) {
      alert("Please enter a note to generate flashcards.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://deepseekproxy-production.up.railway.app/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: note, numFlashcards }),
      });

      const data = await response.json();
      if (data.success) {
        setFlashcards(data.flashcards);
      } else {
        alert("❌ Failed to generate flashcards.");
      }
    } catch (error) {
      console.error("❌ Error generating flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveFlashcards = async () => {
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
        setSaved(true);
        alert(`✅ Flashcards saved in collection: ${collectionName}`);
      } else {
        alert("❌ Failed to save flashcards.");
      }
    } catch (error) {
      console.error("❌ Error saving flashcards:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#274060]">Generate Flashcards</h1>

      {!flashcards.length && (
        <>
          {/* Text input */}
          <textarea
            className="w-[500px] h-[150px] border border-gray-300 rounded-lg p-4 shadow-md"
            placeholder="Enter your notes here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <label className="mt-4 font-semibold text-[#274060]">
            Enter the number of flashcards:
          </label>
          {/* Number input */}
          <input
            type="number"
            min="1"
            max="20"
            value={numFlashcards}
            onChange={(e) => setNumFlashcards(Number(e.target.value))}
            className="mt-4 w-32 text-center border border-gray-300 rounded-lg py-2 px-4 shadow-md"
          />

          {/* Generate button */}
          <button
            onClick={generateFlashcards}
            className="mt-4 bg-[#274060] text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Flashcards"}
          </button>
        </>
      )}

      {/* Generated cards view */}
      {flashcards.length > 0 && (
        <div className="mt-6 w-[500px] bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Flashcards:</h2>
          <ul className="space-y-2">
            {flashcards.map((card, index) => (
              <li key={index} className="border-b py-2">
                <strong>Q:</strong> {card.question} <br />
                <strong>A:</strong> {card.answer}
              </li>
            ))}
          </ul>

          {/* Save button */}
          {!saved && (
            <button
              onClick={saveFlashcards}
              className="mt-6 w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
            >
              Save Flashcards
            </button>
          )}
        </div>
      )}
    </div>
  );
}
