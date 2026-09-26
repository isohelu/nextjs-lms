import { redirect } from 'next/navigation'

export default function LegacyAdminPayoutsPage() {
  redirect('/dashboard/billings/payouts/request')
}
