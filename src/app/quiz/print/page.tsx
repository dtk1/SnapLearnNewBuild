"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, ArrowLeft, Download } from "lucide-react"

export default function PrintQuizPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [quizTitle, setQuizTitle] = useState("Тест")
  const [showAnswers, setShowAnswers] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions")
    const storedNotes = localStorage.getItem("quizNotes")

    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions)
        setQuestions(parsedQuestions)

        // ✅ Исправлено: убрал JSON.parse, так как storedNotes — это просто строка
        if (storedNotes) {
          const title = storedNotes.split(" ").slice(0, 5).join(" ") + "..."
          setQuizTitle(title)
        }
      } catch (error) {
        console.error("Error parsing stored questions:", error)
        router.push("/quiz")
      }
    } else {
      router.push("/quiz")
    }
  }, [router])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    alert("Функция скачивания PDF будет доступна в ближайшем обновлении")
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <CardContent>
            <p className="text-lg mb-4">Загрузка вопросов...</p>
            <Button onClick={() => router.push("/quiz")} variant="outline">
              Вернуться к созданию теста
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>

          <div className="space-x-2">
            <Button variant="outline" onClick={() => setShowAnswers(!showAnswers)}>
              {showAnswers ? "Скрыть ответы" : "Показать ответы"}
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Скачать PDF
            </Button>
            <Button onClick={handlePrint} className="bg-[#1E3A5F] hover:bg-[#15294a] flex items-center">
              <Printer className="mr-2 h-4 w-4" />
              Печать
            </Button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1E3A5F]">{quizTitle}</h1>
            <p className="text-gray-500">Количество вопросов: {questions.length}</p>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="border-b pb-4">
                <p className="font-semibold mb-2">
                  {index + 1}. {question.question}
                </p>

                {question.options ? (
                  <div className="ml-6 space-y-1">
                    {question.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-start">
                        <div className="h-5 w-5 border rounded-sm mr-2 mt-0.5"></div>
                        <p>{option}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-6 h-8 border-b border-dashed"></div>
                )}

                {showAnswers && (
                  <div className="mt-2 text-green-700 print:text-black">
                    <p>
                      <strong>Ответ:</strong> {question.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
