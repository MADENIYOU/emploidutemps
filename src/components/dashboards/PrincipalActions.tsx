//@ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, CheckCircle } from 'lucide-react'
import { MultiSelect } from '@/components/ui/multi-select';
import { Level } from '@prisma/client'; // Import Level enum

interface StagedTeacher {
  id: string;
  firstName: string;
  lastName: string;
  subjects: string[];
  email: string;
  managedLevels: string[]; // Added managedLevels
}

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

// Options for managed levels
const LEVEL_OPTIONS = Object.values(Level).map(level => ({
  label: level.charAt(0).toUpperCase() + level.slice(1).toLowerCase().replace('ieme', 'ème'), // Format "SIXIEME" to "Sixième"
  value: level,
}));

// Fonction pour normaliser une chaîne de caractères pour un email
const normalizeString = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD") // Sépare les accents des lettres
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]/g, ''); // Supprime les caractères non alphanumériques
};

export function PrincipalActions() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [managedLevels, setManagedLevels] = useState<string[]>([]) // New state for managed levels
  const [generatedEmail, setGeneratedEmail] = useState('')

  const [stagedTeachers, setStagedTeachers] = useState<StagedTeacher[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formMessage, setFormMessage] = useState('')
  const [finalMessage, setFinalMessage] = useState('')
  const router = useRouter()

  // Effet pour générer l'email dynamiquement
  useEffect(() => {
    if (!firstName || !lastName || subjects.length === 0) {
      setGeneratedEmail('');
      return;
    }

    const baseEmail = `${normalizeString(firstName)}.${normalizeString(lastName)}.${normalizeString(subjects[0])}`;
    let finalEmail = `${baseEmail}@gmail.com`;
    let counter = 2;

    // Gérer les doublons dans le tableau local
    while (stagedTeachers.some(t => t.email === finalEmail && t.id !== editingId)) {
      finalEmail = `${baseEmail}${counter}@gmail.com`;
      counter++;
    }
    
    setGeneratedEmail(finalEmail);

  }, [firstName, lastName, subjects, stagedTeachers, editingId]);

      const handleAddOrUpdateTeacher = (e: React.FormEvent) => {
        e.preventDefault();
        if (!generatedEmail || managedLevels.length === 0) { // managedLevels added to validation
          setFormMessage('Veuillez remplir tous les champs et sélectionner au moins un niveau géré.');
          return;
        }
  
        if (editingId) {
          setStagedTeachers(stagedTeachers.map(t => 
            t.id === editingId ? { id: t.id, firstName, lastName, subjects, email: generatedEmail, managedLevels } : t
          ));
          setFormMessage('Enseignant mis à jour.');
        } else {
          const newTeacher: StagedTeacher = { id: uuidv4(), firstName, lastName, subjects, email: generatedEmail, managedLevels }; // managedLevels added
          setStagedTeachers([...stagedTeachers, newTeacher]);
          setFormMessage('Enseignant ajouté au tableau.');
        }
  
        setFirstName('');
        setLastName('');
        setSubjects([]);
        setManagedLevels([]); // Reset managedLevels
        setEditingId(null);
        setTimeout(() => setFormMessage(''), 2000);
      }
  
      const handleSelectForEditing = (teacher: StagedTeacher) => {
        setEditingId(teacher.id);
        setFirstName(teacher.firstName);
        setLastName(teacher.lastName);
        setSubjects(teacher.subjects);
        setManagedLevels(teacher.managedLevels || []); // Populate managedLevels
        setFormMessage(`Modification de ${teacher.firstName} ${teacher.lastName}...`);
      }
  const handleFinalSubmit = async () => {
    setFinalMessage('Enregistrement en cours...');
    let successCount = 0;
    let errorCount = 0;

    for (const teacher of stagedTeachers) {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher),
      });

      if (response.ok) successCount++;
      else errorCount++;
    }

    setFinalMessage(`${successCount} enseignant(s) créé(s). ${errorCount} erreur(s). Mise à jour de la liste...`);
    setStagedTeachers([]);
    
    router.refresh(); // Met à jour les données du serveur

    setTimeout(() => setFinalMessage(''), 3000);
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{editingId ? 'Modifier un enseignant' : 'Ajouter un enseignant'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddOrUpdateTeacher} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" />
            </div>
                          <div className="space-y-1.5">
                            <Label>Matières</Label>
                            <MultiSelect
                              options={SUBJECT_OPTIONS}
                              selected={subjects}
                              onChange={setSubjects}
                              placeholder="Sélectionner ou créer..."
                              className="w-full"
                            />
                          </div>
                          {/* New MultiSelect for Managed Levels */}
                          <div className="space-y-1.5">
                            <Label>Niveaux gérés</Label>
                            <MultiSelect
                              options={LEVEL_OPTIONS}
                              selected={managedLevels}
                              onChange={setManagedLevels}
                              placeholder="Sélectionner les niveaux..."
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1.5">
                              <Label>Email généré</Label>
                              <p className="text-sm text-gray-700 font-mono p-2 border rounded-md bg-gray-50">{generatedEmail || "..."}</p>
                          </div>            <Button type="submit" className="bg-[#4CAF50] hover:bg-[#4CAF50]/90 flex items-center gap-2">
              {editingId ? <><Edit className="w-4 h-4" /> Mettre à jour</> : <><Plus className="w-4 h-4" /> Ajouter au tableau</>}
            </Button>
            {formMessage && <p className="mt-2 text-sm text-gray-600">{formMessage}</p>}
          </form>
        </CardContent>
      </Card>

      {stagedTeachers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enseignants saisis</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stagedTeachers.map((teacher) => (
                                  <li key={teacher.id} onClick={() => handleSelectForEditing(teacher)} className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                                    <p className="font-semibold">{teacher.firstName} {teacher.lastName} <span className="font-normal text-gray-600">({teacher.subjects.join(', ')})</span></p>
                                    <p className="text-sm text-gray-500">{teacher.email}</p>
                                    <p className="text-sm text-gray-500">Niveaux: {teacher.managedLevels.join(', ')}</p> {/* Display managed levels */}
                                  </li>              ))}
            </ul>
            <Button onClick={handleFinalSubmit} className="mt-4 w-full bg-[#4CAF50] hover:bg-[#4CAF50]/90 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Terminé - Créer {stagedTeachers.length} compte(s)
            </Button>
            {finalMessage && <p className="mt-2 text-sm text-center text-gray-600">{finalMessage}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
