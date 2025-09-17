//@ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Subject } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SubjectManagementClientProps {
  initialSubjects: (Subject & { dayOff?: string | null })[];
}

export function SubjectManagementClient({ initialSubjects }: SubjectManagementClientProps) {
  const router = useRouter();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAddSubjectLoading, setIsAddSubjectLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectDayOff, setEditSubjectDayOff] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setIsAddSubjectLoading(true);
    const response = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSubjectName }),
    });
    setIsAddSubjectLoading(false);

    if (response.ok) {
      const addedSubject = await response.json();
      setSubjects((prev) => [...prev, addedSubject].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSubjectName('');
    } else {
      // Handle error (e.g., duplicate name)
      const errorData = await response.json();
      alert(errorData.error || 'Erreur lors de l\'ajout de la matière.');
    }
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setEditSubjectName(subject.name);
    setEditSubjectDayOff(subject.dayOff || null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editSubjectName.trim()) return;

    setIsSavingEdit(true);
    const response = await fetch(`/api/subjects/${editingSubject.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editSubjectName, dayOff: editSubjectDayOff }),
    });
    setIsSavingEdit(false);

    if (response.ok) {
      const updatedSubject = await response.json();
      setSubjects((prev) =>
        prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setIsEditModalOpen(false);
      setEditingSubject(null);
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Erreur lors de la mise à jour de la matière.');
    }
  };

  const handleDeleteClick = async (subjectId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;

    const response = await fetch(`/api/subjects/${subjectId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Erreur lors de la suppression de la matière.');
    }
  };

  return (
    <div className="p-8 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">Ajouter une Matière</h2>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Nouvelle Matière</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newSubjectName">Nom de la matière</Label>
                <Input
                  id="newSubjectName"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Ex: Mathématiques"
                />
              </div>
              <Button type="submit" disabled={isAddSubjectLoading}>
                {isAddSubjectLoading ? 'Ajout en cours...' : 'Ajouter la matière'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">Liste des Matières</h2>
        <div className="border rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Jour off</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Aucune matière trouvée.</TableCell>
                </TableRow>
              )}
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.dayOff || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(subject)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(subject.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Subject Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la matière</DialogTitle>
            <DialogDescription>
              Mettez à jour le nom et/ou le jour off de la matière.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSubjectName" className="text-right">
                Nom
              </Label>
              <Input
                id="editSubjectName"
                value={editSubjectName}
                onChange={(e) => setEditSubjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editSubjectDayOff" className="text-right">Jour off</Label>
                <Select
                    value={editSubjectDayOff || ''}
                    onValueChange={(value) => setEditSubjectDayOff(value === '' ? null : value)}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un jour" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Aucun</SelectItem>
                        <SelectItem value="LUNDI">Lundi</SelectItem>
                        <SelectItem value="MARDI">Mardi</SelectItem>
                        <SelectItem value="MERCREDI">Mercredi</SelectItem>
                        <SelectItem value="JEUDI">Jeudi</SelectItem>
                        <SelectItem value="VENDREDI">Vendredi</SelectItem>
                        <SelectItem value="SAMEDI">Samedi</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSavingEdit}>Annuler</Button>
              <Button type="submit" disabled={isSavingEdit}>
                {isSavingEdit ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
