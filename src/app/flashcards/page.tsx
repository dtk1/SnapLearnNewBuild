"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, BookOpen, BrainCircuit } from "lucide-react"

export default function GenerateFlashcardsPage() {
  const [note, setNote] = useState("")
  const [topic, setTopic] = useState("")
  const [url, setUrl] = useState("")
  const [numFlashcards, setNumFlashcards] = useState(10)
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // ✅ Из текста
  const generateFlashcards = async () => {
    if (!note.trim()) {
      alert("Пожалуйста, введите текст для создания карточек.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("https://deepseekproxy-production.up.railway.app/flashcards/generate-from-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: note, numFlashcards }),
      })

      const data = await response.json()
      if (data.success) {
        setFlashcards(data.flashcards)
        localStorage.setItem("flashcards", JSON.stringify(data.flashcards))
      } else {
        alert("❌ Не удалось создать карточки.")
      }
    } catch (error) {
      console.error("❌ Ошибка создания карточек:", error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ По теме
  const generateFlashcardsByTopic = async () => {
    if (!topic.trim()) {
      alert("Пожалуйста, введите тему для создания карточек.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("https://deepseekproxy-production.up.railway.app/flashcards/generate-from-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })

      const data = await response.json()
      if (data.success) {
        setFlashcards(data.flashcards)
        localStorage.setItem("flashcards", JSON.stringify(data.flashcards))
      } else {
        alert("❌ Не удалось создать карточки по теме.")
      }
    } catch (error) {
      console.error("❌ Ошибка создания карточек по теме:", error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Из URL
  const generateFlashcardsByUrl = async () => {
    if (!url.trim()) {
      alert("Пожалуйста, введите URL страницы.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("https://deepseekproxy-production.up.railway.app/flashcards/generate-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, numFlashcards }),
      })

      const data = await response.json()
      if (data.success) {
        setFlashcards(data.flashcards)
        localStorage.setItem("flashcards", JSON.stringify(data.flashcards))
      } else {
        alert("❌ Не удалось создать карточки из URL.")
      }
    } catch (error) {
      console.error("❌ Ошибка создания карточек из URL:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveFlashcards = async () => {
    if (flashcards.length === 0) {
      alert("Нет карточек для сохранения!")
      return
    }

    const collectionName = prompt("Введите название коллекции:") || topic
    if (!collectionName) {
      alert("Название коллекции обязательно!")
      return
    }

    try {
      const response = await fetch("/api/save-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionName, flashcards }),
      })

      const result = await response.json()
      if (result.success) {
        setSaved(true)
        alert(`✅ Карточки сохранены в коллекции: ${collectionName}`)
      } else {
        alert("❌ Не удалось сохранить карточки.")
      }
    } catch (error) {
      console.error("❌ Ошибка сохранения карточек:", error)
    }
  }

  const viewFlashcards = () => {
    router.push("/flashcards/view")
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1E3A5F]">Создать флеш-карточки</h1>

      {!flashcards.length ? (
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
                  <Label htmlFor="notes">Введите текст для создания карточек</Label>
                  <Textarea
                    id="notes"
                    className="min-h-[200px] p-4 text-base"
                    placeholder="Вставьте сюда текст лекции, главы учебника или заметки..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num-flashcards">Количество карточек</Label>
                  <Input
                    id="num-flashcards"
                    type="number"
                    min="1"
                    max="20"
                    value={numFlashcards}
                    onChange={(e) => setNumFlashcards(Number(e.target.value))}
                  />
                </div>

                <Button
                  onClick={generateFlashcards}
                  className="w-full bg-[#1E3A5F] hover:bg-[#15294a] mt-4"
                  disabled={loading}
                >
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация...</>) : "Создать карточки"}
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

                  <div className="space-y-2">
                    <Label htmlFor="num-flashcards-url">Количество карточек</Label>
                    <Input
                      id="num-flashcards-url"
                      type="number"
                      min="1"
                      max="20"
                      value={numFlashcards}
                      onChange={(e) => setNumFlashcards(Number(e.target.value))}
                    />
                  </div>

                  <Button
                    onClick={generateFlashcardsByUrl}
                    className="w-full bg-[#1E3A5F] hover:bg-[#15294a]"
                    disabled={loading}
                  >
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация...</>) : "Создать карточки из URL"}
                  </Button>
                </div>
              </TabsContent>

              {/* ✅ Tab: AI тема */}
              <TabsContent value="ai">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Тема для карточек</Label>
                    <Input
                      id="topic"
                      placeholder="Например: История России, Квантовая физика, Программирование на Python"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={generateFlashcardsByTopic}
                    className="w-full bg-[#1E3A5F] hover:bg-[#15294a]"
                    disabled={loading}
                  >
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация...</>) : "Сгенерировать карточки по теме"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader>
            <CardTitle>Созданные карточки</CardTitle>
            <CardDescription>Просмотрите созданные карточки перед сохранением</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {flashcards.map((card, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <p className="font-semibold">Вопрос: {card.question}</p>
                  <p className="mt-2 text-gray-700">Ответ: {card.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setFlashcards([])
                setNote("")
                setTopic("")
                setUrl("")
              }}
            >
              Создать новые
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={viewFlashcards}>
                Изучать
              </Button>
              <Button
                onClick={saveFlashcards}
                className="bg-[#1E3A5F] hover:bg-[#15294a]"
                disabled={saved}
              >
                {saved ? "Сохранено ✓" : "Сохранить коллекцию"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
