"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function TakeQuizPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [answers, setAnswers] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions")
    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions)

        // Ensure each question has options
        const processedQuestions = parsedQuestions.map((q: any) => {
          if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
            // If no options, create some based on the answer
            const correctAnswer = q.answer
            const fakeOptions = ["Это неверный вариант ответа", "Это тоже неверный вариант", "И этот вариант неверный"]

            // Shuffle and take 3 fake options
            const shuffledFakes = fakeOptions.sort(() => Math.random() - 0.5).slice(0, 3)

            // Add the correct answer and shuffle again
            const options = [...shuffledFakes, correctAnswer].sort(() => Math.random() - 0.5)

            return { ...q, options }
          }
          return q
        })

        setQuestions(processedQuestions)
      } catch (error) {
        console.error("Error parsing stored questions:", error)
        router.push("/quiz")
      }
    } else {
      router.push("/quiz")
    }
  }, [router])

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const checkAnswer = () => {
    if (!selectedAnswer) return

    setIsAnswered(true)
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.answer

    if (isCorrect) {
      setScore(score + 1)
    }

    // Save the answer
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = selectedAnswer
    setAnswers(newAnswers)
  }

 const nextQuestion = async () => {
  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1)
    setSelectedAnswer("")
    setIsAnswered(false)
  } else {
    setQuizCompleted(true)

    const quizResult = {
      score: score + (selectedAnswer === questions[currentQuestionIndex].answer ? 1 : 0),
      totalQuestions: questions.length,
      details: questions.map((q, i) => ({
        question: q.question,
        correctAnswer: q.answer,
        userAnswer: answers[i] || selectedAnswer,
      })),
    }
    console.log("📦 Quiz result payload:", quizResult) // <--- Добавь эту строчку

    try {
      const response = await fetch("/api/save-quiz-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizResult),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Error saving quiz history:", data.error)
      } else {
        console.log("✅ Quiz history saved:", data)
      }
    } catch (error) {
      console.error("❌ Network error saving quiz history:", error)
    }
  }
}

    
  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer("")
    setIsAnswered(false)
    setScore(0)
    setQuizCompleted(false)
    setAnswers([])
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

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {!quizCompleted ? (
        <Card className="w-full max-w-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Вопрос {currentQuestionIndex + 1} из {questions.length}
                </span>
                <span className="text-sm font-medium">Счет: {score}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-[#1E3A5F]">{currentQuestion.question}</h2>

                <RadioGroup value={selectedAnswer} className="space-y-3" onValueChange={handleAnswerSelect}>
                  {currentQuestion.options?.map((option: string, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-4 rounded-lg border transition-colors ${
                        isAnswered
                          ? option === currentQuestion.answer
                            ? "border-green-500 bg-green-50"
                            : selectedAnswer === option
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer py-2">
                        {option}
                      </Label>
                      {isAnswered && option === currentQuestion.answer && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {isAnswered && selectedAnswer === option && option !== currentQuestion.answer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => router.push("/quiz")}>
                Выйти
              </Button>

              {!isAnswered ? (
                <Button onClick={checkAnswer} disabled={!selectedAnswer} className="bg-[#1E3A5F] hover:bg-[#15294a]">
                  Проверить
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="bg-[#1E3A5F] hover:bg-[#15294a]">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Следующий <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Завершить тест"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Тест завершен!</h2>
              <p className="text-lg">
                Ваш результат: <span className="font-bold">{score}</span> из{" "}
                <span className="font-bold">{questions.length}</span> ({Math.round((score / questions.length) * 100)}%)
              </p>

              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className="bg-[#1E3A5F] h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${(score / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <h3 className="font-semibold text-lg">Результаты по вопросам:</h3>

              {questions.map((question, index) => {
                const userAnswer = answers[index] || ""
                const isCorrect = userAnswer === question.answer

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <p className="font-medium">
                      {index + 1}. {question.question}
                    </p>
                    <div className="mt-2 text-sm">
                      <p>
                        <span className="font-semibold">Ваш ответ:</span> {userAnswer || "Не отвечено"}
                        {isCorrect ? (
                          <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="inline-block ml-2 h-4 w-4 text-red-500" />
                        )}
                      </p>
                      {!isCorrect && (
                        <p className="text-green-700">
                          <span className="font-semibold">Правильный ответ:</span> {question.answer}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                На главную
              </Button>

              <div className="space-x-2">
                <Button variant="outline" onClick={() => router.push("/quiz")}>
                  Новый тест
                </Button>
                <Button onClick={restartQuiz} className="bg-[#1E3A5F] hover:bg-[#15294a] flex items-center">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Пройти снова
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

