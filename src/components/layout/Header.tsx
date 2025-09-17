//@ts-nocheck
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CircleUser } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Enseignants' },
  { href: '/timetables', label: 'Emplois du temps' },
  { href: '/subjects', label: 'Gestion Matières' },
  { href: '/classes', label: 'Gestion Classes' },
];

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Ne pas afficher la navigation sur la page de login
  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
      {/* Left Section */}
      <div className="flex-1">
        <Link href="/" className="text-2xl font-bold text-[#4CAF50]">
          G.E.T
        </Link>
      </div>

      {/* Center Navigation */}
      {session?.user.role === 'PRINCIPAL' && (
        <nav className="flex-1 flex justify-center">
            <ul className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
                {navItems.map(item => (
                    <li key={item.href}>
                        <Link 
                            href={item.href} 
                            className={cn(
                                "px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 whitespace-nowrap",
                                pathname === item.href ? "bg-gray-200 text-gray-900 font-semibold" : ""
                            )}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
      )}

      {/* Right Section */}
      <div className="flex-1 flex justify-end items-center">
        {session?.user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm hidden sm:inline-flex items-center gap-1 whitespace-nowrap">
                <CircleUser className="w-5 h-5" /> 
                <span className="font-semibold">{session.user.email}</span>
            </span>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>
                Déconnexion
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button>Se connecter</Button>
          </Link>
        )}
      </div>
    </header>
  )
}