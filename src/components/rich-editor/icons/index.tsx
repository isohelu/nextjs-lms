import React from 'react'

export const IconQuote = ({ className, size = 18 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 5a2 2 0 0 1 2 2v6c0 3.13 -1.65 5.193 -4.757 5.97a1 1 0 1 1 -.486 -1.94c2.227 -.557 3.243 -1.827 3.243 -4.03v-1h-3a2 2 0 0 1 -1.995 -1.85l-.005 -.15v-3a2 2 0 0 1 2 -2z" />
    <path d="M18 5a2 2 0 0 1 2 2v6c0 3.13 -1.65 5.193 -4.757 5.97a1 1 0 1 1 -.486 -1.94c2.227 -.557 3.243 -1.827 3.243 -4.03v-1h-3a2 2 0 0 1 -1.995 -1.85l-.005 -.15v-3a2 2 0 0 1 2 -2z" />
  </svg>
)

export const IconTextColor = ({ className, size = 18 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path
      d="M11.1 1.65 4.17 19.25H7.03L8.68 14.96H15.72L17.37 19.25H20.23L13.3 1.65H11.1ZM9.56 12.32 12.2 5.28 14.84 12.32H9.56Z"
      transform="scale(0.9) translate(0.5,0)"
    />
  </svg>
)

export const IconTextHighlight = ({ className, size = 18 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path
      d="M20.9278 11.1274 10.8774 1.0203l-.1521.1504C9.9678.4215 8.9665 0 7.9017 0H7.9008C6.8259 0 5.8155.4189 4.9563 1.1782c-.7618.76-1.1807 1.7703-1.1807 2.8452 0 1.0649.4147 2.0667 1.164 2.8244L2.4378 9.3496c-.3433.3432-.5328.7998-.5328 1.2836 0 .4855.1878.9404.5293 1.2803l5.4518 5.4972c.3424.3424.7983.5302 1.2807.5302.4858 0 .9416-.1895 1.2849-.5336l6.2994-6.2807 4.1767-.0009v.0017ZM5.0038 4.0285c0-.7724.3012-1.499.85-2.0477.547-.5462 1.273-.8279 2.047-.8279h.0009c.7643 0 1.4792.297 2.0246.8313L5.847 6.0651c-.5369-.5443-.8432-1.2684-.8432-2.0366Zm10.0343 7.3047H3.5344l-.208-.2108c-.1291-.128-.1997-.298-.1997-.479 0-.1827.0715-.3527.2014-.4826l7.5323-7.5323 7.3304 7.3864-1.8442.0008-1.3085 1.3175Z"
      strokeWidth="0.3"
      stroke="currentColor"
    />
    <path
      d="M20.2574 13.4086c.3793.5669 1.6379 2.5006 1.6379 3.475 0 1.2034-.979 2.1843-2.1824 2.1843-1.2034 0-2.1824-.979-2.1824-2.1824 0-.9781 1.3012-2.9155 1.6984-3.4844l.5207-.7454.5078.7528Z"
      transform="translate(1,1)"
    />
  </svg>
)

export const IconYoutube = ({ className, size = 18 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" fill="currentColor" />
  </svg>
)
