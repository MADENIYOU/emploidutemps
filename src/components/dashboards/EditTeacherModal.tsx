//@ts-nocheck
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Level } from '@prisma/client' // Import Level enum
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
    { label: "Mathématiques", value: "Mathématiques" },
    { label: "Physique-Chimie", value: "Physique-Chimie" },
    { label: "SVT", value: "SVT" },
    { label: "Français", value: "Français" },
    { label: "Anglais", value: "Anglais" },
    { label: "Histoire-Géographie", value: "Histoire-Géographie" },
    { label: "EPS", value: "EPS" },
    { label: "Technologie", value: "Technologie" },
    { label: "Arts Plastiques", value: "Arts Plastiques" },
];

// Options for managed levels
const LEVEL_OPTIONS = Object.values(Level).map(level => ({
  label: level.charAt(0).toUpperCase() + level.slice(1).toLowerCase().replace('ieme', 'ème'), // Format "SIXIEME" to "Sixième"
  value: level,
}));

type TeacherWithSubjects = User & { subjects: Subject[] }; // Existing type
type TeacherWithManagedLevels = TeacherWithSubjects & { managedLevels: string[] }; // New type

interface EditTeacherModalProps {
  teacher: TeacherWithManagedLevels | null; // Use new type
  isOpen: boolean;
  onClose: () => void;
}

export function EditTeacherModal({ teacher, isOpen, onClose }: EditTeacherModalProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [managedLevels, setManagedLevels] = useState<string[]>([]); // New state
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFirstName(teacher.firstName || '');
      setLastName(teacher.lastName || '');
      setSubjects(teacher.subjects.map(s => s.name) || []);
      // Parse managedLevels from JSON string to array
      setManagedLevels(teacher.managedLevels ? JSON.parse(teacher.managedLevels as string) : []); // Parse JSON
    }
  }, [teacher]);

  const handleSave = async () => {
    if (!teacher) return;
    setIsSaving(true);
    setError('');

    const response = await fetch(`/api/users/${teacher.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, subjects, managedLevels }), // Send managedLevels
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
          {/* New MultiSelect for Managed Levels */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Niveaux gérés
            </Label>
            <div className="col-span-3">
                <MultiSelect
                    options={LEVEL_OPTIONS}
                    selected={managedLevels}
                    onChange={setManagedLevels}
                    placeholder="Sélectionner les niveaux..."
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