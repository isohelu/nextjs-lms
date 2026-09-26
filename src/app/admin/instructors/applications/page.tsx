import { redirect } from 'next/navigation'

export default function LegacyAdminInstructorApplicationsPage() {
  redirect('/dashboard/instructors/applications')
}
