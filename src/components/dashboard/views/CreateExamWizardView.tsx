'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Award,
  DollarSign,
  FileText,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface QuestionItem {
  id: string
  text: string
  type: 'mcq' | 'multiple_select' | 'fill_blank'
  options: string[]
  correctIndex: number
  marks: number
}

export default function CreateExamWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Cloud & DevOps')
  const [level, setLevel] = useState('intermediate')
  const [shortDesc, setShortDesc] = useState('')

  // Questions
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q1',
      text: 'Which AWS service provides low-latency distributed caching for relational databases?',
      type: 'mcq',
      options: ['Amazon ElastiCache (Redis)', 'Amazon DynamoDB Streams', 'AWS Direct Connect', 'Amazon CloudFront'],
      correctIndex: 0,
      marks: 5,
    }
  ])

  // Rules
  const [durationMinutes, setDurationMinutes] = useState(90)
  const [passPercentage, setPassPercentage] = useState(75)
  const [allowRetakes, setAllowRetakes] = useState(true)

  // Pricing
  const [pricingType, setPricingType] = useState<'paid' | 'free'>('paid')
  const [price, setPrice] = useState('39.99')
  const [discountPrice, setDiscountPrice] = useState('19.99')

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q${prev.length + 1}`,
        text: 'New question description...',
        type: 'mcq',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        marks: 5,
      }
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id))
    }
  }

  const handlePublish = async () => {
    try {
      await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Assessment',
          description: shortDesc,
          duration: durationMinutes || 60,
          pass_percentage: passPercentage || 75,
          price: parseFloat(price) || 29,
        })
      })
    } catch {
      // ignore
    }
    alert('Assessment successfully created and submitted for review!')
    router.push('/dashboard/exams')
  }

  const steps = [
    { num: 1, label: 'Exam Info' },
    { num: 2, label: 'Question Bank' },
    { num: 3, label: 'Timing & Scoring' },
    { num: 4, label: 'Pricing & Certs' },
    { num: 5, label: 'Review & Publish' },
  ]

  return (
    <div className="min-h-screen bg-muted/20 py-10 pb-28">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard/exams" className="hover:text-foreground">Exams</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-semibold">New Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Create Certification Assessment
            </h1>
          </div>
          <Button variant="outline" size="sm" asChild className="text-xs border-border">
            <Link href="/dashboard/exams">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Discard & Exit
            </Link>
          </Button>
        </div>

        {/* Multi-step progress bar */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            {steps.map(s => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  currentStep === s.num
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : currentStep > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {currentStep > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:inline',
                  currentStep === s.num ? 'text-foreground font-bold' : 'text-muted-foreground'
                )}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Card Body */}
        <Card className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground">Step 1: Basic Assessment Info</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exam Title</label>
                <Input
                  placeholder="e.g. AWS Certified Solutions Architect - Associate Mock Exam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium"
                  >
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Short Summary / Syllabus Scope</label>
                <Textarea
                  rows={3}
                  placeholder="Summarize what skills and domain topics this assessment covers..."
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Question Bank */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Step 2: Question Items ({questions.length})</h2>
                <Button size="sm" onClick={addQuestion} className="text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-5">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-5 rounded-xl border border-border bg-muted/20 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-primary">Question #{qIndex + 1}</span>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(q.id)}
                          className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>

                    <Input
                      value={q.text}
                      onChange={(e) => {
                        const val = e.target.value
                        setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, text: val } : item))
                      }}
                      className="bg-background border-border font-medium text-sm"
                      placeholder="Enter question text..."
                    />

                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-semibold">Answer Choices (Radio indicates correct choice):</span>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctIndex === oIndex}
                            onChange={() => {
                              setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, correctIndex: oIndex } : item))
                            }}
                            className="h-4 w-4 text-primary"
                          />
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options]
                              newOpts[oIndex] = e.target.value
                              setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, options: newOpts } : item))
                            }}
                            className="h-9 text-xs bg-background border-border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Timing & Scoring */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground">Step 3: Timing & Assessment Protocol</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Limit (Minutes)</label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pass Percentage Threshold (%)</label>
                  <Input
                    type="number"
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(Number(e.target.value))}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Allow Candidate Retakes</h4>
                  <p className="text-xs text-muted-foreground">Permit students to retake the exam for practice if they fail.</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowRetakes}
                  onChange={(e) => setAllowRetakes(e.target.checked)}
                  className="h-5 w-5 text-primary rounded"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Pricing & Certificates */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground">Step 4: Pricing & Certificate Issuance</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPricingType('paid')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border text-center transition-all',
                    pricingType === 'paid'
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  Paid Certification
                </button>
                <button
                  type="button"
                  onClick={() => setPricingType('free')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border text-center transition-all',
                    pricingType === 'free'
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  Free Practice Assessment
                </button>
              </div>

              {pricingType === 'paid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Price ($)</label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discount Price ($)</label>
                    <Input
                      type="number"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Review & Publish */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground">Step 5: Final Review & Confirmation</h2>
              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3 text-sm">
                <div className="flex justify-between border-b border-border/80 pb-2">
                  <span className="text-muted-foreground">Exam Title:</span>
                  <span className="font-bold text-foreground">{title || 'AWS Certified Solutions Architect'}</span>
                </div>
                <div className="flex justify-between border-b border-border/80 pb-2">
                  <span className="text-muted-foreground">Category & Level:</span>
                  <span className="font-semibold text-foreground">{category} ({level})</span>
                </div>
                <div className="flex justify-between border-b border-border/80 pb-2">
                  <span className="text-muted-foreground">Question Count:</span>
                  <span className="font-semibold text-foreground">{questions.length} Items</span>
                </div>
                <div className="flex justify-between border-b border-border/80 pb-2">
                  <span className="text-muted-foreground">Time Limit & Pass Score:</span>
                  <span className="font-semibold text-foreground">{durationMinutes} Mins • {passPercentage}% to pass</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pricing:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {pricingType === 'free' ? 'Free' : `$${discountPrice || price}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-6 border-t border-border flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="text-xs border-border"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Previous Step
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                className="text-xs font-semibold shadow-sm"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Publish Assessment
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
