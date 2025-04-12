import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Проверяем сессию
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { collectionName, flashcards } = body

    if (!collectionName || !flashcards || !Array.isArray(flashcards)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Создаём коллекцию вместе с карточками
    const collection = await prisma.collection.create({
      data: {
        name: collectionName,
        userId: user.id,
        flashcards: {
          create: flashcards.map((card: any) => ({
            question: card.question,
            answer: card.answer,
          })),
        },
      },
    })

    return NextResponse.json({ success: true, collection })
  } catch (error) {
    console.error("❌ Save flashcards error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
