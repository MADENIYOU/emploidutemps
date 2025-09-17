//@ts-nocheck
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// POST a new subject
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'PRINCIPAL') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { name, dayOff } = await req.json(); // Added dayOff
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Le nom de la matière est requis.' }, { status: 400 });
    }

    const newSubject = await prisma.subject.create({
      data: { 
        name: name.trim(),
        dayOff: dayOff || null, // Store dayOff, or null if not provided
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ error: 'Une matière avec ce nom existe déjà.' }, { status: 409 });
    }
    console.error("Erreur lors de la création de la matière:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}