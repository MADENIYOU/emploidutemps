//@ts-nocheck
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Level, Subject, Course } from '@prisma/client';

type CourseWithSubject = Course & { subject: Subject };

interface CourseManagementClientProps {
  initialCourses: CourseWithSubject[];
  availableSubjects: Subject[]; // This prop is no longer used but let's keep it for now
  level: Level;
}

const ALL_LEVELS = Object.values(Level);
const levelDisplayNames: Record<Level, string> = {
  SIXIEME: '6ème',
  CINQUIEME: '5ème',
  QUATRIEME: '4ème',
  TROISIEME: '3ème',
};

export function CourseManagementClient({ initialCourses, availableSubjects, level }: CourseManagementClientProps) {
  const router = useRouter();
  const [courses, setCourses] = React.useState(initialCourses);
  const [subjects, setAvailableSubjects] = React.useState(availableSubjects);
  
  const [newSubjectId, setNewSubjectId] = React.useState('');
  const [newSubjectNameInput, setNewSubjectNameInput] = React.useState(''); // For new subject input
  const [newHours, setNewHours] = React.useState('');
  const [editingHours, setEditingHours] = React.useState<Record<string, string>>({});

  // State for the "Apply to other levels" modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [courseForModal, setCourseForModal] = React.useState<{ subjectId: string; subjectName: string; hoursPerWeek: number } | null>(null);
  const [selectedLevels, setSelectedLevels] = React.useState<Level[]>([]);

  // State for adding new subject mode
  const [isAddingNewSubject, setIsAddingNewSubject] = React.useState(false);

  const openApplyModal = (subjectId: string, subjectName: string, hoursPerWeek: number) => {
    setCourseForModal({ subjectId, subjectName, hoursPerWeek });
    setSelectedLevels([]);
    setIsModalOpen(true);
  };

  const handleAddCourse = async () => {
    let currentSubjectId = newSubjectId;
    let currentSubjectName = '';

    if (isAddingNewSubject) {
      if (!newSubjectNameInput.trim() || !newHours) {
        toast.error('Veuillez entrer un nom de matière et un nombre d\'heures.');
        return;
      }
      try {
        const response = await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newSubjectNameInput.trim() }),
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Erreur lors de la création de la matière.');
        const newSubject = await response.json();
        currentSubjectId = newSubject.id;
        currentSubjectName = newSubject.name;
        setAvailableSubjects(prev => [...prev, newSubject].sort((a,b) => a.name.localeCompare(b.name)));
        setIsAddingNewSubject(false); // Exit add new subject mode
      } catch (error: any) {
        toast.error('Erreur', { description: error.message });
        return;
      }
    } else {
      // Existing subject selection
      if (!newSubjectId || !newHours) {
        toast.error('Veuillez sélectionner une matière et définir un nombre d\'heures.');
        return;
      }
      const selectedSubject = subjects.find(s => s.id === newSubjectId);
      if (selectedSubject) {
        currentSubjectName = selectedSubject.name;
      }
    }

    try {
      const hours = parseFloat(newHours);
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, subjectId: currentSubjectId, hoursPerWeek: hours }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erreur lors de l\'ajout.');
      
      const newCourse = await response.json();
      setCourses(prev => [...prev, newCourse].sort((a, b) => a.subject.name.localeCompare(b.subject.name)));
      setAvailableSubjects(prev => prev.filter(s => s.id !== newCourse.subject.id)); // Filter out the newly added subject
      setNewSubjectId('');
      setNewSubjectNameInput('');
      setNewHours('');
      toast.success('Matière ajoutée avec succès.');
      openApplyModal(newCourse.subject.id, newCourse.subject.name, newCourse.hoursPerWeek);
    } catch (error: any) {
      toast.error('Erreur', { description: error.message });
    }
  };

  const handleUpdateHours = async (courseId: string) => {
    const hoursStr = editingHours[courseId];
    if (hoursStr === undefined || hoursStr === '') {
      toast.error("Le nombre d'heures ne peut pas être vide.");
      return;
    }
    try {
      const hours = parseFloat(hoursStr);
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursPerWeek: hours }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erreur de mise à jour.');

      const updatedCourse = await response.json();
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, hoursPerWeek: updatedCourse.hoursPerWeek } : c));
      setEditingHours(prev => { const n = { ...prev }; delete n[courseId]; return n; });
      toast.success('Quota d\'heures mis à jour.');
      openApplyModal(updatedCourse.subject.id, updatedCourse.subject.name, updatedCourse.hoursPerWeek);
    } catch (error: any) {
      toast.error('Erreur', { description: error.message });
    }
  };

  const handleDeleteCourse = async (course: CourseWithSubject) => {
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erreur lors de la suppression.');

      setCourses(prev => prev.filter(c => c.id !== course.id));
      toast.success('Matière supprimée avec succès.');
    } catch (error: any) {
      toast.error('Erreur', { description: error.message });
    }
  };

  const handleApplyToLevels = async () => {
    if (!courseForModal || selectedLevels.length === 0) {
      toast.error("Veuillez sélectionner au moins un niveau.");
      return;
    }
    try {
      const { subjectId, hoursPerWeek } = courseForModal;
      const response = await fetch('/api/courses/apply-to-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, hoursPerWeek, targetLevels: selectedLevels }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erreur lors de l\'application.');
      
      toast.success("Configuration appliquée aux autres niveaux.");
      setIsModalOpen(false);
      router.refresh(); 
    } catch (error: any) {
      toast.error('Erreur', { description: error.message });
    }
  };

  const otherLevels = ALL_LEVELS.filter(l => l !== level);

  return (
    <>
      <div className="space-y-8">
        {/* Add Course Form */}
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg font-semibold mb-4">Ajouter une matière au programme</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {isAddingNewSubject ? (
              <>
                <Input 
                  type="text"
                  placeholder="Nom de la nouvelle matière"
                  value={newSubjectNameInput}
                  onChange={e => setNewSubjectNameInput(e.target.value)}
                  className="sm:w-[250px]"
                />
                <Button variant="outline" onClick={() => setIsAddingNewSubject(false)}>Retour</Button>
              </>
            ) : (
              <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                <SelectTrigger className="sm:w-[250px]"><SelectValue placeholder="Choisir une matière..." /></SelectTrigger>
                <SelectContent>
                  {subjects.length > 0 ? (
                    subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">Aucune matière disponible.</div>
                  )}
                  <div className="p-2 border-t mt-2">
                    <Button variant="ghost" className="w-full" onClick={() => setIsAddingNewSubject(true)}>
                      Ajouter une nouvelle matière
                    </Button>
                  </div>
                </SelectContent>
              </Select>
            )}
            <Input 
              type="number" 
              placeholder="Heures/semaine" 
              value={newHours}
              onChange={e => setNewHours(e.target.value)}
              className="sm:w-48"
            />
            <Button onClick={handleAddCourse} className="w-full sm:w-auto">Ajouter</Button>
          </div>
        </div>

        {/* Courses Table */}
        <div className="border rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matière</TableHead>
                <TableHead className="w-48">Heures / Semaine</TableHead>
                <TableHead className="text-right w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length > 0 ? (
                courses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.subject.name}</TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        value={editingHours[course.id] ?? course.hoursPerWeek}
                        onChange={e => setEditingHours({...editingHours, [course.id]: e.target.value})}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateHours(course.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => handleUpdateHours(course.id)} disabled={editingHours[course.id] === undefined}>
                        Enregistrer
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => handleDeleteCourse(course)}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                    Aucune matière définie pour ce niveau.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Apply to other levels Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appliquer également sur...</DialogTitle>
            <DialogDescription>
              Appliquer la configuration de <strong>{courseForModal?.subjectName}</strong> ({courseForModal?.hoursPerWeek}h/semaine) à d'autres niveaux ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {otherLevels.map(l => (
              <div key={l} className="flex items-center space-x-2">
                <Checkbox 
                  id={`level-${l}`}
                  onCheckedChange={(checked) => {
                    setSelectedLevels(prev => 
                      checked ? [...prev, l] : prev.filter(sl => sl !== l)
                    );
                  }}
                />
                <Label htmlFor={`level-${l}`} className="font-medium">
                  {levelDisplayNames[l]}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleApplyToLevels}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}