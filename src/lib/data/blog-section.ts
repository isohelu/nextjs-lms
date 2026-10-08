export interface BlogCardItem {
  id: string
  title: string
  slug: string
  category: string
  image: string
}

export interface BlogSectionData {
  titleLine1: string
  titleLine2: string
  description: string
  buttonText: string
  buttonUrl: string
  blogs: BlogCardItem[]
}

export const DEFAULT_BLOG_SECTION_DATA: BlogSectionData = {
  titleLine1: 'OUR LATEST BLOG',
  titleLine2: 'UPDATE',
  description: 'Stay informed with our latest blog update featuring expert insights!',
  buttonText: 'Browse All',
  buttonUrl: '/blogs',
  blogs: [
    {
      id: 'design-trends',
      title: 'Top Web Design Trends to Watch in 2024',
      slug: 'top-web-design-trends-to-watch',
      category: 'Design',
      image: '/assets/images/blog-web-design-trends.jpg',
    },
    {
      id: 'essential-tools',
      title: '10 Essential Tools for Web Developers in 2024',
      slug: '10-essential-tools-for-web-developers',
      category: 'Development',
      image: '/assets/images/blog-essential-dev-tools.jpg',
    },
    {
      id: '5g-tech',
      title: 'The Impact of 5G Technology: Transforming Connectivity and IoT',
      slug: 'the-impact-of-5g-technology-transforming-connectivity-iot',
      category: 'Technology',
      image: '/assets/images/blog-5g-technology-iot.jpg',
    },
    {
      id: 'sports-nutrition',
      title: 'The Impact of Sports Nutrition: Fueling Athletes for Optimal Performance',
      slug: 'impact-of-sports-nutrition-fueling-athletes',
      category: 'Sports',
      image: '/assets/images/blog-sports-nutrition-athletes.jpg',
    },
    {
      id: 'sustainable-economy',
      title: 'Sustainable Economic Development: Balancing Growth and Environment',
      slug: 'sustainable-economic-development-balancing-growth-environment',
      category: 'Economy',
      image: '/assets/images/blog-sustainable-economic-growth.jpg',
    },
  ],
}
