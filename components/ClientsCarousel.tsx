"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"


const clients = [
  { name: "Artplan", logo: "/clientes/logo-artplan.png" },
  { name: "BRB", logo: "/clientes/logo-brb.png" },
  { name: "Senai", logo: "/clientes/Logo-SENAI.png" },
  { name: "Nacional", logo: "/clientes/logo_nacional.png" },
  { name: "Binder", logo: "/clientes/binder_logo.webp" }
]

export function ClientsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollAmount = 0
    const scrollSpeed = 1

    const scroll = () => {
      scrollAmount += scrollSpeed
      if (scrollContainer.scrollWidth && scrollAmount >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0
      }
      scrollContainer.scrollLeft = scrollAmount
    }

    const intervalId = setInterval(scroll, 30)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="w-full overflow-hidden bg-muted/30 py-12">
      <div className="container mx-auto px-4 mb-8">
        <h3 className="text-2xl font-bold text-center">
          Parceiros de Confiança
        </h3>
        <p className="text-center text-muted-foreground mt-2">
          Trabalhamos com grandes players de publicidade e empresas de destaque
        </p>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-12 overflow-hidden whitespace-nowrap"
        style={{ scrollBehavior: "auto" }}
      >
        {/* Duplicamos os itens para criar o efeito infinito */}
          {[...clients, ...clients].map((client, index) => (
            <div
              key={index}
              className="inline-flex items-center justify-center min-w-[200px] h-24 bg-background border border-border rounded-lg px-8"
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={150}
                height={60}
                className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
      </div>
    </div>
  )
}
