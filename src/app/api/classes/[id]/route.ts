//@ts-nocheck
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// PATCH update a class
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { id } = params
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Le nom de la classe est requis' }, { status: 400 })
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedClass, { status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Une classe avec ce nom existe déjà' }, { status: 409 })
    }
    console.error("Erreur lors de la mise à jour de la classe:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// DELETE a class
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { id } = params

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Classe supprimée avec succès' }, { status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 })
    }
    console.error("Erreur lors de la suppression de la classe:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
