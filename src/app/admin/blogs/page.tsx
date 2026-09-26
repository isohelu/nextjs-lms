import { redirect } from 'next/navigation'

export default function LegacyAdminBlogsPage() {
  redirect('/dashboard/blogs')
}
