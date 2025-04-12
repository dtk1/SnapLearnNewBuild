"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react"

type Flashcard = {
  question: string
  answer: string
}

type Collection = {
  id: string
  name: string
  flashcards: Flashcard[]
}

export default function CollectionViewPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [collectionName, setCollectionName] = useState("")
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"learning" | "spaced">("learning")
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set())
  const [reviewCards, setReviewCards] = useState<Set<number>>(new Set())

  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    async function fetchCollection() {
      try {
        const response = await fetch(`/api/load-flashcards`)
        const data = await response.json()
        if (data.success) {
          const collection: Collection | undefined = data.collections.find((col: Collection) => col.id === id)

          if (collection) {
            setCollectionName(collection.name)
            setFlashcards(collection.flashcards)

            // Load progress from localStorage
            const savedProgress = localStorage.getItem(`collection_progress_${id}`)
            if (savedProgress) {
              const { knownIndices, reviewIndices, lastIndex } = JSON.parse(savedProgress)
              setKnownCards(new Set(knownIndices))
              setReviewCards(new Set(reviewIndices))
              setCurrentIndex(lastIndex < collection.flashcards.length ? lastIndex : 0)
            }

            updateProgress(collection.flashcards.length)
          } else {
            router.push("/saved-flashcards")
          }
        }
      } catch (error) {
        console.error("❌ Ошибка загрузки коллекции:", error)
      }
    }
    fetchCollection()
  }, [id, router])

  const updateProgress = (totalCards: number) => {
    const knownCount = knownCards.size
    const newProgress = Math.round((knownCount / totalCards) * 100)
    setProgress(newProgress)

    // Save progress to localStorage
    localStorage.setItem(
      `collection_progress_${id}`,
      JSON.stringify({
        knownIndices: Array.from(knownCards),
        reviewIndices: Array.from(reviewCards),
        lastIndex: currentIndex,
      }),
    )
  }

  const nextCard = () => {
    setFlipped(false)
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // If we're in spaced repetition mode and have cards to review
        if (mode === "spaced" && reviewCards.size > 0) {
          // Convert set to array and get the first card to review
          const reviewIndices = Array.from(reviewCards)
          setCurrentIndex(reviewIndices[0])

          // Remove this card from the review set
          const newReviewCards = new Set(reviewCards)
          newReviewCards.delete(reviewIndices[0])
          setReviewCards(newReviewCards)
        } else {
          // Start over from the beginning
          setCurrentIndex(0)
        }
      }
    }, 300)
  }

  const prevCard = () => {
    setFlipped(false)
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else {
        // Wrap around to the last card
        setCurrentIndex(flashcards.length - 1)
      }
    }, 300)
  }

  const markAsKnown = () => {
    const newKnownCards = new Set(knownCards)
    newKnownCards.add(currentIndex)
    setKnownCards(newKnownCards)

    updateProgress(flashcards.length)
    nextCard()
  }

  const markForReview = () => {
    const newReviewCards = new Set(reviewCards)
    newReviewCards.add(currentIndex)
    setReviewCards(newReviewCards)

    nextCard()
  }

  const resetProgress = () => {
    setKnownCards(new Set())
    setReviewCards(new Set())
    setCurrentIndex(0)
    setProgress(0)
    localStorage.removeItem(`collection_progress_${id}`)
  }

  const toggleMode = () => {
    setMode(mode === "learning" ? "spaced" : "learning")
    setCurrentIndex(0)
    setFlipped(false)
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6 text-center">
          <CardContent>
            <p className="text-lg mb-4">Загрузка карточек...</p>
            <Button onClick={() => router.push("/saved-flashcards")} variant="outline">
              Вернуться к коллекциям
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/saved-flashcards")}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к коллекциям
            </Button>
            <Button variant="outline" size="sm" onClick={toggleMode}>
              {mode === "learning" ? "Режим интервального повторения" : "Обычный режим"}
            </Button>
          </div>
          <CardTitle className="text-center text-2xl mt-2">{collectionName}</CardTitle>
          <CardDescription className="text-center">
            Карточка {currentIndex + 1} из {flashcards.length}
          </CardDescription>
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-right text-sm text-gray-500 mt-1">Прогресс: {progress}%</p>
          </div>
        </CardHeader>

        <CardContent className="flex justify-center p-6">
          <div className="relative w-full max-w-lg h-[300px] perspective-1000">
            <motion.div
              className="relative w-full h-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setFlipped(!flipped)}
            >
              {/* Front Side */}
              <motion.div
                className="absolute w-full h-full bg-white shadow-xl rounded-2xl flex items-center justify-center text-center p-6 cursor-pointer hover:shadow-2xl transition-shadow border border-gray-200"
                style={{ backfaceVisibility: "hidden" }}
              >
                <h2 className="text-2xl font-semibold text-[#1E3A5F]">{flashcards[currentIndex].question}</h2>
              </motion.div>

              {/* Back Side */}
              <motion.div
                className="absolute w-full h-full bg-[#1E3A5F] shadow-xl rounded-2xl flex items-center justify-center text-center p-6 text-white cursor-pointer hover:shadow-2xl transition-shadow"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                <h2 className="text-2xl font-semibold">{flashcards[currentIndex].answer}</h2>
              </motion.div>
            </motion.div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={prevCard} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Предыдущая
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={markForReview}
                className="flex items-center text-yellow-600 border-yellow-600"
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Повторить
              </Button>
              <Button onClick={markAsKnown} className="flex items-center bg-green-600 hover:bg-green-700">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Знаю
              </Button>
            </div>

            <Button variant="outline" onClick={nextCard} className="flex items-center">
              Следующая
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={resetProgress} className="flex items-center self-center">
            <RotateCcw className="mr-2 h-4 w-4" />
            Сбросить прогресс
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

