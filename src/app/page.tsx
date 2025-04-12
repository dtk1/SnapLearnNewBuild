import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="container mx-auto flex justify-between items-center py-6 px-8">
        <h1 className="text-2xl font-semibold">SnapLearn</h1>
        <Link href="/login">
          <Button className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">Войти</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto text-center py-24 px-6">
        <h2 className="text-5xl font-bold leading-tight text-gray-900">Учись быстрее, создавай тесты мгновенно</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          SnapLearn помогает ученикам эффективно готовиться к экзаменам, а учителям — создавать тесты и учебные
          материалы всего за несколько секунд.
        </p>
        <Link href="/signup">
          <Button className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition">
            Начать бесплатно
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-16">
        {[
          {
            title: "🎓 Для учеников",
            desc: "Создавайте флеш-карточки из заметок и быстро запоминайте материал.",
          },
          {
            title: "📝 Для учителей",
            desc: "Генерируйте тесты и викторины для учеников на основе лекций.",
          },
          {
            title: "⚡ Искусственный интеллект",
            desc: "Автоматическая генерация вопросов и ответов для максимальной эффективности.",
          },
        ].map((feature, index) => (
          <Card key={index} className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Footer */}
      <footer className="container mx-auto text-center py-8 text-gray-600">
        &copy; {new Date().getFullYear()} SnapLearn - Интеллектуальная учебная платформа 🚀
      </footer>
    </div>
  )
}

