//@ts-nocheck

import { SubjectOverviewClient } from '@/components/dashboards/SubjectOverviewClient';
import { GET as getSubjectsOverview } from '@/app/api/subjects/overview/route'; // Import the GET function

// Helper to map Level enum to display names
const levelDisplayNames: Record<Level, string> = {
  SIXIEME: '6ème',
  CINQUIEME: '5ème',
  QUATRIEME: '4ème',
  TROISIEME: '3ème',
};

export default async function SubjectsOverviewPage() {
  // Call the API route directly as a function
  const response = await getSubjectsOverview();
  const subjectsWithCourses = await response.json(); // Extract JSON from NextResponse

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
        Aperçu Général des Matières et Quotas par Niveau
      </h1>
      <SubjectOverviewClient 
        initialSubjectsWithCourses={subjectsWithCourses} 
        levelDisplayNames={levelDisplayNames}
      />
    </div>
  );
}
