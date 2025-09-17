//@ts-nocheck
import { NextResponse } from 'next/server'
import { PrismaClient, Level } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// DELETE the latest class section for a given level
export async function DELETE(req: Request) {
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

    if (!lastClass) {
      return NextResponse.json({ error: 'Aucune classe à supprimer pour ce niveau' }, { status: 404 })
    }

    const deletedClass = await prisma.class.delete({
      where: { id: lastClass.id },
    });

    return NextResponse.json(deletedClass, { status: 200 });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la dernière classe:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
