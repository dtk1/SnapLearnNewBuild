"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, BrainCircuit, Clock, History, BarChart3, Settings } from "lucide-react"

type QuizHistory = {
  date: string
  score: number
  totalQuestions: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const [recentFlashcards, setRecentFlashcards] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
  
    // ✅ Загружаем историю из базы
    async function fetchQuizHistory() {
      try {
        const response = await fetch("/api/load-quiz-history")
        const data = await response.json()
  
        if (data.success) {
          setQuizHistory(data.history)
        } else {
          console.error("❌ Error loading quiz history:", data.error)
        }
      } catch (error) {
        console.error("❌ Network error loading quiz history:", error)
      }
    }
  
    // ✅ Загружаем последние флешкарты
    async function fetchRecentFlashcards() {
      try {
        const response = await fetch("/api/load-flashcards")
        const data = await response.json()
        if (data.success) {
          setRecentFlashcards(data.collections.slice(0, 3))
        }
      } catch (error) {
        console.error("Error fetching recent flashcards:", error)
      }
    }
  
    fetchQuizHistory()
    fetchRecentFlashcards()
  }, [status, router])
  

  if (status === "loading") {
    return <p className="text-center mt-10">Загрузка...</p>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-[#1E3A5F] text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Добро пожаловать, {session.user?.name || "Ученик"}!</h1>
          <p className="mt-2 text-gray-200">Продолжайте обучение с помощью интерактивных инструментов</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Обзор</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Недавние</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>История</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Настройки</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-[#1E3A5F] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    Создать тест
                  </CardTitle>
                  <CardDescription className="text-gray-200">Создайте тест на основе ваших материалов</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">
                    Загрузите текст или URL и создайте интерактивный тест с вопросами разных типов
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#1E3A5F] hover:bg-[#15294a]" onClick={() => router.push("/quiz")}>
                    Начать
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-[#00A86B] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Флеш-карточки
                  </CardTitle>
                  <CardDescription className="text-gray-200">Создайте карточки для запоминания</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">
                    Преобразуйте ваши заметки в интерактивные карточки для эффективного запоминания
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#00A86B] hover:bg-[#047857]" onClick={() => router.push("/flashcards")}>
                    Создать
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-[#4F46E5] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Таймер Помодоро
                  </CardTitle>
                  <CardDescription className="text-gray-200">Управляйте временем обучения</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">
                    Используйте технику Помодоро для эффективного распределения времени обучения
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#4F46E5] hover:bg-[#3730a3]" onClick={() => router.push("/pomodoro")}>
                    Запустить
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {quizHistory.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Ваша статистика</CardTitle>
                  <CardDescription>Ваши последние результаты тестирования</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quizHistory.slice(0, 3).map((quiz, index) => {
                      const date = new Date(quiz.date)
                      const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100)

                      return (
                        <div key={index} className="flex items-center justify-between p-2 border-b">
                          <div>
                            <p className="font-medium">{date.toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">{date.toLocaleTimeString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {quiz.score}/{quiz.totalQuestions}
                            </p>
                            <p
                              className={`text-sm ${
                                percentage >= 80
                                  ? "text-green-600"
                                  : percentage >= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {percentage}%
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document
                        .querySelector('[data-value="history"]')
                        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
                    }
                  >
                    Посмотреть всю историю
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Недавние материалы</CardTitle>
                <CardDescription>Ваши последние созданные материалы</CardDescription>
              </CardHeader>
              <CardContent>
                {recentFlashcards.length > 0 ? (
                  <div className="space-y-4">
                    {recentFlashcards.map((collection) => (
                      <div key={collection.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{collection.name}</h3>
                          <p className="text-sm text-gray-500">{collection.flashcards.length} карточек</p>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/saved-flashcards/${collection.id}`)}
                          >
                            Открыть
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">У вас пока нет сохраненных материалов</p>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="w-full" onClick={() => router.push("/saved-flashcards")}>
                    Все коллекции
                  </Button>
                  <Button className="w-full bg-[#1E3A5F]" onClick={() => router.push("/flashcards")}>
                    Создать новую
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>История тестов</CardTitle>
                <CardDescription>Ваши результаты по всем пройденным тестам</CardDescription>
              </CardHeader>
              <CardContent>
                {quizHistory.length > 0 ? (
                  <div className="space-y-4">
                    {quizHistory.map((quiz, index) => {
                      const date = new Date(quiz.date)
                      const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100)

                      return (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{date.toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">{date.toLocaleTimeString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {quiz.score}/{quiz.totalQuestions}
                              </p>
                              <p
                                className={`text-sm ${
                                  percentage >= 80
                                    ? "text-green-600"
                                    : percentage >= 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {percentage}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage >= 80 ? "bg-green-600" : percentage >= 60 ? "bg-yellow-600" : "bg-red-600"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">У вас пока нет пройденных тестов</p>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#1E3A5F]" onClick={() => router.push("/quiz")}>
                  Пройти новый тест
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Настройки</CardTitle>
                <CardDescription>Управляйте своим профилем и настройками приложения</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Профиль</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Имя</p>
                      <p>{session.user?.name || "Не указано"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{session.user?.email || "Не указан"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Настройки приложения</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p>Язык</p>
                      <Button variant="outline" size="sm">
                        Русский
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>Тема</p>
                      <Button variant="outline" size="sm">
                        Светлая
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}>
                  Редактировать профиль
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

