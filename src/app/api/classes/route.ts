//@ts-nocheck
import { NextResponse } from 'next/server'
import { PrismaClient, Level } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET all classes
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const classes = await prisma.class.findMany({
      orderBy: [{ level: 'asc' }, { section: 'asc' }],
    });
    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des classes:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// POST a new class for a given level
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { level } = (await req.json()) as { level: Level };
    if (!level || !Object.values(Level).includes(level)) {
      return NextResponse.json({ error: 'Niveau invalide' }, { status: 400 })
    }

    // Find the latest section for the given level
    const lastClass = await prisma.class.findFirst({
      where: { level },
      orderBy: { section: 'desc' },
    });

    let nextSection = 'A';
    if (lastClass) {
      // Increment the character code (A -> B, B -> C, ...)
      nextSection = String.fromCharCode(lastClass.section.charCodeAt(0) + 1);
    }

    const newClass = await prisma.class.create({
      data: {
        level,
        section: nextSection,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    // Handle potential duplicate error (though logic should prevent it)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Une classe avec ce nom existe déjà' }, { status: 409 })
    }
    console.error("Erreur lors de la création de la classe:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}