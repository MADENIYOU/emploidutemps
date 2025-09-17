//@ts-nocheck
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Level } from '@prisma/client';

interface AddClassButtonProps {
  level: Level;
  existingSections: string[];
}

const levelDisplayNames = {
  SIXIEME: '6ème',
  CINQUIEME: '5ème',
  QUATRIEME: '4ème',
  TROISIEME: '3ème',
};

export function AddClassButton({ level }: AddClassButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddClass = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la classe.');
      }

      const newClass = await response.json();
      toast.success('Classe créée', {
        description: `La classe ${levelDisplayNames[newClass.level]} ${newClass.section} a été créée.`,
      });
      router.refresh();
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleAddClass} disabled={isLoading}>
      {isLoading ? 'Création...' : `Ajouter une classe de ${levelDisplayNames[level]}`}
    </Button>
  );
}
