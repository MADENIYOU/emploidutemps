//@ts-nocheck
'use client';

import { useState } from 'react';
import { Class, Level } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ClassManagementClientProps {
  initialClasses: Class[];
}

const levelDisplayNames: Record<Level, string> = {
  SIXIEME: '6ème',
  CINQUIEME: '5ème',
  QUATRIEME: '4ème',
  TROISIEME: '3ème',
};

export function ClassManagementClient({ initialClasses }: ClassManagementClientProps) {
  const [classes, setClasses] = useState<Class[]>(initialClasses);

  const handleAddClass = async (level: Level) => {
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'ajout de la classe.");
      }

      const addedClass = await response.json();
      setClasses((prev) => [...prev, addedClass].sort((a, b) => a.level.localeCompare(b.level) || a.section.localeCompare(b.section)));
      toast.success('Succès', {
        description: `Classe "${addedClass.level} ${addedClass.section}" ajoutée.`,
      });
    } catch (error: any) {
      toast.error('Erreur', { description: error.message });
    }
  };

  const handleRemoveClass = async (level: Level) => {
    // Confirmation dialog
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la dernière classe du niveau ${levelDisplayNames[level]} ?`)) {
      return;
    }

    try {
      const response = await fetch('/api/classes/latest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression de la classe.");
      }

      const deletedClass = await response.json();
      setClasses((prev) => prev.filter((cls) => cls.id !== deletedClass.id));
      toast.success('Succès', {
        description: `Classe "${deletedClass.level} ${deletedClass.section}" supprimée.`,
      });
    } catch (error: any) {
      toast.error('Erreur', { description: error.message });
    }
  };

  const classesByLevel = [...classes].sort((a,b) => a.section.localeCompare(b.section)).reduce((acc, cls) => {
    if (!acc[cls.level]) {
      acc[cls.level] = [];
    }
    acc[cls.level].push(cls);
    return acc;
  }, {} as Record<Level, Class[]>);

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold text-center mb-10">Gestion des Classes par Niveau</h2>
      <div className="space-y-8">
        {Object.values(Level).map(level => (
          <div key={level} className="p-6 border rounded-lg shadow-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">{levelDisplayNames[level]}</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAddClass(level)}>Ajouter une classe</Button>
                <Button size="sm" variant="destructive" onClick={() => handleRemoveClass(level)}>Supprimer une classe</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {(classesByLevel[level] || []).map(cls => (
                <div key={cls.id} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                  {cls.section}
                </div>
              ))}
              {(!classesByLevel[level] || classesByLevel[level].length === 0) && (
                <p className="text-sm text-gray-500 italic">Aucune classe pour ce niveau.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
