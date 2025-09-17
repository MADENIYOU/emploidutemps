
import { PrismaClient, Level } from '@prisma/client'; // Import Level
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('password123', 12);

  // Create or update principal user
  const user = await prisma.user.upsert({
    where: { email: 'principal@test.com' },
    update: { password: password, role: 'PRINCIPAL', managedLevels: JSON.stringify([]) },
    create: {
      email: 'principal@test.com',
      password: password,
      role: 'PRINCIPAL',
      managedLevels: JSON.stringify([]),
    },
  });
  console.log({ user });

  // Create or update default subjects
  const subjectsToCreate = [
    'Mathématiques',
    'Français',
    'Histoire-Géographie',
    'SVT',
    'Physique-Chimie',
    'Anglais',
    'EPS',
    'Technologie',
    'Arts Plastiques',
  ];

  for (const subjectName of subjectsToCreate) {
    const subject = await prisma.subject.upsert({
      where: { name: subjectName },
      update: {},
      create: { name: subjectName },
    });
    console.log(`Subject created/updated: ${subject.name}`);
  }

  // Create a default teacher
  const teacherEmail = 'teacher@test.com';
  const teacher = await prisma.user.upsert({
    where: { email: teacherEmail },
    update: {
      password: password,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'TEACHER',
      // Assign some default subjects and managed levels
      subjects: {
        set: [
          { name: 'Mathématiques' },
          { name: 'Physique-Chimie' },
        ].map(s => ({ name: s.name })),
      },
      managedLevels: JSON.stringify([Level.SIXIEME, Level.CINQUIEME]), // Example levels
    },
    create: {
      email: teacherEmail,
      password: password,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'TEACHER',
      subjects: {
        connectOrCreate: [
          { where: { name: 'Mathématiques' }, create: { name: 'Mathématiques' } },
          { where: { name: 'Physique-Chimie' }, create: { name: 'Physique-Chimie' } },
        ],
      },
      managedLevels: JSON.stringify([Level.SIXIEME, Level.CINQUIEME]),
    },
  });
  console.log({ teacher });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
