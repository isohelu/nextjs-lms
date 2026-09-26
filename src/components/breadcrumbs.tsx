'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

export interface BreadcrumbItemType {
  title: string
  href?: string
}

export interface BreadcrumbsProps {
  title: string
  breadcrumbs?: BreadcrumbItemType[]
  action?: React.ReactNode
  className?: string
}

export default function Breadcrumbs(props: BreadcrumbsProps) {
  const { title, breadcrumbs = [], action, className } = props

  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="space-y-1.5">
        {title && (
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        )}

        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1

                return (
                  <Fragment key={`breadcrumbs-${index}`}>
                    <BreadcrumbItem>
                      {isLast || !item.href ? (
                        <BreadcrumbPage className="text-sm capitalize text-muted-foreground font-normal">
                          {item.title}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link
                            href={item.href}
                            className="text-sm capitalize hover:text-foreground text-muted-foreground"
                          >
                            {item.title}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator key={`separator-${index}`} />
                    )}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {action}
    </div>
  )
}
