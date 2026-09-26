'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
  FileText
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

  const [userProfile, setUserProfile] = useState({
    id: 0,
    name: 'Verified Student',
    email: 'student@mentorlms.com',
    avatar: '/assets/avatars/avatar-1.png',
    headline: '',
    bio: ''
  })

  // Live state
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [enrolledExams, setEnrolledExams] = useState<any[]>([])
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Profile Edit State
  const [editName, setEditName] = useState('')
  const [editHeadline, setEditHeadline] = useState('')
  const [editBio, setEditBio] = useState('')
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
            name: userData.user.name || 'Verified Student',
            email: userData.user.email || 'student@mentorlms.com',
            avatar: userData.user.photo || '/assets/avatars/avatar-1.png',
            headline: userData.user.headline || '',
            bio: userData.user.bio || ''
          })
          setEditName(userData.user.name || '')
          setEditHeadline(userData.user.headline || '')
          setEditBio(userData.user.bio || '')
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
          const combined = [
            ...(wData.wishlist.courses || []),
            ...(wData.wishlist.exams || []),
            ...(wData.wishlist.products || [])
          ]
          setWishlist(combined)
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
        setUserProfile(prev => ({
          ...prev,
          name: editName,
          headline: editHeadline,
          bio: editBio
        }))
        setTimeout(() => setProfileSuccess(''), 3000)
      } else {
        alert(resJson.message || 'Failed to update profile.')
      }
    } catch (err) {
      alert('Error saving profile.')
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
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(''), 3000)
      } else {
        setPasswordError(resJson.message || 'Failed to change password.')
      }
    } catch (err) {
      setPasswordError('Error updating password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleRemoveWishlist = async (courseId: number) => {
    try {
      await fetch('/api/student/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId })
      })
      setWishlist(prev => prev.filter(item => item.id !== courseId))
    } catch (err) {
      console.error('Error removing wishlist item:', err)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Left Sidebar Card */}
        <Card className="sticky top-24 w-full md:w-64 p-5 rounded-2xl border border-border bg-card shadow-sm shrink-0">
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

          <nav className="space-y-1">
            <Link
              href="/student/dashboard"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-[#007867]" />
              <span>Dashboard Overview</span>
            </Link>

            <button
              onClick={() => switchTab('courses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'courses'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>My Courses</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {enrolledCourses.length}
              </Badge>
            </button>

            <button
              onClick={() => switchTab('exams')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'exams'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>My Exams</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {enrolledExams.length}
              </Badge>
            </button>

            <button
              onClick={() => switchTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Digital Store</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {purchasedProducts.length}
              </Badge>
            </button>

            <button
              onClick={() => switchTab('wishlist')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'wishlist'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {wishlist.length}
              </Badge>
            </button>

            <button
              onClick={() => switchTab('certificates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'certificates'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Certificates</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {certificates.length}
              </Badge>
            </button>

            <button
              onClick={() => switchTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <UserCircle className="h-4 w-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => switchTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>

          <Separator className="my-5" />

          <div className="space-y-2">
            <Link href="/courses/all" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                Browse Courses
              </Button>
            </Link>
            <Link href="/student/become-instructor" className="block">
              <Button variant="ghost" size="sm" className="w-full text-xs font-semibold text-primary">
                Become Instructor
              </Button>
            </Link>
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
                    <Link href="/courses/all">Explore Catalog</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-16 w-24 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="space-y-1">
                          <Link href={`/student/courses/${course.id}`}>
                            <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                              {course.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Instructor: {course.instructor_name} • Last studied {course.last_accessed}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${course.progress_percent}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-foreground">
                              {course.progress_percent}% ({course.completed_lessons}/{course.total_lessons} lessons)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button asChild size="sm" variant="outline" className="font-semibold text-xs h-8">
                          <Link href={`/student/courses/${course.id}`}>
                            Course Hub
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="font-semibold text-xs h-8">
                          <Link href={`/courses/${course.slug}/learn`}>
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
                    <Link href="/exams/all">Browse Exams</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enrolledExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={exam.thumbnail}
                          alt={exam.title}
                          className="h-16 w-24 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-foreground">
                            {exam.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Pass Mark: {exam.pass_mark}% • {exam.total_questions} Questions • {exam.duration_minutes} mins
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            {exam.total_attempts > 0 ? (
                              <Badge className={exam.is_passed ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]' : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]'}>
                                Best: {exam.best_marks} marks ({exam.is_passed ? 'Passed' : 'Failed'})
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                Not Attempted Yet
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              Attempts: {exam.total_attempts}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button asChild size="sm" className="font-semibold text-xs h-8">
                          <Link href={`/student/exams/${exam.id}`}>
                            <PlayCircle className="h-3.5 w-3.5 mr-1" />
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
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={p.thumbnail || '/assets/images/placeholder.jpg'}
                          alt={p.title}
                          className="h-16 w-24 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-foreground">
                            {p.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Order #{p.order_number || p.id} • Purchased on {p.date || 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {p.download_url ? (
                          <Button asChild size="sm" className="font-semibold text-xs h-8">
                            <a href={p.download_url} download target="_blank" rel="noopener noreferrer">
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Download Files
                            </a>
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline" className="font-semibold text-xs h-8">
                            <Link href={`/products/${p.slug}`}>
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

          {/* TAB 4: WISHLIST */}
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
                  <p className="text-xs text-muted-foreground mt-1">Bookmark courses and exams as you browse the platform.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted">
                          <img
                            src={item.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80'}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <h4 className="text-sm font-bold text-foreground line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-foreground">
                            ${Number(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Link href={`/courses/${item.slug}`} className="flex-1">
                          <Button size="sm" className="w-full text-xs font-semibold h-8">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveWishlist(item.id)}
                          className="h-8 text-xs text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                    <Link href="/courses/all">Browse Courses</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 border-amber-500/20 bg-amber-500/5 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                          <Award className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">
                            {cert.course_title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Instructor: {cert.instructor_name} • Issued: {cert.issue_date}
                          </p>
                          <Badge variant="outline" className="text-[10px] font-mono mt-1 text-amber-600 border-amber-500/30">
                            Credential ID: {cert.identifier}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button asChild size="sm" variant="outline" className="text-xs font-semibold h-8">
                          <Link href={cert.verify_url || `/certificates/${cert.identifier}`}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
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
            <form onSubmit={handleProfileSave} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
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
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <Button type="submit" size="sm" disabled={profileSaving} className="text-xs font-semibold">
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
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Account Security & Settings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update password credentials and manage notification preferences.
                </p>
              </div>

              {/* Password Change Card */}
              <form onSubmit={handlePasswordChange} className="space-y-4 p-5 rounded-xl border border-border bg-muted/10">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Change Password</h3>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold">
                    {passwordError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Current Password *</label>
                    <Input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">New Password *</label>
                    <Input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Confirm New Password *</label>
                    <Input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" size="sm" disabled={passwordSaving} className="text-xs font-semibold">
                  {passwordSaving ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>

              <div className="space-y-4 pt-2 text-xs text-foreground">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
                  <div>
                    <p className="font-semibold">Email Course Updates & Announcements</p>
                    <p className="text-muted-foreground text-[11px]">Receive emails when instructors publish new lessons or lab exercises.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
                  <div>
                    <p className="font-semibold">Assignment Evaluation Alerts</p>
                    <p className="text-muted-foreground text-[11px]">Notify immediately when an instructor grades your homework submission.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
