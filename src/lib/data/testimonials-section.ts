export interface TestimonialCardItem {
  id: string
  name: string
  role: string
  location: string
  avatar: string
  quote: string
  rating: number
}

export interface TestimonialsSectionData {
  // Section Header
  badgeText: string
  title: string
  description: string

  // Rating Overlay Card (Hover state on all cards)
  ratingScore: string
  ratingMax: string
  ratingLabel: string
  ratingStars: number
  studentsCount: string
  studentsLabel: string
  ratingAvatars: string[]

  // Hover Interaction
  hoverRatingEnabled: boolean

  // Testimonial Cards
  cards: TestimonialCardItem[]
}

export const DEFAULT_TESTIMONIALS_DATA: TestimonialsSectionData = {
  badgeText: 'STUDENT SUCCESS',
  title: 'Trusted by Learners Worldwide',
  description:
    'Real stories from students who gained new skills, advanced their careers, and achieved their goals with our platform.',

  ratingScore: '4.9',
  ratingMax: '/ 5.0',
  ratingLabel: 'Average Rating',
  ratingStars: 5,
  studentsCount: '15K+',
  studentsLabel: 'Trusted Students',
  ratingAvatars: [
    '/assets/images/student-sarah-ahmed.jpg',
    '/assets/images/student-david-toronto.jpg',
    '/assets/images/student-pamela-phoenix.jpg',
  ],

  hoverRatingEnabled: true,

  cards: [
    {
      id: 'sarah-ahmed',
      name: 'Sarah Ahmed',
      role: 'Product Designer',
      location: 'Dhaka, Bangladesh',
      avatar: '/assets/images/student-sarah-ahmed.jpg',
      quote:
        'The course content is crystal clear and the hands-on projects made learning so much easier. I was able to apply the skills at my workplace immediately.',
      rating: 5,
    },
    {
      id: 'david-miller',
      name: 'David Miller',
      role: 'Software Engineer',
      location: 'Toronto, Canada',
      avatar: '/assets/images/student-david-toronto.jpg',
      quote:
        'I was skeptical at first, but within 3 minutes I had real quotes from big-name companies. I picked one and had coverage the same day. Total game-changer.',
      rating: 5,
    },
    {
      id: 'pamela-mollica',
      name: 'Pamela Mollica',
      role: 'UX Researcher',
      location: 'Phoenix, USA',
      avatar: '/assets/images/student-pamela-phoenix.jpg',
      quote:
        "The process was fast, the options were clear, and I actually understood what I was buying. No pressure, just honest help. I've already recommended it to my brother.",
      rating: 5,
    },
    {
      id: 'alex-morgan',
      name: 'Alex Morgan',
      role: 'Full-Stack Developer',
      location: 'Berlin, Germany',
      avatar: '/assets/images/student-alex-berlin.jpg',
      quote:
        'The structured curriculum and real-world project code-reviews directly prepared me for production. I landed my dream job within 2 months of graduating.',
      rating: 5,
    },
    {
      id: 'marcus-chen',
      name: 'Marcus Chen',
      role: 'Cloud Architect',
      location: 'Singapore',
      avatar: '/assets/images/students-1.jpg',
      quote:
        'The multi-cloud architecture modules were comprehensive and up-to-date with 2026 industry standards. Highly recommended for any engineer leveling up.',
      rating: 5,
    },
    {
      id: 'elena-rostova',
      name: 'Elena Rostova',
      role: 'Staff AI Engineer',
      location: 'Zurich, Switzerland',
      avatar: '/assets/images/students-2.jpg',
      quote:
        'The depth of the AI engineering track exceeded my expectations. Real evaluation metrics and LLM fine-tuning techniques I now use daily in production.',
      rating: 5,
    },
  ],
}
