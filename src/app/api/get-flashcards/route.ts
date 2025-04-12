import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // Проверяем сессию
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Получаем query параметры
    const { searchParams } = new URL(req.url)
    const collectionId = searchParams.get("collectionId")

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    // Проверяем, принадлежит ли коллекция пользователю
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        user: { email: session.user.email },
      },
      include: { flashcards: true },
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({ success: true, flashcards: collection.flashcards })
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred."
    if (error instanceof Error) {
      errorMessage = error.message
    }
    console.error("❌ Error fetching flashcards:", errorMessage)

    return NextResponse.json({ error: `Failed to fetch flashcards: ${errorMessage}` }, { status: 500 })
  }
}
