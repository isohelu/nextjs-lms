export interface AboutSectionData {
  // Top Badge & Typography
  badgeText: string
  titleLine1: string
  titleLine2: string
  highlightWord: string
  highlightColor: string
  description: string

  // Action Buttons
  primaryBtnText: string
  primaryBtnUrl: string
  secondaryBtnText: string
  secondaryBtnUrl: string

  // Center Model Card
  modelCardBg: string
  modelAccentShapeBg?: string
  modelImageUrl: string
  modelImageAlt: string

  // Floating Overlays on Model Card
  floating1Title: string
  floating1Avatar1: string
  floating1Avatar2: string
  floating1Avatar3: string
  floating1Avatar4: string
  floating1Badge: string

  floating2Rating: string
  floating2Label: string

  // 4 Feature Cards on the Right
  card1Icon: 'book' | 'play' | 'shield' | 'career'
  card1Title: string
  card1Desc: string
  card1Url: string

  card2Icon: 'book' | 'play' | 'shield' | 'career'
  card2Title: string
  card2Desc: string
  card2Url: string

  card3Icon: 'book' | 'play' | 'shield' | 'career'
  card3Title: string
  card3Desc: string
  card3Url: string

  card4Icon: 'book' | 'play' | 'shield' | 'career'
  card4Title: string
  card4Desc: string
  card4Url: string

  // Bottom 4 Stats Bar
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  stat4Value: string
  stat4Label: string
}

export const DEFAULT_ABOUT_SECTION_DATA: AboutSectionData = {
  // Top Badge & Typography
  badgeText: 'ABOUT THE PLATFORM',
  titleLine1: 'A Smarter Way',
  titleLine2: 'to Learn and',
  highlightWord: 'Grow',
  highlightColor: '#84CC16', // Vibrant energetic lime from the reference image
  description:
    'Our platform gives you practical, industry-relevant learning with expert guidance, interactive practice, and globally recognized credentials.',

  // Action Buttons
  primaryBtnText: 'Explore Curriculum',
  primaryBtnUrl: '/courses',
  secondaryBtnText: 'Watch Video',
  secondaryBtnUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

  // Center Model Card
  modelCardBg: '#F5F6EC', // Warm ivory cream matching reference UI 1:1
  modelAccentShapeBg: '#E3F69D', // Luminous pastel electric lime tilted shape matching reference UI 1:1
  modelImageUrl: '/assets/images/about-platform-model.png',
  modelImageAlt: 'Smiling student holding laptop',

  // Floating Overlays
  floating1Title: 'Learn from Experts',
  floating1Avatar1: '/assets/avatars/avatar-1.png',
  floating1Avatar2: '/assets/avatars/avatar-2.png',
  floating1Avatar3: '/assets/avatars/avatar-3.png',
  floating1Avatar4: '/assets/avatars/avatar-4.png',
  floating1Badge: '+12',

  floating2Rating: '4.9 / 5.0',
  floating2Label: 'Student Rating',

  // 4 Feature Cards
  card1Icon: 'book',
  card1Title: 'Production-Ready Curriculum',
  card1Desc: 'Learn with real-world projects and modern tools.',
  card1Url: '/courses',

  card2Icon: 'play',
  card2Title: 'Interactive Learning',
  card2Desc: 'Live classes, hands-on practice, and instant feedback.',
  card2Url: '/courses',

  card3Icon: 'shield',
  card3Title: 'Verifiable Credentials',
  card3Desc: 'Earn certificates recognized by industry leaders.',
  card3Url: '/verify-certificate',

  card4Icon: 'career',
  card4Title: 'Career-Focused',
  card4Desc: 'Build in-demand skills and advance your career.',
  card4Url: '/job-circulars',

  // Bottom 4 Stats Bar
  stat1Value: '120+',
  stat1Label: 'Courses & Modules',
  stat2Value: '40K+',
  stat2Label: 'Active Learners',
  stat3Value: '99.8%',
  stat3Label: 'Completion Success',
  stat4Value: 'Global',
  stat4Label: 'Industry Recognition',
}
