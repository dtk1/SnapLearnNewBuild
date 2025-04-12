import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import  prisma  from "@/lib/prisma"

// GET: получить все задачи пользователя
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const tasks = await prisma.task.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ tasks })
}

// POST: добавить новую задачу
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { text } = await req.json()
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })

  const task = await prisma.task.create({
    data: {
      text,
      userId: user!.id,
    },
  })

  return NextResponse.json({ task })
}

// DELETE: удалить задачу
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
  }

  await prisma.task.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
