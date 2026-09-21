import React from 'react'
import Link from 'next/link'
import { Sparkles, Globe, Share2, Shield, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/40 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md">
                <Sparkles className="size-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                Mentor<span className="text-indigo-500">LMS</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Empowering engineers and developers worldwide with production-ready curriculum, interactive coding labs, and real-time mentor feedback.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <a href="#" className="hover:text-indigo-500 transition-colors" title="Global Network"><Globe className="size-4" /></a>
              <a href="#" className="hover:text-indigo-500 transition-colors" title="Community"><Share2 className="size-4" /></a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Curriculum</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/#catalog" className="hover:text-foreground transition-colors">Full Stack Web Dev</Link></li>
              <li><Link href="/#catalog" className="hover:text-foreground transition-colors">AI & Autonomous Agents</Link></li>
              <li><Link href="/#catalog" className="hover:text-foreground transition-colors">Kubernetes & Cloud Native</Link></li>
              <li><Link href="/#catalog" className="hover:text-foreground transition-colors">Interactive GSAP UI/UX</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Student Dashboard</Link></li>
              <li><Link href="/auth" className="hover:text-foreground transition-colors">Sign In / Register</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Enterprise Licensing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Certificate Verification</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Stack & Security</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Powered by Next.js 15, Supabase PostgreSQL, Row Level Security, shadcn/ui, and GSAP micro-interactions.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
              <Shield className="size-3.5" />
              <span>SOC2 & RLS Secured Database</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} MentorLMS Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with Next.js & Supabase</span>
            <Heart className="size-3 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  )
}
