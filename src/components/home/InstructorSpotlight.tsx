import Link from 'next/link';
import { Award, BookOpen, Clock, Globe, Link2, ShieldCheck, Sparkles, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FeatureItem {
  icon: typeof Award;
  title: string;
  description: string;
}

const leftFeatures: FeatureItem[] = [
  {
    icon: Award,
    title: 'Industry Recognized Certified',
    description: 'Instructors with proven industry pedigree delivering certified real-world curricula.',
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Syllabus',
    description: 'Structured end-to-end courses with hands-on capstone projects and assessments.',
  },
  {
    icon: Clock,
    title: 'Flexible Lifetime Learning',
    description: 'Learn at your own pace with unlimited lifetime access to updated modules.',
  },
];

const rightFeatures: FeatureItem[] = [
  {
    icon: ShieldCheck,
    title: 'Verified Pedagogical Excellence',
    description: 'Carefully vetted instruction models evaluated against global higher-education benchmarks.',
  },
  {
    icon: Sparkles,
    title: 'Modern Tech Stacks & Tools',
    description: 'Learn contemporary frameworks and tooling used by top engineering and design teams.',
  },
  {
    icon: Users,
    title: '1-on-1 Mentor Office Hours',
    description: 'Weekly cohort discussions, code reviews, and direct instructor Q&A sessions.',
  },
];

export default function InstructorSpotlight() {
  return (
    <section className="relative overflow-hidden py-20 bg-background">
      {/* Glow Blur Orbs */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(97,95,255,0.12)] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-60 w-60 rounded-full bg-[rgba(0,167,111,0.1)] blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-xl text-center">
          <p className="mb-2 text-sm font-semibold tracking-wider text-primary uppercase">
            World-Class Mentorship
          </p>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Learn Directly From Industry Pioneers
          </h2>
          <p className="text-base text-muted-foreground">
            Our featured mentors bring decades of engineering leadership from top Fortune 500 tech companies straight to your screen.
          </p>
        </div>

        {/* 3-Column Layout */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-3">
          {/* Left Features */}
          <div className="space-y-8">
            {leftFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Instructor Card */}
          <Card className="relative overflow-hidden border-border/60 bg-card/90 p-6 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
            <div className="relative mb-5 overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                alt="Sarah Jenkins"
                className="h-64 w-full object-cover object-top transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur shadow-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>4.98 (2.4k reviews)</span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">Dr. Sarah Jenkins</h3>
              <p className="text-sm font-medium text-primary">Lead AI & Cloud Systems Architect</p>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                Ex-Google DeepMind researcher and enterprise cloud consultant with 14+ years designing high-throughput distributed systems and training over 45,000 developers.
              </p>

              {/* Social Links */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                  <Globe className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <Button asChild className="w-full font-semibold shadow-md">
                  <Link href="/instructors/1">View Instructor Profile & Courses</Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Right Features */}
          <div className="space-y-8">
            {rightFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-foreground shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
