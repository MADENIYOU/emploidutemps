//@ts-nocheck
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Level, Subject, Course } from '@prisma/client';

enum DayOfWeek {
  LUNDI = "LUNDI",
  MARDI = "MARDI",
  MERCREDI = "MERCREDI",
  JEUDI = "JEUDI",
  VENDREDI = "VENDREDI",
  SAMEDI = "SAMEDI",
}
const ALL_DAYS_OF_WEEK = Object.values(DayOfWeek);

type SubjectWithCourses = Subject & {
  courses: {
    id: string;
    level: Level;
    hoursPerWeek: number;
  }[];
};

interface SubjectOverviewClientProps {
  initialSubjectsWithCourses: SubjectWithCourses[];
  levelDisplayNames: Record<Level, string>;
}

const ALL_LEVELS = Object.values(Level);

export function SubjectOverviewClient({ initialSubjectsWithCourses, levelDisplayNames }: SubjectOverviewClientProps) {
  const router = useRouter();
  const [subjects, setSubjects] = React.useState(initialSubjectsWithCourses);
  const [editingHours, setEditingHours] = React.useState<Record<string, Record<Level, string>>>({});

  const getCourseId = (subject: SubjectWithCourses, level: Level): string | undefined => {
    return subject.courses.find(c => c.level === level)?.id;
  };

  const getHoursForLevel = (subject: SubjectWithCourses, level: Level): number | undefined => {
    return subject.courses.find(c => c.level === level)?.hoursPerWeek;
  };

  const handleUpdateHours = async (subjectId: string, level: Level) => {
    const newHoursStr = editingHours[subjectId]?.[level];
    if (newHoursStr === undefined || newHoursStr === '') {
      // If input is empty, it means we want to delete the course for this level
      const courseIdToDelete = getCourseId(subjects.find(s => s.id === subjectId)!, level);
      if (courseIdToDelete) {
        try {
          const response = await fetch(`/api/courses/${courseIdToDelete}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error((await response.json()).error || 'Erreur lors de la suppression du cours.');
          
          setSubjects(prevSubjects => prevSubjects.map(s => 
            s.id === subjectId ? { ...s, courses: s.courses.filter(c => c.id !== courseIdToDelete) } : s
          ));
          toast.success('Cours supprimé avec succès.');
        } catch (error: any) {
          toast.error('Erreur', { description: error.message });
        }
      }
      setEditingHours(prev => {
        const newEdit = { ...prev };
        if (newEdit[subjectId]) delete newEdit[subjectId][level];
        return newEdit;
      });
      return;
    }

    const newHours = parseFloat(newHoursStr);
    if (isNaN(newHours) || newHours < 0) {
      toast.error('Veuillez entrer un nombre valide d\'heures.');
      return;
    }

    const existingCourseId = getCourseId(subjects.find(s => s.id === subjectId)!, level);
    const subjectName = subjects.find(s => s.id === subjectId)?.name;

    try {
      let updatedCourse;
      if (existingCourseId) {
        // Update existing course
        const response = await fetch(`/api/courses/${existingCourseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hoursPerWeek: newHours }),
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Erreur lors de la mise à jour du cours.');
        updatedCourse = await response.json();
      } else {
        // Create new course
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, subjectId, hoursPerWeek: newHours }),
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Erreur lors de la création du cours.');
        updatedCourse = await response.json();
      }

      setSubjects(prevSubjects => prevSubjects.map(s => {
        if (s.id === subjectId) {
          const updatedCourses = existingCourseId
            ? s.courses.map(c => c.id === updatedCourse.id ? updatedCourse : c)
            : [...s.courses, updatedCourse];
          return { ...s, courses: updatedCourses };
        }
        return s;
      }));
      setEditingHours(prev => {
        const newEdit = { ...prev };
        if (newEdit[subjectId]) delete newEdit[subjectId][level];
        return newEdit;
      });
      toast.success(`Quota d\'heures pour ${subjectName} (${levelDisplayNames[level]}) mis à jour.`);
    } catch (error: any) {
      toast.error('Erreur', { description: error.message });
    }
  };

  const handleUpdateDayOff = async (subjectId: string, newDayOff: DayOfWeek | null) => {
    const subjectName = subjects.find(s => s.id === subjectId)?.name;
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOff: newDayOff }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erreur lors de la mise à jour du jour off.');
      
      const updatedSubject = await response.json();

      setSubjects(prevSubjects => prevSubjects.map(s => 
        s.id === subjectId ? { ...s, ...updatedSubject } : s
      ));
      toast.success(`Jour off pour ${subjectName} mis à jour.`);
    } catch (error: any) {
      toast.error('Erreur', { description: error.message });
    }
  };

  return (
    <div className="border rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Matière</TableHead>
            <TableHead className="w-[120px]">Jour off</TableHead>
            {ALL_LEVELS.map(level => (
              <TableHead key={level} className="text-center w-[150px]">{levelDisplayNames[level]}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead> {/* Placeholder for future actions */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length > 0 ? (
            subjects.map(subject => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>
                  <Select
                    value={subject.dayOff || 'NONE'}
                    onValueChange={(value) => {
                      handleUpdateDayOff(subject.id, value === 'NONE' ? null : value as DayOfWeek);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Aucun</SelectItem>
                      {ALL_DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                {ALL_LEVELS.map(level => {
                  const currentHours = getHoursForLevel(subject, level);
                  const isEditing = editingHours[subject.id]?.[level] !== undefined;
                  const displayValue = isEditing ? editingHours[subject.id][level] : (currentHours ?? '');

                  return (
                    <TableCell key={level} className="text-center">
                      <Input
                        type="number"
                        value={displayValue}
                        onChange={(e) => setEditingHours(prev => ({
                          ...prev,
                          [subject.id]: {
                            ...(prev[subject.id] || {}),
                            [level]: e.target.value,
                          },
                        }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateHours(subject.id, level);
                          }
                        }}
                        className="text-center"
                        placeholder="-"
                      />
                    </TableCell>
                  );
                })}
                <TableCell className="text-right">
                  {/* Save button for the row if any field is being edited */}
                  {Object.keys(editingHours[subject.id] || {}).length > 0 && (
                    <Button size="sm" onClick={() => {
                      // Trigger save for all edited fields in this row
                      for (const levelKey of Object.keys(editingHours[subject.id])) {
                        handleUpdateHours(subject.id, levelKey as Level);
                      }
                    }}>
                      Enregistrer la ligne
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={ALL_LEVELS.length + 3} className="text-center h-24 text-muted-foreground">
                Aucune matière trouvée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}