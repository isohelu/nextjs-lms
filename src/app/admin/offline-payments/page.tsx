import { redirect } from 'next/navigation'

export default function LegacyAdminOfflinePaymentsPage() {
  redirect('/dashboard/billings/payment-reports/offline')
}
