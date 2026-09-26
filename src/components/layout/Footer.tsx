import React from 'react'
import Link from 'next/link'
import AppLogo from '@/components/common/AppLogo'
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
} from '@/components/common/SocialIcons'

export default function Footer() {
  const companyLinks = [
    { title: 'About Us', url: '/about-us' },
    { title: 'Our Team', url: '/our-team' },
    { title: 'Verify Certificate', url: '/verify-certificate' },
    { title: 'Careers', url: '/careers' },
    { title: 'Contact Us', url: '/contact-us' },
  ]

  const legalLinks = [
    { title: 'Cookie Policy', url: '/cookie-policy' },
    { title: 'Terms & Conditions', url: '/terms-and-conditions' },
    { title: 'Privacy Policy', url: '/privacy-policy' },
    { title: 'Refund Policy', url: '/refund-policy' },
  ]

  const addressItems = [
    'Corner view Subudbazar, Sylhet, Bangladesh.',
    'Email: uilib@gmail.com',
    'Phone: +880 1123 456 780',
  ]

  const socialLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com/', icon: FacebookIcon },
    { name: 'Twitter', url: 'https://www.twitter.com/', icon: TwitterIcon },
    { name: 'Instagram', url: 'https://www.instagram.com/', icon: InstagramIcon },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/', icon: LinkedinIcon },
  ]

  const paymentMethods = [
    { name: 'Stripe', image: '/assets/payment/stripe.png' },
    { name: 'PayPal', image: '/assets/payment/paypal.png' },
    { name: 'Mollie', image: '/assets/payment/mollie.png' },
    { name: 'Paystack', image: '/assets/payment/paystack.png' },
  ]

  return (
    <footer className="overflow-hidden bg-[rgba(255,222,99,0.06)]">
      <div className="container space-y-9 pt-15 pb-5">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          {/* Logo & Description Column */}
          <div className="w-full space-y-5 md:max-w-75">
            <div>
              <Link href="/">
                <AppLogo className="h-7" />
              </Link>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Transform your learning journey with Mentor LMS - a comprehensive online
              learning platform connecting expert instructors with passionate learners.
              Discover courses, build skills, and achieve your goals.
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex w-full flex-col justify-between gap-10 md:max-w-160 md:flex-row">
            {/* Company */}
            <div className="relative w-full">
              <p className="mb-3 text-lg font-semibold">Company</p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                {companyLinks.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.url}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Policies */}
            <div className="relative w-full">
              <p className="mb-3 text-lg font-semibold">Legal & Policies</p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                {legalLinks.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.url}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Address */}
            <div className="relative w-full">
              <p className="mb-3 text-lg font-semibold">Address</p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                {addressItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="text-base font-medium">
            We support multiple payment gateways.
          </h3>
          <div className="flex flex-wrap gap-3">
            {paymentMethods.map((payment, idx) => (
              <div
                key={idx}
                className="flex h-7 items-center justify-center gap-5 md:justify-start"
              >
                <img
                  src={payment.image}
                  alt={payment.name}
                  className="h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          © Copyright 2025 UI Lib, All rights reserved.
        </p>
      </div>
    </footer>
  )
}
