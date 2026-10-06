"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, Home, LineChart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/", label: "Today", icon: Home },
  { href: "/learn/", label: "Learn", icon: BookOpen },
  { href: "/practice/", label: "Practice", icon: ClipboardList },
  { href: "/progress/", label: "Progress", icon: LineChart },
];

const MORE = [
  { href: "/about/", label: "About" },
  { href: "/requirements/", label: "Requirements" },
  { href: "/sources/", label: "Sources" },
  { href: "/reference/", label: "Reference" },
  { href: "/settings/", label: "Settings" },
  { href: "/maintainer/", label: "Content workshop" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border/80 bg-sidebar px-3 py-6 md:flex">
          <Link href="/" className="mb-8 px-2 font-heading text-xl tracking-tight text-navy">
            Mammo
          </Link>
          <nav aria-label="Primary" className="flex flex-1 flex-col gap-1">
            {PRIMARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive(pathname, item.href) ? "bg-teal/15 text-navy" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t pt-4">
            {MORE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-10 items-center rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
            <Link href="/" className="font-heading text-lg text-navy">
              Mammo
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="More pages" />
                }
              >
                <Menu />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {MORE.map((item) => (
                  <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
            {children}
          </main>
        </div>
      </div>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive(pathname, item.href) ? "text-teal" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
