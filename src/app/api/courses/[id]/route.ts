//@ts-nocheck

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// PUT to update hours
export async function PUT(
  req: Request, 
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { id } = context.params;
    const { hoursPerWeek } = await req.json(); // Removed dayOff

    if (hoursPerWeek == null) {
      return NextResponse.json({ error: 'Le nombre d\'heures est requis' }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        hoursPerWeek: parseFloat(hoursPerWeek),
        // dayOff: dayOff || null, // Removed dayOff
      },
      include: { subject: true },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cours:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// DELETE a course
export async function DELETE(
  req: Request, 
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { id } = context.params;
    await prisma.course.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Cours supprimé' }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression du cours:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
