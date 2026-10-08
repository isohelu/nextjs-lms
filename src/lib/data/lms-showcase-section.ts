export interface LmsShowcaseData {
  // Section Header
  badgeText: string
  title: string
  description: string

  // Tabs
  tab1Label: string
  tab2Label: string
  tab3Label: string

  // Main Video Player
  videoPosterUrl: string
  videoTitleOverlay: string
  videoDurationText: string
  videoUrl: string

  // Playlist Card
  playlistOverline: string
  playlistTitle: string
  playlistBtnText: string
  playlistBtnUrl: string

  // 4 Playlist Lessons
  lesson1Title: string
  lesson1Status: string
  lesson1Duration: string
  lesson1Thumb: string

  lesson2Title: string
  lesson2Status: string
  lesson2Duration: string
  lesson2Thumb: string

  lesson3Title: string
  lesson3Status: string
  lesson3Duration: string
  lesson3Thumb: string

  lesson4Title: string
  lesson4Status: string
  lesson4Duration: string
  lesson4Thumb: string

  // Bottom 4 Features Row
  feat1Title: string
  feat1Subtitle: string
  feat1Icon: 'video' | 'code' | 'check' | 'award'

  feat2Title: string
  feat2Subtitle: string
  feat2Icon: 'video' | 'code' | 'check' | 'award'

  feat3Title: string
  feat3Subtitle: string
  feat3Icon: 'video' | 'code' | 'check' | 'award'

  feat4Title: string
  feat4Subtitle: string
  feat4Icon: 'video' | 'code' | 'check' | 'award'
}

export const DEFAULT_LMS_SHOWCASE_DATA: LmsShowcaseData = {
  // Section Header
  badgeText: 'LEARNING EXPERIENCE',
  title: 'Designed for Focused, Practical Study',
  description:
    'A direct look into the actual learning environment — lecture streaming, proctored assessments, and official credential verification.',

  // Tabs
  tab1Label: 'Video Learning',
  tab2Label: 'Examinations',
  tab3Label: 'Certificate Verification',

  // Main Video Player
  videoPosterUrl: '/assets/images/lms-showcase-instructor.png',
  videoTitleOverlay: '01. Course Overview & Prerequisites',
  videoDurationText: '04:15 / 12:45',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

  // Playlist Card
  playlistOverline: 'COURSE PLAYLIST',
  playlistTitle: 'Full-Stack Next.js 15 & Modern Architecture',
  playlistBtnText: 'Explore All 24 Lessons',
  playlistBtnUrl: '/courses',

  // 4 Playlist Lessons
  lesson1Title: '01. Course Overview & Prerequisites',
  lesson1Status: 'Active Lesson',
  lesson1Duration: '12:45',
  lesson1Thumb: '/assets/images/lesson-thumb-1.jpg',

  lesson2Title: '02. Core Theoretical Foundations',
  lesson2Status: 'Next Lesson',
  lesson2Duration: '18:20',
  lesson2Thumb: '/assets/images/lesson-thumb-2.jpg',

  lesson3Title: '03. Building Production Components',
  lesson3Status: 'Upcoming',
  lesson3Duration: '24:10',
  lesson3Thumb: '/assets/images/lesson-thumb-3.jpg',

  lesson4Title: '04. Deployment & Best Practices',
  lesson4Status: 'Upcoming',
  lesson4Duration: '16:30',
  lesson4Thumb: '/assets/images/lesson-thumb-4.jpg',

  // Bottom 4 Features Row
  feat1Title: 'High-Quality Video Lessons',
  feat1Subtitle: 'Learn at your own pace',
  feat1Icon: 'video',

  feat2Title: 'Hands-on Practice Projects',
  feat2Subtitle: 'Build real-world skills',
  feat2Icon: 'code',

  feat3Title: 'Proctored Examinations',
  feat3Subtitle: 'Test your knowledge',
  feat3Icon: 'check',

  feat4Title: 'Verified Certificates',
  feat4Subtitle: 'Earn industry-recognized credentials',
  feat4Icon: 'award',
}
