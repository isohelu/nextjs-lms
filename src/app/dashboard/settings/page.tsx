import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'

export default async function DashboardSettingsRedirect() {
  const session = await getCurrentUser()
  if (session?.role === 'instructor') {
    redirect('/dashboard/settings/account')
  }
  redirect('/dashboard/settings/system')
}
