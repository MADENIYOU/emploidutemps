//@ts-nocheck

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { level, subjectId, hoursPerWeek } = await req.json(); // Removed dayOff

    if (!level || !subjectId || hoursPerWeek == null) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        level,
        subjectId,
        hoursPerWeek: parseFloat(hoursPerWeek),
        // dayOff: dayOff || null, // Removed dayOff
      },
      include: { subject: true }, // Return with subject info
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette matière est déjà associée à ce niveau.' }, { status: 409 });
    }
    console.error("Erreur lors de la création du cours:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
