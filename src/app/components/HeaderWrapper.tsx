"use client"

import { usePathname } from "next/navigation"
import Header from "../header"

export default function HeaderWrapper() {
  const pathname = usePathname()
  const hideHeader = pathname === "/"

  if (hideHeader) return null

  return <Header />
}
