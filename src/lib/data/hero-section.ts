export interface HeroSectionData {
  // Top Card Content
  headlineLine1: string
  headlineLine2: string
  headlineLine3: string
  accentColor: string
  description: string
  primaryButtonText: string
  primaryButtonUrl: string
  videoButtonText: string
  videoUrl: string

  // Model Image & Placement
  modelImageUrl: string
  modelImageAlt: string
  modelPositionLeft: string
  modelWidth: string

  // 10K+ Floating Card
  statsCount: string
  statsLabel: string
  statsUrl: string
  avatar1Url: string
  avatar2Url: string
  avatar3Url: string
  avatar4Url: string
  avatarMoreCount: string

  // 3 Stacked Pill Links
  pill1Text: string
  pill1Url: string
  pill2Text: string
  pill2Url: string
  pill3Text: string
  pill3Url: string

  // Bottom Card 1 (Left - Mind, Body & Soul)
  card1Badge: string
  card1Title: string
  card1Description: string
  card1Url: string
  card1ImageUrl: string

  // Bottom Card 2 (Middle - Learn Anywhere)
  card2Badge: string
  card2Title: string
  card2Description: string
  card2Url: string
  card2BgColor: string

  // Bottom Card 3 (Right - Build a Healthier You)
  card3Badge: string
  card3Title: string
  card3Description: string
  card3Url: string
  card3ImageUrl: string
}

export const DEFAULT_HERO_DATA: HeroSectionData = {
  headlineLine1: 'Learn.',
  headlineLine2: 'Grow.',
  headlineLine3: 'Be You.',
  accentColor: '#D8FC38',
  description:
    'Explore high-quality online courses, learn from real experts, and gain skills that make a real difference in your career and life.',
  primaryButtonText: 'Start Learning',
  primaryButtonUrl: '/courses',
  videoButtonText: 'Watch Video',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

  modelImageUrl: '/assets/images/hero-student-girl.png',
  modelImageAlt: 'Student Learner',
  modelPositionLeft: '34.5%',
  modelWidth: '415px',

  statsCount: '10K+',
  statsLabel: 'Active Learners',
  statsUrl: '/courses',
  avatar1Url: '/assets/avatars/avatar-1.png',
  avatar2Url: '/assets/avatars/avatar-2.png',
  avatar3Url: '/assets/avatars/avatar-3.png',
  avatar4Url: '/assets/avatars/avatar-4.png',
  avatarMoreCount: '+',

  pill1Text: 'Industry Experts',
  pill1Url: '/instructors',
  pill2Text: 'Flexible Learning',
  pill2Url: '/courses',
  pill3Text: 'Certificate Programs',
  pill3Url: '/certificates',

  card1Badge: 'Live Classes',
  card1Title: 'For Mind,\nBody and Soul',
  card1Description: 'Join live sessions and learn with a global community.',
  card1Url: '/live-classes',
  card1ImageUrl: '/assets/images/hero-yoga-man.png',

  card2Badge: 'Explore',
  card2Title: 'Learn\nAnywhere',
  card2Description: 'Access high-quality courses on any device, at your own',
  card2Url: '/courses',
  card2BgColor: '#D8FC38',

  card3Badge: 'For Everyone',
  card3Title: 'Build a\nHealthier You',
  card3Description: 'Guided practices for a calmer, stronger and happier you.',
  card3Url: '/wellness',
  card3ImageUrl: '/assets/images/hero-yoga-woman.png',
}
