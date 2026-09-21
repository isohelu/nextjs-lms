export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const defaultFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Do I need any prior experience to take your courses?',
    answer:
      "Not at all! Our courses are designed for learners of all levels. Whether you're a complete beginner or looking to sharpen existing skills, you'll find step-by-step guidance to help you progress with confidence.",
  },
  {
    id: 'faq-2',
    question: 'How long do I have access to the course materials?',
    answer:
      'Once enrolled, you have lifetime access to all course materials, code repositories, and updates. You can learn at your own pace and revisit content whenever you need a refresher.',
  },
  {
    id: 'faq-3',
    question: 'Will I get a certificate after completing a course?',
    answer:
      "Yes! Upon successful completion of a course, you'll receive a verified certificate of completion that you can share on your LinkedIn profile, portfolio, or resume.",
  },
  {
    id: 'faq-4',
    question: 'Can I ask questions or get support during the course?',
    answer:
      'Absolutely! Each course includes an interactive discussion forum where you can ask questions, share insights, and connect with instructors and peers.',
  },
  {
    id: 'faq-5',
    question: "What if I'm not satisfied with the course?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not completely satisfied with your purchase, you can request a full refund within 30 days of enrollment without questions.",
  },
]
