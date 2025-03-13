import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const flashcards = await prisma.flashcard.findMany({
      orderBy: { createdAt: "desc" }, 
    });

    return NextResponse.json({ flashcards });
  } catch (error: unknown) { // 🔹 Use `unknown` instead of `any`
    let errorMessage = "An unknown error occurred.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("❌ Error fetching flashcards:", errorMessage);

    return NextResponse.json(
      { error: `Failed to fetch flashcards: ${errorMessage}` },
      { status: 500 }
    );
  }
}
