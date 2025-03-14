import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📌 Received request body:", body); 

    const { collectionName, flashcards } = body;

    if (!collectionName || !flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json({ error: "Invalid input: collectionName and flashcards array are required" }, { status: 400 });
    }

    const savedCollection = await prisma.collection.create({
      data: {
        name: collectionName,
        flashcards: { create: flashcards.map(f => ({ question: f.question, answer: f.answer })) },
      },
    });

    console.log("✅ Successfully saved collection:", savedCollection);
    return NextResponse.json({ success: true, savedCollection });
  } catch (error) {
    console.error("❌ Error saving flashcards:", error);
    return NextResponse.json({ error: "Failed to save flashcards" }, { status: 500 });
  }
}
