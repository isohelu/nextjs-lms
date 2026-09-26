import { redirect } from 'next/navigation'

export default function LegacyInstructorAssignmentsPage() {
  redirect('/dashboard/courses')
}
