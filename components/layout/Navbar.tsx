"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

const navLinks = [
  { href: "/bi-dados", label: "BI & Dados" },
  { href: "/health-mind", label: "Health Mind" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/contato", label: "Contato" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "lt-glass-navy" : "bg-transparent"
      )}
    >
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Losning Tech — início">
          <Image
            src="/logo_lt_branca.png"
            alt=""
            width={60}
            height={40}
            priority
            className="h-9 w-auto"
          />
          <span className="font-heading text-lg font-bold leading-none text-white">
            Losning Tech
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/75 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            )
          })}
          <Button asChild variant="light" className="ml-3">
            <Link href="/contato">Fale conosco</Link>
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Menu mobile */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/10 bg-[var(--lt-navy-deep)]/95 backdrop-blur-md transition-[max-height] duration-300 md:hidden",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="container flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild variant="light" fullWidth className="mt-2">
            <Link href="/contato">Fale conosco</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
