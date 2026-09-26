import React from 'react'
import { Sparkles, ShieldCheck, Award, Zap, BookOpen, Users } from 'lucide-react'

export interface FeatureItem {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 1,
    title: 'Self-Paced Interactive Lectures',
    description: 'Master in-demand tech stacks through high-definition streaming videos, downloadable source code repositories, and interactive checkpoints.',
    icon: Zap,
  },
  {
    id: 2,
    title: 'Verified Industry Credentials',
    description: 'Earn cryptographically signed certificates with verifiable IDs and QR validation recognized by leading technology enterprises.',
    icon: Award,
  },
  {
    id: 3,
    title: 'Direct Expert Mentorship',
    description: 'Ask questions, review solutions, and discuss complex architectural trade-offs directly with veteran staff engineers and educators.',
    icon: Users,
  },
]

export default function Features({ features }: { features?: FeatureItem[] }) {
  const items = features || DEFAULT_FEATURES

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 grid gap-8 md:grid-cols-3">
          {items.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={`feature-${index}`}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-8 backdrop-blur-xs transition-all duration-300 hover:border-primary/50 hover:shadow-xl shadow-xs"
              >
                {/* Ambient glow orbs matching Laravel reference */}
                <div className="pointer-events-none absolute -top-8 left-0 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl transition-opacity group-hover:opacity-100" />

                <div className="relative z-10 space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
