'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle2,
  ExternalLink,
  Download,
  Video,
  ShieldCheck,
  CreditCard,
  Lock,
  Loader2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface ReserveSessionTarget {
  id: string
  title: string
  categoryLabel: string
  dateStr: string
  timeStr: string
  instructor: string
  instructorAvatar?: string
  instructorRole?: string
  thumbnail?: string
  seatsLeft: number
  price?: number
  isLiveNow?: boolean
  liveRoomUrl?: string
  type: 'event' | 'schedule'
}

interface SeatReservationModalProps {
  session: ReserveSessionTarget | null
  isOpen: boolean
  onClose: () => void
  onSuccessReserve?: (sessionId: string, newSeatsLeft: number) => void
}

export default function SeatReservationModal({
  session,
  isOpen,
  onClose,
  onSuccessReserve,
}: SeatReservationModalProps) {
  const [loadingAccess, setLoadingAccess] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [accessType, setAccessType] = useState<string>('free_reserved')
  const [unlockedLiveUrl, setUnlockedLiveUrl] = useState<string | null>(null)
  
  // Payment / form states
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState('')
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvc, setCardCvc] = useState('888')
  const [copiedLink, setCopiedLink] = useState(false)

  // Verify access and login status when modal opens
  useEffect(() => {
    if (!isOpen || !session) return

    let isMounted = true
    async function verifyAccess() {
      setLoadingAccess(true)
      try {
        const res = await fetch(`/api/schedules/access?itemId=${encodeURIComponent(session!.id)}`)
        const data = await res.json()
        if (isMounted && data.success) {
          if (data.authenticated && data.user) {
            setCurrentUser(data.user)
            if (data.hasAccess) {
              setHasAccess(true)
              setAccessType(data.accessType || 'free_reserved')
              setUnlockedLiveUrl(data.liveRoomUrl || session!.liveRoomUrl || 'https://meet.google.com/live-room')
            } else {
              setHasAccess(false)
            }
          } else {
            setCurrentUser(null)
            setHasAccess(false)
          }
        }
      } catch (err) {
        console.error('Failed to verify access:', err)
      } finally {
        if (isMounted) setLoadingAccess(false)
      }
    }

    verifyAccess()
    return () => {
      isMounted = false
    }
  }, [isOpen, session])

  if (!isOpen || !session) return null

  const isPaid = (session.price ?? 0) > 0
  const priceAmount = session.price ?? 0

  const handlePurchaseOrReserve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      toast.error('You must be logged in to reserve or purchase a seat.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/schedules/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: session.id,
          itemType: session.type,
          itemTitle: session.title,
          price: priceAmount,
          note: note.trim(),
          paymentMethod: isPaid ? 'card' : 'free',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setHasAccess(true)
        setAccessType(data.accessType || (isPaid ? 'paid' : 'free_reserved'))
        const activeLiveUrl = data.liveRoomUrl || session.liveRoomUrl || 'https://meet.google.com/live-room'
        setUnlockedLiveUrl(activeLiveUrl)
        
        const updatedSeats = typeof data.remainingSeats === 'number' ? data.remainingSeats : Math.max(0, session.seatsLeft - 1)
        if (onSuccessReserve) {
          onSuccessReserve(session.id, updatedSeats)
        }
        toast.success(data.message || 'Seat confirmed! Class link unlocked.')
      } else {
        toast.error(data.message || 'Failed to complete transaction')
      }
    } catch (err) {
      console.error('Reservation submit error:', err)
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Google Calendar Link generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(session.title)
    const details = encodeURIComponent(
      `Join this live session hosted by ${session.instructor}.\n\nAccess Link: ${unlockedLiveUrl || session.liveRoomUrl || 'Classroom Room'}\nTime: ${session.timeStr}`
    )
    const location = encodeURIComponent(unlockedLiveUrl || session.liveRoomUrl || 'Online LMS Classroom')
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`
  }

  // Generate and download .ics file
  const handleDownloadIcs = () => {
    const targetUrl = unlockedLiveUrl || session.liveRoomUrl || 'Online LMS Classroom'
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mentor LMS//Live Sessions//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${session.title}`,
      `DESCRIPTION:Instructor: ${session.instructor}\\nTime: ${session.timeStr}\\nClass URL: ${targetUrl}`,
      `LOCATION:${targetUrl}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${session.id}-session-pass.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Calendar .ICS invite downloaded!')
  }

  const handleCopyLink = () => {
    if (unlockedLiveUrl) {
      navigator.clipboard.writeText(unlockedLiveUrl)
      setCopiedLink(true)
      toast.success('Live classroom link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative p-6 pb-4 bg-slate-900 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#D8FC38] px-3 py-0.5 text-xs font-bold text-slate-950">
                {session.categoryLabel}
              </span>
              {isPaid ? (
                <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                  ${priceAmount} USD
                </span>
              ) : (
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                  FREE PASS
                </span>
              )}
              {session.isLiveNow && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  LIVE NOW
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="mt-3 text-lg sm:text-xl font-bold leading-snug line-clamp-2">
            {session.title}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#D8FC38]" />
              <span>{session.dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#D8FC38]" />
              <span>{session.timeStr}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>{session.seatsLeft} seats left</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loadingAccess ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-[#D8FC38]" />
              <span className="text-xs font-medium">Verifying student account & access status...</span>
            </div>
          ) : !currentUser ? (
            /* CASE 1: USER IS NOT LOGGED IN */
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Lock className="h-7 w-7" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Student Account Required
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  To join the live classroom and secure your seat, you must sign in as a verified student.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {(() => {
                  const nextStepUrl = isPaid
                    ? `/checkout?scheduleId=${session.id}&title=${encodeURIComponent(session.title)}&price=${priceAmount}`
                    : `/student/live-classes?session=${session.id}&title=${encodeURIComponent(session.title)}&room=${encodeURIComponent(unlockedLiveUrl || session.liveRoomUrl || '')}`
                  return (
                    <>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(nextStepUrl)}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold py-3 text-sm shadow-xs transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Sign In To Join</span>
                      </Link>

                      <Link
                        href={`/register?redirect=${encodeURIComponent(nextStepUrl)}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold py-3 text-sm transition-colors"
                      >
                        <span>Create Account</span>
                      </Link>
                    </>
                  )
                })()}
              </div>

              <p className="text-[11px] text-slate-500">
                🔒 Registered students get instant access, automated calendar reminders, and verified credentials.
              </p>
            </div>
          ) : hasAccess ? (
            /* CASE 2: USER ALREADY HAS CONFIRMED ACCESS (PAID / ADMIN ASSIGNED / FREE RESERVED) */
            <div className="space-y-4 py-2">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Access Confirmed & Seat Secured</span>
                  </div>
                  <span className="rounded-full bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5">
                    {accessType === 'admin_assigned'
                      ? 'Student Membership'
                      : accessType === 'paid'
                      ? 'Paid Pass'
                      : 'Free Pass'}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-emerald-800 dark:text-emerald-400">
                  Enrolled student: <strong>{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>

              {/* UNLOCKED LIVE CLASSROOM LINK BOX */}
              <div className="rounded-2xl border-2 border-[#D8FC38] bg-slate-900 text-white p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D8FC38]">
                    <Video className="h-4 w-4 animate-pulse" />
                    Live Classroom Link Unlocked
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3 flex items-center justify-between gap-2 overflow-hidden">
                  <span className="text-xs font-mono text-slate-300 truncate max-w-[280px]">
                    {unlockedLiveUrl}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-7 px-2.5 text-xs font-bold text-[#D8FC38] hover:bg-slate-700"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="ml-1">{copiedLink ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>

                <a
                  href={unlockedLiveUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-black py-3.5 text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  <Video className="h-4 w-4" />
                  <span>Join Live Classroom Room Now</span>
                  <ExternalLink className="h-4 w-4 stroke-[2.5]" />
                </a>
              </div>

              {/* Calendar Sync Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                >
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Add to Google Calendar</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="h-4 w-4 text-emerald-500" />
                  <span>Download .ICS File</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Close Window
                </Button>
              </div>
            </div>
          ) : (
            /* CASE 3: USER IS LOGGED IN BUT HAS NOT PURCHASED / RESERVED YET */
            <form onSubmit={handlePurchaseOrReserve} className="space-y-4">
              {/* Student info indicator */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentUser.name}
                  </span>
                  <span className="text-slate-500">({currentUser.email})</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
              </div>

              {/* Dynamic Pricing Banner */}
              {isPaid ? (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                        Paid Cohort Access
                      </span>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        Admission Fee: ${priceAmount}.00 USD
                      </h4>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Includes live interactive seat, direct live meeting link, accredited exam entry, and post-session replay.
                  </p>

                  {/* Mock Payment Fields for instant checkout */}
                  <div className="pt-2 border-t border-blue-200 dark:border-blue-900/60 space-y-2">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Card Information (Instant Secure Checkout)
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Card Number"
                        className="col-span-2 text-xs bg-white dark:bg-slate-900"
                      />
                      <Input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Free Community Pass
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      100% Free Live Admission
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      No payment required. Instant classroom link unlock upon reservation.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              )}

              {/* Learning goal / note */}
              <div>
                <Label htmlFor="res-note" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Question or Goal for Instructor (Optional)
                </Label>
                <Input
                  id="res-note"
                  type="text"
                  placeholder="e.g. Hope to master production deployment"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold py-3.5 text-sm shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isPaid ? 'Processing Payment...' : 'Securing Free Seat...'}
                    </>
                  ) : isPaid ? (
                    <span>Pay ${priceAmount} & Unlock Live Classroom</span>
                  ) : (
                    <span>Confirm Free Seat & Unlock Classroom Link</span>
                  )}
                </Button>
              </div>

              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                🔒 Protected by LMS Enrollment Security. Your unique classroom access link will unlock immediately.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
