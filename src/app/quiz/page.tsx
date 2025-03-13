"use client";

import { useState } from "react";

export default function QuizPage() {
  const [notes, setNotes] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    if (!notes.trim()) {
      alert("Please enter notes to generate quiz questions.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://deepseekproxy-production.up.railway.app/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, numQuestions }),
      });

      const data = await response.json();
      console.log("🔹 API Response:", data);

      if (data.success && Array.isArray(data.questions)) {
        console.log("✅ Questions received:", data.questions);
        setQuestions(data.questions); // ✅ FIXED: No extra `.questions` nesting
      } else {
        alert("❌ Failed to generate quiz questions.");
        setQuestions([]); // Prevents crash
      }
    } catch (error) {
      console.error("❌ Error generating questions:", error);
      setQuestions([]); // Prevents crash
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#274060]">Generate Quiz Questions</h1>

      {!questions.length && (
        <>
          <textarea
            className="w-[500px] h-[150px] border border-gray-300 rounded-lg p-4 shadow-md"
            placeholder="Enter your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <label className="mt-4 font-semibold text-[#274060]">Enter number of questions:</label>
          <input
            type="number"
            min="1"
            max="15"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="mt-2 w-32 text-center border border-gray-300 rounded-lg py-2 px-4 shadow-md"
          />
          <button
            onClick={generateQuestions}
            className="mt-4 bg-[#274060] text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </>
      )}

      {questions.length > 0 && (
        <div className="mt-6 w-[500px] bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Quiz:</h2>
          <ul className="space-y-2">
            {questions.map((q, index) => (
              <li key={index} className="border-b py-2">
                <strong>Q:</strong> {q.question} <br />
                <strong>A:</strong> {q.answer}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
