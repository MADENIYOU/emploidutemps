//@ts-nocheck
import { NextResponse } from 'next/server'
import { PrismaClient, Level } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { subjectId, hoursPerWeek, targetLevels } = await req.json();

    if (!subjectId || hoursPerWeek == null || !targetLevels || !Array.isArray(targetLevels)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // For each target level, upsert the course
    for (const level of targetLevels) {
      await prisma.course.upsert({
        where: {
          level_subjectId: {
            level: level as Level,
            subjectId: subjectId,
          },
        },
        update: { hoursPerWeek: parseFloat(hoursPerWeek) },
        create: {
          level: level as Level,
          subjectId: subjectId,
          hoursPerWeek: parseFloat(hoursPerWeek),
        },
      });
    }

    return NextResponse.json({ message: 'Configuration appliquée avec succès.' }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur lors de l'application de la configuration:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}