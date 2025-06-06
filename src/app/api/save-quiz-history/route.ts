import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const savedHistory = await prisma.quizHistory.create({
      data: {
        userId: user.id,
        date: new Date(),
        score: body.score,
        totalQuestions: body.totalQuestions,
        details: body.details,
      },
    })

    return NextResponse.json({ success: true, history: savedHistory })
  } catch (error) {
    console.error("❌ Error saving quiz history:", error)
    return NextResponse.json({ error: "Failed to save quiz history" }, { status: 500 })
  }
}
