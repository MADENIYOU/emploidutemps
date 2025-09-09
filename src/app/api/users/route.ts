
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { email, firstName, lastName, subjects } = await req.json()
    const password = "passer123" // Mot de passe par défaut

    if (!email || !firstName || !lastName || !subjects || subjects.length === 0) {
      return NextResponse.json({ error: 'Email, prénom, nom et au moins une matière requis' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 409 })
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        subjects,
        password: hashedPassword,
        role: 'TEACHER', // Le rôle est défini ici
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 })

  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
