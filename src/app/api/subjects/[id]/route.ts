//@ts-nocheck

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// PATCH update a subject
export async function PATCH(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { id } = context.params
    const body = await req.json()

    const dataToUpdate: { name?: string; dayOff?: any } = {};
    if (body.name !== undefined) {
      dataToUpdate.name = body.name;
    }
    if (body.dayOff !== undefined) {
      dataToUpdate.dayOff = body.dayOff;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }

    // Validate name only if it is provided
    if (body.name !== undefined && !body.name) {
      return NextResponse.json({ error: 'Le nom de la matière est requis' }, { status: 400 })
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Matière non trouvée' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Une matière avec ce nom existe déjà' }, { status: 409 })
    }
    console.error("Erreur lors de la mise à jour de la matière:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// DELETE a subject
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { id } = context.params

    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Matière supprimée avec succès' }, { status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Matière non trouvée' }, { status: 404 })
    }
    console.error("Erreur lors de la suppression de la matière:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
