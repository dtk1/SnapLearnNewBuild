"use client";

import { useSession} from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="text-center mt-10">Загрузка...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-#F4F6F8 text-gray-900">
      <div className="bg-white shadow-lg rounded-lg p-8 w-[400px] text-center">
        <h1 className="text-3xl font-bold mb-6 text-[#1E3A5F]">Choose a Mode</h1>

        {/* Mode Choose buttons */}
        <div className="space-y-4">
          <Link
            href="/quiz"
            className="block w-full text-center bg-[#007BFF] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#1E40AF] transition-all shadow-md hover:shadow-lg"
          >
            Quiz Mode
          </Link>
          <Link
            href="/flashcards"
            className="block w-full text-center bg-[#00A86B] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#047857] transition-all shadow-md hover:shadow-lg"
          >
            Flashcards Mode
          </Link>
          <Link
            href="/saved-flashcards"
            className="block w-full text-center bg-[#FF9800] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#b56c00] transition-all shadow-md hover:shadow-lg"
          >
            Saved Flashcards
          </Link>
        </div>
      </div>
    </div>
  );
}
