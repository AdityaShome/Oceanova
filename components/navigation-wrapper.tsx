"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import type { PropsWithChildren } from "react"

const HIDE_NAV_PATHS = new Set(["/auth/login", "/auth/register", "/try"]) as Set<string>

export function NavigationWrapper({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const shouldHide = pathname ? HIDE_NAV_PATHS.has(pathname) : false

  if (shouldHide) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation />
      <div className="h-24" />
      {children}
    </>
  )
}


