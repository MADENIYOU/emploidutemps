
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CircleUser } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-[#4CAF50]">
        Gestionnaire d'Emploi du Temps
      </Link>
      <nav className="flex items-center space-x-6">
        {session?.user ? (
          <>
            <span className="text-gray-700 text-sm hidden sm:inline flex items-center gap-1 whitespace-nowrap"><CircleUser className="w-5 h-5" /> <span className="font-semibold">{session.user.email}</span></span>
            <Button variant="outline" onClick={() => signOut({
              callbackUrl: '/login'
            })}>Déconnexion</Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Se connecter</Button>
          </Link>
        )}
      </nav>
    </header>
  )
}
