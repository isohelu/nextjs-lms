'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  GraduationCap,
  LayoutDashboard,
  Heart,
  Award,
  Settings as SettingsIcon,
  UserCircle,
  PlayCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ShoppingBag,
  Loader2,
  Key,
  CheckCircle,
  FileText,
  LogOut
} from 'lucide-react'

export type StudentTab = 'courses' | 'exams' | 'products' | 'wishlist' | 'certificates' | 'profile' | 'settings' | 'instructor'

export default function StudentPortalPage({ initialTab = 'courses' }: { initialTab?: StudentTab }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<StudentTab>(initialTab)

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const switchTab = (tab: StudentTab) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/student/${tab}`)
    }
  }

  const [userProfile, setUserProfile] = useState<{
    id: number
    name: string
    email: string
    avatar: string
    headline: string
    bio: string
    role: string
  }>({
    id: 12,
    name: 'Alex Johnson',
    email: 'student@mentor.test',
    avatar: '/assets/images/students-1.jpg',
    headline: 'Full-Stack Developer & Cloud Architect',
    bio: 'Passionate about Next.js 15, TypeScript, distributed systems, and AI agent architectures.',
    role: 'student',
  })

  // Live state
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [enrolledExams, setEnrolledExams] = useState<any[]>([])
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Profile Edit State
  const [editName, setEditName] = useState('Alex Johnson')
  const [editHeadline, setEditHeadline] = useState('Full-Stack Developer & Cloud Architect')
  const [editBio, setEditBio] = useState('Passionate about Next.js 15, TypeScript, distributed systems, and AI agent architectures.')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')

  // Settings / Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const userRes = await fetch('/api/auth/me')
      if (userRes.ok) {
        const userData = await userRes.json()
        if (userData.user) {
          setUserProfile({
            id: userData.user.id,
            name: userData.user.name || 'Alex Johnson',
            email: userData.user.email || 'student@mentor.test',
            avatar: userData.user.photo || '/assets/images/students-1.jpg',
            headline: userData.user.headline || 'Full-Stack Developer & Cloud Architect',
            bio: userData.user.bio || 'Passionate about Next.js 15, TypeScript, distributed systems, and AI agent architectures.',
            role: userData.user.role || 'student',
          })
          setEditName(userData.user.name || 'Alex Johnson')
          setEditHeadline(userData.user.headline || 'Full-Stack Developer & Cloud Architect')
          setEditBio(userData.user.bio || 'Passionate about Next.js 15, TypeScript, distributed systems, and AI agent architectures.')
        }
      }

      // Fetch Courses
      const coursesRes = await fetch('/api/student/courses')
      if (coursesRes.ok) {
        const cData = await coursesRes.json()
        if (cData.courses) setEnrolledCourses(cData.courses)
      }

      // Fetch Exams
      const examsRes = await fetch('/api/student/exams')
      if (examsRes.ok) {
        const eData = await examsRes.json()
        if (eData.exams) setEnrolledExams(eData.exams)
      }

      // Fetch Purchases
      const prodRes = await fetch('/api/student/purchases')
      if (prodRes.ok) {
        const pData = await prodRes.json()
        if (pData.purchases) setPurchasedProducts(pData.purchases)
      }

      // Fetch Wishlist
      const wishRes = await fetch('/api/student/wishlist')
      if (wishRes.ok) {
        const wData = await wishRes.json()
        if (Array.isArray(wData.wishlist)) {
          setWishlist(wData.wishlist)
        } else if (wData.wishlist && typeof wData.wishlist === 'object') {
          const coursesList = (wData.wishlist.courses || []).map((c: any) => ({ ...c, item_type: 'course' }))
          const examsList = (wData.wishlist.exams || []).map((e: any) => ({ ...e, item_type: 'exam' }))
          const productsList = (wData.wishlist.products || []).map((p: any) => ({ ...p, item_type: 'product' }))
          setWishlist([...coursesList, ...examsList, ...productsList])
        }
      }

      // Fetch Certificates
      const certRes = await fetch('/api/student/certificates')
      if (certRes.ok) {
        const certData = await certRes.json()
        if (certData.certificates) setCertificates(certData.certificates)
      }
    } catch (err) {
      console.error('Error loading student data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileSuccess('')
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          headline: editHeadline,
          bio: editBio
        })
      })
      const resJson = await res.json()
      if (resJson.success) {
        setProfileSuccess('Profile saved successfully!')
        toast.success('Profile updated successfully')
        setUserProfile(prev => ({
          ...prev,
          name: editName,
          headline: editHeadline,
          bio: editBio
        }))
        setTimeout(() => setProfileSuccess(''), 3000)
      } else {
        toast.error(resJson.message || 'Failed to update profile.')
      }
    } catch {
      toast.error('Error saving profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordSuccess('')
    setPasswordError('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      toast.error('New passwords do not match')
      setPasswordSaving(false)
      return
    }

    try {
      const res = await fetch('/api/student/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      })
      const resJson = await res.json()
      if (resJson.success) {
        setPasswordSuccess('Password changed successfully!')
        toast.success('Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(''), 3000)
      } else {
        setPasswordError(resJson.message || 'Failed to change password.')
        toast.error(resJson.message || 'Failed to change password.')
      }
    } catch {
      setPasswordError('Error updating password.')
      toast.error('Error updating password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleRemoveWishlist = async (itemId: number, itemType: string = 'course') => {
    try {
      const res = await fetch('/api/student/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_type: itemType, item_id: itemId })
      })
      if (res.ok) {
        setWishlist(prev => prev.filter(item => !(item.id === itemId && (item.item_type || 'course') === itemType)))
        toast.success('Item removed from wishlist')
      } else {
        toast.error('Could not remove item from wishlist')
      }
    } catch (err) {
      console.error('Error removing wishlist item:', err)
      toast.error('Failed to remove from wishlist')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user')
      localStorage.setItem('mentor_user_role', 'guest')
      document.cookie = 'demo_user=; path=/; max-age=0'
      document.cookie = 'mentor_session=; path=/; max-age=0'
      document.cookie = 'lms_session=; path=/; max-age=0'
      window.dispatchEvent(new Event('mentor_user_state_changed'))
      window.dispatchEvent(new Event('storage'))
    }
    window.location.href = '/login'
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Left Sidebar Card matching Laravel layout */}
        <Card className="sticky top-24 w-full md:w-64 p-5 rounded-2xl border border-border bg-card shadow-xs shrink-0">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-20 w-20 border-2 border-primary/30">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="mt-4 font-bold text-foreground text-base">
              {userProfile.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-50">
              {userProfile.email}
            </p>
          </div>

          {(userProfile.role === 'instructor' || userProfile.role === 'admin') && (
            <Button
              variant="ghost"
              asChild
              className="mb-3 h-10 w-full justify-start gap-3 rounded-xl px-3 text-start text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 text-foreground" />
                <span>Admin / Mentor Dashboard</span>
              </Link>
            </Button>
          )}

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => switchTab('courses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'courses'
                  ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>My Courses</span>
              <Badge
                className={cn(
                  'ml-auto text-xs font-bold',
                  activeTab === 'courses'
                    ? 'bg-slate-950 text-[#D8FC38] border-none'
                    : 'bg-muted text-muted-foreground border-none'
                )}
              >
                {enrolledCourses.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => switchTab('exams')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'exams'
                  ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>My Exams</span>
              <Badge
                className={cn(
                  'ml-auto text-xs font-bold',
                  activeTab === 'exams'
                    ? 'bg-slate-950 text-[#D8FC38] border-none'
                    : 'bg-muted text-muted-foreground border-none'
                )}
              >
                {enrolledExams.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => switchTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'products'
                  ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Digital Store</span>
              <Badge
                className={cn(
                  'ml-auto text-xs font-bold',
                  activeTab === 'products'
                    ? 'bg-slate-950 text-[#D8FC38] border-none'
                    : 'bg-muted text-muted-foreground border-none'
                )}
              >
                {purchasedProducts.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => switchTab('wishlist')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'wishlist'
                  ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
              <Badge
                className={cn(
                  'ml-auto text-xs font-bold',
                  activeTab === 'wishlist'
                    ? 'bg-slate-950 text-[#D8FC38] border-none'
                    : 'bg-muted text-muted-foreground border-none'
                )}
              >
                {wishlist.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => switchTab('certificates')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'certificates'
                  ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Certificates</span>
              <Badge
                className={cn(
                  'ml-auto text-xs font-bold',
                  activeTab === 'certificates'
                    ? 'bg-slate-950 text-[#D8FC38] border-none'
                    : 'bg-muted text-muted-foreground border-none'
                )}
              >
                {certificates.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => switchTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'profile'
                  ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <UserCircle className="h-4 w-4" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'settings'
                  ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>

          <Separator className="my-5" />

          <div className="space-y-2">
            <Link href="/courses" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold rounded-xl cursor-pointer">
                Browse Courses
              </Button>
            </Link>
            <Link href="/become-instructor" className="block">
              <Button variant="ghost" size="sm" className="w-full text-xs font-semibold text-foreground cursor-pointer hover:bg-muted rounded-xl">
                Become Instructor
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </Button>
          </div>
        </Card>

        {/* Right Content Workspace */}
        <div className="flex-1 w-full space-y-6">
          {/* TAB 1: MY COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Enrolled Courses</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Track your enrolled courses, syllabus progress, and course dashboards.
                  </p>
                </div>
              </div>

              {enrolledCourses.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">No enrolled courses yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Enroll in featured courses to start learning.</p>
                  <Button asChild size="sm">
                    <Link href="/courses">Explore Catalog</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Link href={`/courses/${course.slug || course.id}`}>
                          <img
                            src={course.thumbnail || '/assets/images/blank-image.jpg'}
                            alt={course.title}
                            className="h-16 w-24 rounded-xl object-cover border border-border shrink-0 hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/assets/images/blank-image.jpg'
                            }}
                          />
                        </Link>
                        <div className="space-y-1">
                          <Link href={`/courses/${course.slug || course.id}`}>
                            <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                              {course.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Instructor: {course.instructor_name} • Last studied {course.last_accessed || 'Recently'}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-[#D8FC38]"
                                style={{ width: `${course.progress_percent || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              {course.progress_percent || 0}% ({course.completed_lessons || 0}/{course.total_lessons || 10} lessons)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button asChild size="sm" variant="outline" className="font-semibold text-xs h-8 cursor-pointer">
                          <Link href={`/courses/${course.slug || course.id}`}>
                            Course Hub
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="font-semibold text-xs h-8 cursor-pointer">
                          <Link href={`/courses/${course.slug || course.id}/learn`}>
                            <PlayCircle className="h-3.5 w-3.5 mr-1" />
                            {course.progress_percent === 100 ? 'Review' : 'Continue'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY EXAMS */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Enrolled Assessments & Exams</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View scheduled assessments, practice test attempts, and scores.
                </p>
              </div>

              {enrolledExams.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">No enrolled assessments</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Enroll in certification exams to test your knowledge.</p>
                  <Button asChild size="sm">
                    <Link href="/exams">Browse Exams</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enrolledExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/80 bg-card shadow-xs hover:border-[#D8FC38]/60 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Link href={`/exams/${exam.slug || exam.id}`}>
                          <img
                            src={exam.thumbnail || '/assets/images/blank-image.jpg'}
                            alt={exam.title}
                            className="h-16 w-24 rounded-xl object-cover border border-border shrink-0 hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/assets/images/blank-image.jpg'
                            }}
                          />
                        </Link>
                        <div className="space-y-1">
                          <Link href={`/exams/${exam.slug || exam.id}`}>
                            <h4 className="text-sm sm:text-base font-bold text-foreground hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                              {exam.title}
                            </h4>
                          </Link>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Pass Mark: {exam.pass_mark}% • {exam.total_questions} Questions • {exam.duration_minutes} mins
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            {exam.total_attempts > 0 ? (
                              <Badge className={exam.is_passed ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold' : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-semibold'}>
                                Best: {exam.best_marks} marks ({exam.is_passed ? 'Passed' : 'Failed'})
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs font-semibold">
                                Not Attempted Yet
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Attempts: {exam.total_attempts || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button asChild size="sm" className="font-bold text-xs sm:text-sm h-9 px-4 rounded-xl bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-xs cursor-pointer">
                          <Link href={`/exams/${exam.slug || exam.id}`}>
                            <PlayCircle className="h-4 w-4 mr-1.5" />
                            {exam.total_attempts > 0 ? 'Retake Exam' : 'Start Exam'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIGITAL PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Digital Store Orders</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download files, source templates, and digital assets you purchased.
                </p>
              </div>

              {purchasedProducts.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">No digital product orders</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Explore UI kits, eBooks, and code templates in the store.</p>
                  <Button asChild size="sm">
                    <Link href="/products">Explore Digital Store</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {purchasedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs"
                    >
                      <div className="flex items-center gap-4">
                        <Link href={`/products/${p.slug || p.id}`}>
                          <img
                            src={p.thumbnail || '/assets/images/blank-image.jpg'}
                            alt={p.title}
                            className="h-16 w-24 rounded-xl object-cover border border-border shrink-0 hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/assets/images/blank-image.jpg'
                            }}
                          />
                        </Link>
                        <div className="space-y-1">
                          <Link href={`/products/${p.slug || p.id}`}>
                            <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                              {p.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Order #{p.order_number || p.id} • Purchased on {p.purchase_date || p.date || 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {p.download_url ? (
                          <Button asChild size="sm" className="font-semibold text-xs h-8 cursor-pointer">
                            <a href={p.download_url} download target="_blank" rel="noopener noreferrer">
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Download Files
                            </a>
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline" className="font-semibold text-xs h-8 cursor-pointer">
                            <Link href={`/products/${p.slug || p.id}`}>
                              View Product
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WISHLIST (Fully Functional with Course, Exam, Product links & Trash handler) */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Saved Wishlist</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Items you have bookmarked to enroll in later.
                </p>
              </div>

              {wishlist.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">Your wishlist is empty</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Bookmark courses, exams, and products as you browse the platform.</p>
                  <Button asChild size="sm">
                    <Link href="/courses">Browse Catalog</Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => {
                    const type = item.item_type || 'course'
                    const detailUrl =
                      type === 'exam'
                        ? `/exams/${item.slug || item.id}`
                        : type === 'product'
                        ? `/products/${item.slug || item.id}`
                        : `/courses/${item.slug || item.id}`

                    return (
                      <Card
                        key={`${type}-${item.id}`}
                        className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-xs hover:shadow-md transition-all group"
                      >
                        <div>
                          <Link href={detailUrl} className="block overflow-hidden">
                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                              <img
                                src={
                                  item.thumbnail ||
                                  '/assets/images/blank-image.jpg'
                                }
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/assets/images/blank-image.jpg'
                                }}
                              />
                              <Badge
                                variant="secondary"
                                className="absolute top-2.5 left-2.5 capitalize text-xs bg-background/90 font-semibold"
                              >
                                {type}
                              </Badge>
                            </div>
                          </Link>

                          <div className="p-4 space-y-2">
                            <Link href={detailUrl}>
                              <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-2">
                                {item.title}
                              </h4>
                            </Link>
                            <div className="flex items-baseline gap-2">
                              <span className="text-base font-bold text-foreground">
                                {Number(item.price || 0) === 0 ? 'Free' : `$${Number(item.price || 0).toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-4 pt-0">
                          <Button asChild size="sm" className="flex-1 text-xs font-semibold h-9 cursor-pointer">
                            <Link href={detailUrl}>View Details</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveWishlist(item.id, type)}
                            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-border cursor-pointer shrink-0"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Earned Credentials & Certificates</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verifiable digital certificates awarded for complete curriculum mastery.
                </p>
              </div>

              {certificates.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <Award className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">No certificates earned yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Complete all lessons in enrolled courses to earn verifiable certificates.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/80 bg-card shadow-xs hover:border-[#D8FC38]/60 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D8FC38]/20 text-slate-950 dark:text-[#D8FC38] shrink-0">
                          <Award className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-foreground">
                            {cert.course_title}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Instructor: {cert.instructor_name} • Issued: {cert.issue_date}
                          </p>
                          <Badge variant="outline" className="text-xs font-semibold mt-1">
                            Credential ID: {cert.identifier}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <Button asChild size="sm" className="text-xs sm:text-sm font-bold h-9 px-4 rounded-xl bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-xs cursor-pointer">
                          <Link href={`/student/courses/${cert.course_id || 1}/certificate`}>
                            <Award className="h-4 w-4 mr-1.5" />
                            View & Download
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="text-xs sm:text-sm font-semibold h-9 px-3.5 rounded-xl cursor-pointer">
                          <Link href={cert.verify_url || `/verify-certificate/${cert.identifier}`}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Verify Credential
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div>
                <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your personal account information and public learner badge.
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  {profileSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-foreground">Full Name</label>
                  <Input
                    required
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-foreground">Email Address (Immutable)</label>
                  <Input
                    disabled
                    type="email"
                    value={userProfile.email}
                    className="text-xs bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5 text-xs sm:col-span-2">
                  <label className="font-semibold text-foreground">Professional Headline</label>
                  <Input
                    type="text"
                    placeholder="e.g. Software Engineer | Open-Source Enthusiast"
                    value={editHeadline}
                    onChange={(e) => setEditHeadline(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-xs sm:col-span-2">
                  <label className="font-semibold text-foreground">Bio / Learning Goals</label>
                  <textarea
                    rows={3}
                    placeholder="Tell instructors and classmates about your background..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  />
                </div>
              </div>

              <Button type="submit" size="sm" disabled={profileSaving} className="text-xs font-semibold cursor-pointer">
                {profileSaving ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile Changes'
                )}
              </Button>
            </form>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <form onSubmit={handlePasswordChange} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Account Security & Password</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update your account authentication credentials and security settings.
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl text-xs font-semibold">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4 max-w-md pt-2">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-foreground">Current Password</label>
                    <Input
                      required
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="text-xs"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-foreground">New Password</label>
                    <Input
                      required
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="text-xs"
                      placeholder="Minimum 8 characters"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-foreground">Confirm New Password</label>
                    <Input
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="text-xs"
                      placeholder="Re-type new password"
                    />
                  </div>
                </div>

                <Button type="submit" size="sm" disabled={passwordSaving} className="text-xs font-semibold cursor-pointer">
                  {passwordSaving ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
