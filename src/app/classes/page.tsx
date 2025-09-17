//@ts-nocheck
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AddClassButton } from '@/components/dashboards/AddClassButton';
import { RemoveClassButton } from '@/components/dashboards/RemoveClassButton';

const prisma = new PrismaClient();

const levelDisplayNames = {
  SIXIEME: '6ème',
  CINQUIEME: '5ème',
  QUATRIEME: '4ème',
  TROISIEME: '3ème',
};

// Helper to group classes by level
const groupClassesByLevel = (classes: { level: keyof typeof levelDisplayNames; section: string }[]) => {
  const grouped: Record<keyof typeof levelDisplayNames, { section: string }[]> = {
    SIXIEME: [],
    CINQUIEME: [],
    QUATRIEME: [],
    TROISIEME: [],
  };

  classes.forEach(cls => {
    if (grouped[cls.level]) {
      grouped[cls.level].push(cls);
    }
  });

  // Sort sections alphabetically
  for (const level in grouped) {
    grouped[level as keyof typeof grouped].sort((a, b) => a.section.localeCompare(b.section));
  }
  return grouped;
};

export default async function ClassesPage() {
  const allClasses = await prisma.class.findMany({
    orderBy: [{ level: 'asc' }, { section: 'asc' }],
  });

  const classesByLevel = groupClassesByLevel(allClasses);
  const levels = Object.keys(levelDisplayNames) as (keyof typeof levelDisplayNames)[];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Gestion des Classes</h1>
      
      <div className="space-y-10">
        {levels.map(level => (
          <div key={level}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{levelDisplayNames[level]}</h2>
              <div className="flex gap-2">
                <AddClassButton level={level} existingSections={classesByLevel[level].map(c => c.section)} />
                <RemoveClassButton level={level} existingSections={classesByLevel[level].map(c => c.section)} />
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-card text-card-foreground">
              <p className="text-muted-foreground mb-4">
                {classesByLevel[level].length > 0 
                  ? `Classes existantes : ${classesByLevel[level].map(c => c.section).join(', ')}`
                  : 'Aucune classe pour ce niveau.'}
              </p>
              <Link href={`/classes/${level.toLowerCase()}`}>
                <Button variant="outline">
                  Gérer les matières et heures pour le niveau {levelDisplayNames[level]}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}