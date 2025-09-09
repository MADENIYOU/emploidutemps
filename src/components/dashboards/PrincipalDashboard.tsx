'use client'

import { useState } from 'react'
import { User } from '@prisma/client'
import * as XLSX from 'xlsx'
import { PrincipalActions } from './PrincipalActions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { UserPlus, Users, Pencil, Download } from 'lucide-react'
import { EditTeacherModal } from './EditTeacherModal'

type Teacher = User

interface PrincipalDashboardProps {
  initialTeachers: Teacher[];
}

export function PrincipalDashboard({ initialTeachers }: PrincipalDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  const handleEditClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsModalOpen(true)
  }

  const handleExport = () => {
    const dataToExport = initialTeachers.map(teacher => ({
      'Prénom': teacher.firstName,
      'Nom': teacher.lastName,
      'Matières': teacher.subjects.join(', '),
      'Email': teacher.email,
      'Mot de passe': 'passer123' // Default password as discussed
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enseignants");
    XLSX.writeFile(workbook, "enseignants.xlsx");
  };

  return (
    <>
      <div className="p-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><UserPlus className="w-6 h-6" /> Ajouter des Enseignants</h2>
          <PrincipalActions />
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Liste des Enseignants Enregistrés</h2>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter en Excel
            </Button>
          </div>
          <div className="border rounded-lg shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Matières</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialTeachers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Aucun enseignant trouvé.</TableCell>
                  </TableRow>
                )}
                {initialTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.firstName}</TableCell>
                    <TableCell>{teacher.lastName}</TableCell>
                    <TableCell>{teacher.subjects.join(', ')}</TableCell>
                    <TableCell>{new Date(teacher.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(teacher)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <EditTeacherModal 
        teacher={selectedTeacher}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}