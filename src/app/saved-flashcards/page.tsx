"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Plus, Trash2 } from "lucide-react"

type Collection = {
  id: string
  name: string
  flashcards: { question: string; answer: string }[]
}

export default function SavedFlashcardsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchCollections() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/load-flashcards")
        const data = await response.json()
        if (data.success) {
          setCollections(data.collections as Collection[])
        }
      } catch (error) {
        console.error("❌ Ошибка загрузки коллекций:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCollections()
  }, [])

  const deleteCollection = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту коллекцию?")) {
      return
    }

    try {
      const response = await fetch(`/api/delete-collection?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCollections(collections.filter((collection) => collection.id !== id))
      } else {
        alert("Не удалось удалить коллекцию")
      }
    } catch (error) {
      console.error("❌ Ошибка удаления коллекции:", error)
    }
  }

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Сохраненные коллекции</h1>
          <Button
            onClick={() => router.push("/flashcards")}
            className="bg-[#1E3A5F] hover:bg-[#15294a] flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать новую
          </Button>
        </div>

        <Card className="mb-6 shadow-md">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск коллекций..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Загрузка коллекций...</p>
          </div>
        ) : filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-[#1E3A5F]" />
                    {collection.name}
                  </CardTitle>
                  <CardDescription>{collection.flashcards.length} карточек</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {collection.flashcards.slice(0, 2).map((card, idx) => (
                      <span key={idx} className="block truncate">
                        {idx + 1}. {card.question}
                      </span>
                    ))}
                    {collection.flashcards.length > 2 && (
                      <span className="block text-gray-400 italic">...и еще {collection.flashcards.length - 2}</span>
                    )}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCollection(collection.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                  <Button
                    onClick={() => router.push(`/saved-flashcards/${collection.id}`)}
                    className="bg-[#1E3A5F] hover:bg-[#15294a]"
                  >
                    Изучать
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Нет сохраненных коллекций</h3>
            <p className="mt-2 text-gray-500">Создайте новые карточки и сохраните их в коллекцию</p>
            <Button onClick={() => router.push("/flashcards")} className="mt-4 bg-[#1E3A5F] hover:bg-[#15294a]">
              Создать карточки
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

