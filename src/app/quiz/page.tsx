"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, BookOpen, FileText, BrainCircuit } from "lucide-react"

export default function QuizPage() {
  const [notes, setNotes] = useState("")
  const [topic, setTopic] = useState("")
  const [url, setUrl] = useState("")
  const [numQuestions, setNumQuestions] = useState(5)
  const [quizType, setQuizType] = useState("multiple-choice")
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // ✅ Генерация из текста
  const generateQuestions = async () => {
    if (!notes.trim()) {
      alert("Пожалуйста, введите текст для генерации вопросов.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("https://deepseekproxy-production.up.railway.app/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, numQuestions, quizType }),
      })

      const data = await response.json()
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions)
        localStorage.setItem("quizQuestions", JSON.stringify(data.questions))
        localStorage.setItem("quizNotes", notes)

        if (quizType === "multiple-choice") {
          router.push("/quiz/take")
        }
      } else {
        alert("❌ Не удалось сгенерировать вопросы.")
        setQuestions([])
      }
    } catch (error) {
      console.error("❌ Ошибка генерации вопросов:", error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ Генерация по теме
  const generateQuizByTopic = async () => {
    if (!topic.trim()) {
      alert("Пожалуйста, введите тему для создания квиза.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("https://deepseekproxy-production.up.railway.app/quiz/generate-from-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numQuestions, quizType }),
      })

      const data = await response.json()
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions)
        localStorage.setItem("quizQuestions", JSON.stringify(data.questions))
        localStorage.setItem("quizTopic", topic)

        if (quizType === "multiple-choice") {
          router.push("/quiz/take")
        }
      } else {
        alert("❌ Не удалось сгенерировать вопросы по теме.")
        setQuestions([])
      }
    } catch (error) {
      console.error("❌ Ошибка генерации вопросов по теме:", error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ Генерация из URL
  const generateQuizByUrl = async () => {
    if (!url.trim()) {
      alert("Пожалуйста, введите URL страницы.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("https://deepseekproxy-production.up.railway.app/quiz/generate-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, numQuestions, quizType }),
      })

      const data = await response.json()
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions)
        localStorage.setItem("quizQuestions", JSON.stringify(data.questions))
        localStorage.setItem("quizUrl", url)

        if (quizType === "multiple-choice") {
          router.push("/quiz/take")
        }
      } else {
        alert("❌ Не удалось сгенерировать тест из URL.")
        setQuestions([])
      }
    } catch (error) {
      console.error("❌ Ошибка генерации теста из URL:", error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1E3A5F]">Создать тест</h1>

      <Card className="w-full max-w-3xl shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Из текста</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Из URL</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                <span>AI тема</span>
              </TabsTrigger>
            </TabsList>

            {/* ✅ Tab: Из текста */}
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Введите текст для создания вопросов</Label>
                <Textarea
                  id="notes"
                  className="min-h-[200px] p-4 text-base"
                  placeholder="Вставьте сюда текст лекции, главы учебника или заметки..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <CommonOptions />
              <Button onClick={generateQuestions} className="w-full bg-[#1E3A5F] hover:bg-[#15294a]" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация...</> : "Создать тест"}
              </Button>
            </TabsContent>

            {/* ✅ Tab: Из URL */}
            <TabsContent value="url">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL страницы</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>

                <CommonOptions />
                <Button onClick={generateQuizByUrl} className="w-full bg-[#1E3A5F] hover:bg-[#15294a]" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация...</> : "Сгенерировать тест из URL"}
                </Button>
              </div>
            </TabsContent>

            {/* ✅ Tab: AI тема */}
            <TabsContent value="ai">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Тема для теста</Label>
                  <Input
                    id="topic"
                    placeholder="Например: История России, Квантовая физика, Программирование на Python"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <CommonOptions />
                <Button onClick={generateQuizByTopic} className="w-full bg-[#1E3A5F] hover:bg-[#15294a]" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация...</> : "Сгенерировать тест по теме"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {questions.length > 0 && quizType !== "multiple-choice" && (
        <Card className="w-full max-w-3xl mt-8 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#1E3A5F]">Сгенерированные вопросы:</h2>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white">
                  <p className="font-medium">Вопрос {index + 1}: {q.question}</p>
                  <p className="mt-2 text-gray-700">Ответ: {q.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  localStorage.setItem("quizQuestions", JSON.stringify(questions))
                  router.push("/quiz/print")
                }}
                variant="outline"
                className="mr-2"
              >
                Распечатать
              </Button>
              <Button
                onClick={() => {
                  setQuestions([])
                  setNotes("")
                  setTopic("")
                  setUrl("")
                }}
                variant="destructive"
              >
                Очистить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // 🎨 Общая часть опций для всех вкладок
  function CommonOptions() {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quiz-type">Тип теста</Label>
          <Select value={quizType} onValueChange={setQuizType}>
            <SelectTrigger id="quiz-type">
              <SelectValue placeholder="Выберите тип теста" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple-choice">Тест с вариантами ответов</SelectItem>
              <SelectItem value="open-ended">Вопросы с открытым ответом</SelectItem>
              <SelectItem value="true-false">Верно/Неверно</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="num-questions">Количество вопросов</Label>
          <Input
            id="num-questions"
            type="number"
            min="1"
            max="15"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
          />
        </div>
      </div>
    )
  }
}
