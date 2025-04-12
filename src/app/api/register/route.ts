import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Пользователь уже существует" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    return NextResponse.json({ message: "Регистрация успешна", user: newUser })
  } catch (error: unknown) {
    let errorMessage = "Ошибка сервера"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    console.error("❌ Ошибка регистрации:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

