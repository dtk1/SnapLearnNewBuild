import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login", // куда редиректить если нет сессии
  },
})

// Ограничиваем защищённые роуты
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/collections/:path*",
    "/flashcards/:path*",
    "/quiz/:path*",
    "/pomodoro/:path*",
    "/api/get-collection",
    "/api/get-flashcards",
    "/api/save-flashcards",
    "/api/delete-collection",
    // добавляй другие защищённые API сюда
  ],
}
