//@ts-nocheck

export function TeacherDashboard({ user }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Tableau de Bord Enseignant</h1>
      <p>Bienvenue, {user.email}.</p>
      {/* La section pour gérer les indisponibilités viendra ici */}
    </div>
  )
}
