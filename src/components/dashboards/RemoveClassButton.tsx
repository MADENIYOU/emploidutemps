//@ts-nocheck
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Level } from '@prisma/client';

interface RemoveClassButtonProps {
  level: Level;
  existingSections: string[];
}

const levelDisplayNames = {
  SIXIEME: '6ème',
  CINQUIEME: '5ème',
  QUATRIEME: '4ème',
  TROISIEME: '3ème',
};

export function RemoveClassButton({ level, existingSections }: RemoveClassButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleRemoveClass = async () => {
    if (existingSections.length === 0) {
      toast.info('Aucune classe à supprimer', {
        description: `Il n'y a aucune classe à supprimer pour le niveau ${levelDisplayNames[level]}.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/classes/latest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la classe.');
      }

      const deletedClass = await response.json();
      toast.success('Classe supprimée', {
        description: `La classe ${levelDisplayNames[deletedClass.level]} ${deletedClass.section} a été supprimée.`,
      });
      router.refresh();
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Supprimer une classe</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Êtes-vous sûr de vouloir supprimer la dernière classe ?</DialogTitle>
          <DialogDescription>
            Cette action supprimera la dernière classe du niveau {levelDisplayNames[level]}. Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleRemoveClass} disabled={isLoading} variant="destructive">
            {isLoading ? 'Suppression...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
