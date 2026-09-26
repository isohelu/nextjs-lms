import React from 'react'

export default function Partners({
  title = 'Trusted by over 100 leading companies worldwide',
}: {
  title?: string
}) {
  const logos = [
    '/assets/logos/logo-1.png',
    '/assets/logos/logo-2.png',
    '/assets/logos/logo-3.png',
    '/assets/logos/logo-4.png',
    '/assets/logos/logo-5.png',
    '/assets/logos/logo-6.png',
  ]

  return (
    <section className="container py-20">
      <p className="mb-8 text-center text-muted-foreground">
        {title}
      </p>

      <div className="flex flex-wrap justify-center gap-y-12 md:gap-y-16">
        {logos.map((src, index) => (
          <div
            key={`partner-${index}`}
            className="flex w-6/12 items-center justify-center px-6 md:w-3/12 md:px-8 lg:w-2/12"
          >
            <img src={src} alt="" className="w-full object-contain filter grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all" />
          </div>
        ))}
      </div>
    </section>
  )
}
