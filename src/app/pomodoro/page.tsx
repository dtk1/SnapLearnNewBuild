
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Bell, BellOff, Coffee, Brain, Settings, List } from "lucide-react"
import { X } from "lucide-react"

type TimerMode = "focus" | "shortBreak" | "longBreak"
type TimerStatus = "idle" | "running" | "paused" | "finished"

export default function PomodoroPage() {
  // Timer settings
  const [focusDuration, setFocusDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [longBreakInterval, setLongBreakInterval] = useState(4)

  // Timer state
  const [mode, setMode] = useState<TimerMode>("focus")
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoStartBreaks, setAutoStartBreaks] = useState(true)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false)

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Tasks
  const [tasks, setTasks] = useState<{ id: number; text: string; completed: boolean }[]>([])
  const [newTask, setNewTask] = useState("")

  // Timer history
  const [history, setHistory] = useState<{ date: string; mode: TimerMode; duration: number }[]>([])

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/notification.mp3")

    // Load saved settings from localStorage
    const savedFocusDuration = localStorage.getItem("focusDuration")
    if (savedFocusDuration) setFocusDuration(Number.parseInt(savedFocusDuration))

    const savedShortBreakDuration = localStorage.getItem("shortBreakDuration")
    if (savedShortBreakDuration) setShortBreakDuration(Number.parseInt(savedShortBreakDuration))

    const savedLongBreakDuration = localStorage.getItem("longBreakDuration")
    if (savedLongBreakDuration) setLongBreakDuration(Number.parseInt(savedLongBreakDuration))

    const savedLongBreakInterval = localStorage.getItem("longBreakInterval")
    if (savedLongBreakInterval) setLongBreakInterval(Number.parseInt(savedLongBreakInterval))

    const savedSoundEnabled = localStorage.getItem("soundEnabled")
    if (savedSoundEnabled) setSoundEnabled(savedSoundEnabled === "true")

    const savedAutoStartBreaks = localStorage.getItem("autoStartBreaks")
    if (savedAutoStartBreaks) setAutoStartBreaks(savedAutoStartBreaks === "true")

    const savedAutoStartPomodoros = localStorage.getItem("autoStartPomodoros")
    if (savedAutoStartPomodoros) setAutoStartPomodoros(savedAutoStartPomodoros === "true")

    // Load tasks
    const savedTasks = localStorage.getItem("pomodoroTasks")
    if (savedTasks) setTasks(JSON.parse(savedTasks))

    // Load history
    const savedHistory = localStorage.getItem("pomodoroHistory")
    if (savedHistory) setHistory(JSON.parse(savedHistory))

    // Set initial time
    setTimeLeft(focusDuration * 60)

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Update timer when settings change
  useEffect(() => {
    if (status === "idle") {
      switch (mode) {
        case "focus":
          setTimeLeft(focusDuration * 60)
          break
        case "shortBreak":
          setTimeLeft(shortBreakDuration * 60)
          break
        case "longBreak":
          setTimeLeft(longBreakDuration * 60)
          break
      }
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration, mode, status])

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("focusDuration", focusDuration.toString())
    localStorage.setItem("shortBreakDuration", shortBreakDuration.toString())
    localStorage.setItem("longBreakDuration", longBreakDuration.toString())
    localStorage.setItem("longBreakInterval", longBreakInterval.toString())
    localStorage.setItem("soundEnabled", soundEnabled.toString())
    localStorage.setItem("autoStartBreaks", autoStartBreaks.toString())
    localStorage.setItem("autoStartPomodoros", autoStartPomodoros.toString())
  }, [
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    soundEnabled,
    autoStartBreaks,
    autoStartPomodoros,
  ])

  // Save tasks when they change
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("/api/pomodoro/tasks")
        const data = await response.json()
        setTasks(data.tasks || [])
      } catch (error) {
        console.error("Ошибка загрузки задач:", error)
      }
    }
  
    fetchTasks()
  }, [])

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem("pomodoroHistory", JSON.stringify(history))
  }, [history])

  const startTimer = () => {
    if (status === "running") return

    setStatus("running")

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!)

          // Play sound if enabled
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch((e) => console.error("Error playing sound:", e))
          }

          // Add to history
          const newHistoryEntry = {
            date: new Date().toISOString(),
            mode,
            duration: mode === "focus" ? focusDuration : mode === "shortBreak" ? shortBreakDuration : longBreakDuration,
          }

          setHistory((prev) => [...prev, newHistoryEntry])

          // Handle session completion
          if (mode === "focus") {
            const newCompletedSessions = completedSessions + 1
            setCompletedSessions(newCompletedSessions)

            // Determine next break type
            const nextMode = newCompletedSessions % longBreakInterval === 0 ? "longBreak" : "shortBreak"

            setMode(nextMode)
            setStatus("finished")

            // Auto start break if enabled
            if (autoStartBreaks) {
              setTimeout(() => {
                setStatus("running")
                setTimeLeft(nextMode === "longBreak" ? longBreakDuration * 60 : shortBreakDuration * 60)

                startTimer()
              }, 500)
            } else {
              setTimeLeft(nextMode === "longBreak" ? longBreakDuration * 60 : shortBreakDuration * 60)
            }
          } else {
            // Break finished, go back to focus mode
            setMode("focus")
            setStatus("finished")

            // Auto start next pomodoro if enabled
            if (autoStartPomodoros) {
              setTimeout(() => {
                setStatus("running")
                setTimeLeft(focusDuration * 60)
                startTimer()
              }, 500)
            } else {
              setTimeLeft(focusDuration * 60)
            }
          }

          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setStatus("paused")
  }

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setStatus("idle")

    switch (mode) {
      case "focus":
        setTimeLeft(focusDuration * 60)
        break
      case "shortBreak":
        setTimeLeft(shortBreakDuration * 60)
        break
      case "longBreak":
        setTimeLeft(longBreakDuration * 60)
        break
    }
  }

  const changeMode = (newMode: TimerMode) => {
    if (status === "running") {
      pauseTimer()
    }

    setMode(newMode)
    setStatus("idle")

    switch (newMode) {
      case "focus":
        setTimeLeft(focusDuration * 60)
        break
      case "shortBreak":
        setTimeLeft(shortBreakDuration * 60)
        break
      case "longBreak":
        setTimeLeft(longBreakDuration * 60)
        break
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const addTask = async () => {
    if (newTask.trim() === "") return
  
    try {
      const response = await fetch("/api/pomodoro/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTask }),
      })
      const data = await response.json()
  
      setTasks([...tasks, data.task])
      setNewTask("")
    } catch (error) {
      console.error("Ошибка добавления задачи:", error)
    }
  }
  

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = async (id: number) => {
    try {
      await fetch(`/api/pomodoro/tasks?id=${id}`, { method: "DELETE" })
      setTasks(tasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error("Ошибка удаления задачи:", error)
    }
  }
  

  const getProgressPercentage = () => {
    let total
    switch (mode) {
      case "focus":
        total = focusDuration * 60
        break
      case "shortBreak":
        total = shortBreakDuration * 60
        break
      case "longBreak":
        total = longBreakDuration * 60
        break
    }

    return ((total - timeLeft) / total) * 100
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#1E3A5F]">Pomodoro Timer</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-center">
                <Tabs defaultValue="focus" onValueChange={(value) => changeMode(value as TimerMode)}>
                <TabsList className="grid grid-cols-3 w-full max-w-md">
    <TabsTrigger
      value="focus"
      className={mode === "focus" ? "bg-[#1E3A5F] text-white" : ""}
    >
      <Brain className="w-4 h-4 mr-2" />
      Фокус
    </TabsTrigger>
    <TabsTrigger
      value="shortBreak"
      className={mode === "shortBreak" ? "bg-[#00A86B] text-white" : ""}
    >
      <Coffee className="w-4 h-4 mr-2" />
      Короткий
    </TabsTrigger>
    <TabsTrigger
      value="longBreak"
      className={mode === "longBreak" ? "bg-[#4F46E5] text-white" : ""}
    >
      <Coffee className="w-4 h-4 mr-2" />
      Длинный
    </TabsTrigger>
  </TabsList>

  {/* Контент вкладок, если есть */}
  {/* <TabsContent value="focus">...</TabsContent> */}
</Tabs>

                </div>
              </CardHeader>

              <CardContent className="flex flex-col items-center pt-6">
                <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={mode === "focus" ? "#1E3A5F" : mode === "shortBreak" ? "#00A86B" : "#4F46E5"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * getProgressPercentage()) / 100}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span
                      className={`text-5xl font-bold ${
                        mode === "focus"
                          ? "text-[#1E3A5F]"
                          : mode === "shortBreak"
                            ? "text-[#00A86B]"
                            : "text-[#4F46E5]"
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-gray-500 mt-2">
                      {mode === "focus"
                        ? "Время фокусировки"
                        : mode === "shortBreak"
                          ? "Короткий перерыв"
                          : "Длинный перерыв"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  {status === "running" ? (
                    <Button
                      onClick={pauseTimer}
                      size="lg"
                      className={`px-8 ${
                        mode === "focus"
                          ? "bg-[#1E3A5F] hover:bg-[#15294a]"
                          : mode === "shortBreak"
                            ? "bg-[#00A86B] hover:bg-[#047857]"
                            : "bg-[#4F46E5] hover:bg-[#3730a3]"
                      }`}
                    >
                      <Pause className="mr-2 h-5 w-5" />
                      Пауза
                    </Button>
                  ) : (
                    <Button
                      onClick={startTimer}
                      size="lg"
                      className={`px-8 ${
                        mode === "focus"
                          ? "bg-[#1E3A5F] hover:bg-[#15294a]"
                          : mode === "shortBreak"
                            ? "bg-[#00A86B] hover:bg-[#047857]"
                            : "bg-[#4F46E5] hover:bg-[#3730a3]"
                      }`}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      {status === "paused" ? "Продолжить" : "Старт"}
                    </Button>
                  )}

                  <Button onClick={resetTimer} size="lg" variant="outline">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Сброс
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-500">
                    Завершено сессий: <span className="font-semibold">{completedSessions}</span>
                  </p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <div className="w-3 h-3 rounded-full bg-[#1E3A5F]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#00A86B]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#4F46E5]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Настройки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="focus-duration">Длительность фокуса (мин)</Label>
                      <span className="font-medium">{focusDuration}</span>
                    </div>
                    <Slider
                      id="focus-duration"
                      min={5}
                      max={60}
                      step={5}
                      value={[focusDuration]}
                      onValueChange={(value) => setFocusDuration(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="short-break">Короткий перерыв (мин)</Label>
                      <span className="font-medium">{shortBreakDuration}</span>
                    </div>
                    <Slider
                      id="short-break"
                      min={1}
                      max={15}
                      step={1}
                      value={[shortBreakDuration]}
                      onValueChange={(value) => setShortBreakDuration(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="long-break">Длинный перерыв (мин)</Label>
                      <span className="font-medium">{longBreakDuration}</span>
                    </div>
                    <Slider
                      id="long-break"
                      min={5}
                      max={30}
                      step={5}
                      value={[longBreakDuration]}
                      onValueChange={(value) => setLongBreakDuration(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="long-break-interval">Интервал длинного перерыва</Label>
                      <span className="font-medium">{longBreakInterval}</span>
                    </div>
                    <Slider
                      id="long-break-interval"
                      min={2}
                      max={6}
                      step={1}
                      value={[longBreakInterval]}
                      onValueChange={(value) => setLongBreakInterval(value[0])}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                      <Label htmlFor="sound-toggle">Звуковые уведомления</Label>
                    </div>
                    <Switch id="sound-toggle" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-breaks">Автоматически начинать перерывы</Label>
                    <Switch id="auto-breaks" checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-pomodoros">Автоматически начинать фокус</Label>
                    <Switch id="auto-pomodoros" checked={autoStartPomodoros} onCheckedChange={setAutoStartPomodoros} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 w-[400px]">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <List className="w-5 h-5 mr-2" />
                  Задачи
                </CardTitle>
                <CardDescription>Добавьте задачи для текущей сессии</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex mb-4">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Добавить задачу..."
                    className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                  <Button onClick={addTask} className="rounded-l-none bg-[#1E3A5F] hover:bg-[#15294a]">
                    Добавить
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {tasks.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Нет активных задач</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center p-2 border rounded-md hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]"
                        />
                        <span className={`flex-1 ${task.completed ? "line-through text-gray-400" : ""}`}>
                          {task.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
