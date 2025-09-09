'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@prisma/client'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from '@/components/ui/multi-select'

// Re-using the same options from PrincipalActions
const SUBJECT_OPTIONS = [
    { label: "Mathématiques", value: "mathématiques" },
    { label: "Physique-Chimie", value: "physique-chimie" },
    { label: "SVT", value: "svt" },
    { label: "Français", value: "français" },
    { label: "Anglais", value: "anglais" },
    { label: "Histoire-Géographie", value: "histoire-géographie" },
    { label: "EPS", value: "eps" },
    { label: "Technologie", value: "technologie" },
    { label: "Arts Plastiques", value: "arts-plastiques" },
];

interface EditTeacherModalProps {
  teacher: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTeacherModal({ teacher, isOpen, onClose }: EditTeacherModalProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFirstName(teacher.firstName || '');
      setLastName(teacher.lastName || '');
      setSubjects(teacher.subjects || []);
    }
  }, [teacher]);

  const handleSave = async () => {
    if (!teacher) return;
    setIsSaving(true);
    setError('');

    const response = await fetch(`/api/users/${teacher.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, subjects }),
    });

    setIsSaving(false);

    if (response.ok) {
      onClose();
      router.refresh(); // Refresh server components to show updated data
    } else {
      const data = await response.json();
      setError(data.error || 'Une erreur est survenue.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'enseignant</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de {teacher?.firstName} {teacher?.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Prénom
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Nom
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Matières
            </Label>
            <div className="col-span-3">
                <MultiSelect
                    options={SUBJECT_OPTIONS}
                    selected={subjects}
                    onChange={setSubjects}
                    placeholder="Sélectionner ou créer..."
                />
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Annuler</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}