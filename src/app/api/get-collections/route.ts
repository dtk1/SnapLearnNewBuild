import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: { flashcards: true }, 
    });

    return NextResponse.json({ success: true, collections });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("❌ Ошибка загрузки коллекций:", errorMessage);

    return NextResponse.json(
      { error: `Failed to load collections: ${errorMessage}` },
      { status: 500 }
    );
  }
}
