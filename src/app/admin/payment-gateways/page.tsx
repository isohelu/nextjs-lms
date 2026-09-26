import { redirect } from 'next/navigation'

export default function LegacyAdminPaymentGatewaysPage() {
  redirect('/dashboard/billings/payment')
}
