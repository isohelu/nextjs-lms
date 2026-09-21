import React from 'react'

export default function Partners() {
  const logos = [
    '/assets/logos/logo-1.png',
    '/assets/logos/logo-2.png',
    '/assets/logos/logo-3.png',
    '/assets/logos/logo-4.png',
    '/assets/logos/logo-5.png',
    '/assets/logos/logo-6.png',
  ]

  return (
    <section className="border-y border-border/40 bg-muted/20 py-16">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trusted by over 100 leading companies worldwide
        </p>

        <div className="grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((src, index) => (
            <div
              key={index}
              className="flex h-12 w-full max-w-[140px] items-center justify-center filter grayscale opacity-60 transition-all duration-200 hover:grayscale-0 hover:opacity-100"
            >
              <img
                src={src}
                alt={`Partner company ${index + 1}`}
                className="max-h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
