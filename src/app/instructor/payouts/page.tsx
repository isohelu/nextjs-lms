import { redirect } from 'next/navigation'

export default function LegacyInstructorPayoutsPage() {
  redirect('/dashboard/billings/payouts')
}
