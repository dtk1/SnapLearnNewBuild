"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const hideDashboardButton = pathname === "/login" || pathname === "/signup"

  return (
    <header className="bg-[#1E3A5F] text-white p-4 flex justify-between items-center">
      {session ? (
        <span className="text-xl font-bold cursor-default">SnapLearn</span>
      ) : (
        <Link href="/" className="text-xl font-bold">
          SnapLearn
        </Link>
      )}

      <nav className="flex items-center gap-6">
        {!hideDashboardButton && session && (
          <Link href="/dashboard" className="hover:underline text-lg">
            Dashboard
          </Link>
        )}

        {session && (
          <button
            onClick={() => signOut()}
            className="text-white px-4 py-2 rounded-md text-lg font-medium transition hover:underline cursor-pointer"
          >
            Выйти
          </button>
        )}
      </nav>
    </header>
  )
}

