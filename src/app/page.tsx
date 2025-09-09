import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PrincipalDashboard } from "@/components/dashboards/PrincipalDashboard"
import { TeacherDashboard } from "@/components/dashboards/TeacherDashboard"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Bienvenue sur le Gestionnaire d'Emploi du Temps</h1>
        <Link href="/login">
          <Button>Se connecter</Button>
        </Link>
      </div>
    )
  }

  if (session.user.role === 'PRINCIPAL') {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center">Tableau de Bord Principal</h1>
        <PrincipalDashboard initialTeachers={teachers} />
      </div>
    )
  }

  if (session.user.role === 'TEACHER') {
    return <TeacherDashboard user={session.user} />
  }

  return null
}
