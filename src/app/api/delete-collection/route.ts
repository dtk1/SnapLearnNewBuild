import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const collectionId = searchParams.get("id")

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    console.log(`🗑️ Attempting to delete collection with ID: ${collectionId}`)

    // Проверяем, принадлежит ли коллекция пользователю
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        user: { email: session.user.email },
      },
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found or access denied" }, { status: 404 })
    }

    const deletedCollection = await prisma.collection.delete({
      where: { id: collectionId },
    })

    console.log("✅ Collection deleted:", deletedCollection)

    return NextResponse.json({ success: true, message: `Collection ${collectionId} deleted`, deletedCollection })
  } catch (error: any) {
    console.error("❌ Error deleting collection:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 })
  }
}
