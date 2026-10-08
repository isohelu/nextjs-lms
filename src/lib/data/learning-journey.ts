export interface JourneyStep {
  number: string
  stepNumber?: string
  theme: 'purple' | 'blue' | 'orange' | 'green'
  title: string
  description: string
  studentImage?: string
  imageUrl?: string
  floatingCard?: {
    title: string
    fullNamePlaceholder?: string
    emailPlaceholder?: string
    passwordPlaceholder?: string
    buttonText?: string
  }
  searchPlaceholder?: string
  categories?: string[]
  courses?: {
    title: string
    level: string
    image: string
  }[]
  videoLesson?: {
    instructorImage?: string
    duration?: string
  }
  checklist?: string[]
  certificate?: {
    badgeText?: string
    recipientName?: string
    subtitle?: string
    sealText?: string
  }
}

export interface LearningJourneyData {
  badge: string
  title: string
  highlightText: string
  subtitle: string
  badgeText?: string
  titleLine1?: string
  titleLine2?: string
  steps: [JourneyStep, JourneyStep, JourneyStep, JourneyStep]
}

export const DEFAULT_LEARNING_JOURNEY_DATA: LearningJourneyData = {
  badge: 'HOW IT WORKS',
  title: 'Your Learning Journey,',
  highlightText: 'Made Simple.',
  subtitle: 'From signup to certification — everything you need to learn, practice, and grow in one place.',
  steps: [
    {
      number: '01',
      theme: 'purple',
      title: 'Create an Account',
      description: 'Sign up in seconds and create your learning profile to get started.',
      studentImage: '/assets/images/journey-card-1.png',
      floatingCard: {
        title: 'Create Account',
        fullNamePlaceholder: 'Full Name',
        emailPlaceholder: 'Email Address',
        passwordPlaceholder: 'Password',
        buttonText: 'Sign Up',
      },
    },
    {
      number: '02',
      theme: 'blue',
      title: 'Choose a Course',
      description: 'Explore a wide range of courses and pick the one that fits your goals.',
      studentImage: '/assets/images/journey-card-2.png',
      searchPlaceholder: 'Search for courses...',
      categories: ['All', 'Development', 'Design', 'Marketing'],
      courses: [
        {
          title: 'Web Development with Laravel',
          level: 'Beginner',
          image: '/assets/images/hero-student-cinema.jpg',
        },
        {
          title: 'UI/UX Design Fundamentals',
          level: 'Intermediate',
          image: '/assets/images/students-2.jpg',
        },
        {
          title: 'Digital Marketing Masterclass',
          level: 'Beginner',
          image: '/assets/images/students-3.jpg',
        },
      ],
    },
    {
      number: '03',
      theme: 'orange',
      title: 'Learn at Your Own Pace',
      description: 'Watch video lessons, follow real-world projects, and gain hands-on experience.',
      studentImage: '/assets/images/journey-card-3.png',
      videoLesson: {
        instructorImage: '/assets/images/hero-mentor-instructor.png',
        duration: '12:36 / 28:10',
      },
      checklist: [
        'Video Lessons',
        'Practice Projects',
        'Quizzes',
        'Community Support',
      ],
    },
    {
      number: '04',
      theme: 'green',
      title: 'Get Certified',
      description: 'Complete the course, showcase your skills, and earn a verified certificate.',
      studentImage: '/assets/images/journey-card-4.png',
      certificate: {
        badgeText: 'Certificate of Completion',
        recipientName: 'Sarah Jenkins',
        subtitle: 'has successfully completed all milestones',
        sealText: 'Verified Standard',
      },
    },
  ],
}
