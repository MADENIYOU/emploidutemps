//@ts-nocheck

import { PrismaClient, Level } from '@prisma/client';
import { CourseManagementClient } from '@/components/dashboards/CourseManagementClient';

const prisma = new PrismaClient();

const levelDisplayNames: Record<Level, string> = {
  SIXIEME: '6ème',
  CINQUIEME: '5ème',
  QUATRIEME: '4ème',
  TROISIEME: '3ème',
};

export default async function LevelDetailPage({ params }: { params: { level: string } }) {
  const level = params.level.toUpperCase() as Level;

  if (!Object.values(Level).includes(level)) {
    return <div className="container mx-auto py-10">Niveau non valide.</div>;
  }

  const courses = await prisma.course.findMany({
    where: { level },
    include: { subject: true },
    orderBy: { subject: { name: 'asc' } },
  });

  const allSubjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' },
  });

  // Filter out subjects that are already in a course for this level
  const availableSubjects = allSubjects.filter(subject => 
    !courses.some(course => course.subjectId === subject.id)
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
        Gestion des Matières pour le Niveau {levelDisplayNames[level]}
      </h1>
      <CourseManagementClient 
        initialCourses={courses} 
        availableSubjects={availableSubjects}
        level={level} 
      />
    </div>
  );
}
