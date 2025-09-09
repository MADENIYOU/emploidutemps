import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { id } = params
    const { firstName, lastName, subjects } = await req.json()

    if (!firstName || !lastName || !subjects || subjects.length === 0) {
      return NextResponse.json({ error: 'Prénom, nom et au moins une matière requis' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        subjects,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedUser, { status: 200 })

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    // P2025 is Prisma's code for "record not found"
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
