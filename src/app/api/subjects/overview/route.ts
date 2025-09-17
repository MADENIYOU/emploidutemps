//@ts-nocheck

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const subjectsWithCourses = await prisma.subject.findMany({
      include: {
        courses: {
          select: {
            id: true, // Need course ID for updates
            level: true,
            hoursPerWeek: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(subjectsWithCourses, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'aperçu des matières:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
