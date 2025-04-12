import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import  prisma  from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        collections: {
          include: { flashcards: true },
        },
      },
    })

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404 })
    }

    return new Response(JSON.stringify({ success: true, collections: user.collections }))
  } catch (error) {
    console.error("❌ Load flashcards error:", error)
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 })
  }
}
