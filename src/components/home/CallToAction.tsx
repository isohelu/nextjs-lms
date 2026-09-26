'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function CallToAction() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const avatars = [
    { name: 'User 1', image: '/assets/avatars/avatar-1.png' },
    { name: 'User 2', image: '/assets/avatars/avatar-2.png' },
    { name: 'User 3', image: '/assets/avatars/avatar-3.png' },
    { name: 'User 4', image: '/assets/avatars/avatar-4.png' },
    { name: 'User 5', image: '/assets/avatars/avatar-5.png' },
  ]

  return (
    <div className="bg-secondary-100er py-20">
      <section className="container bg-[rgba(0,114,98,1)] rounded-4xl">
        <div className="text-white text-center space-y-5 px-6 py-14 bg-[url('/assets/images/intro/home-1/cta-bg-vector.png')] bg-cover bg-center">
          <h1 className="text-2xl leading-tight font-bold md:text-3xl md:leading-9">
            Subscribe Our Newsletter
          </h1>

          <div className="mx-auto w-full max-w-105 text-center">
            <p className="mb-3 text-white/90 text-sm">
              Subscribe to our newsletter to get latest courses and discounts.
            </p>

            {subscribed ? (
              <div className="rounded-lg bg-white/20 p-3 text-sm font-semibold text-white">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="flex items-center justify-between rounded-lg border border-gray-400 bg-background text-foreground overflow-hidden">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12.5 w-full px-4 text-sm text-foreground focus:outline-0 bg-transparent"
                    placeholder="name@example.com"
                  />
                  <Button type="submit" className="mr-0.75 h-11 rounded-lg px-6 font-medium">
                    Subscribe
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
              {avatars.map((item, index) => (
                <Avatar key={index} className="h-8 w-8">
                  <AvatarImage
                    src={item.image}
                    alt={item.name}
                    className="object-cover"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="font-medium text-sm text-white/95">
              +2000 readers worldwide
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
