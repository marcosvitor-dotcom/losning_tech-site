"use client"

import { useEffect, useRef } from "react"

// Placeholder para logos dos clientes - você adicionará as logos reais depois
const clients = [
  "Cliente 1",
  "Cliente 2",
  "Cliente 3",
  "Cliente 4",
  "Cliente 5",
  "Cliente 6",
  "Cliente 7",
  "Cliente 8",
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
            <div className="text-lg font-semibold text-muted-foreground">
              {client}
            </div>
            {/* Substitua isso por <Image> quando adicionar as logos reais */}
          </div>
        ))}
      </div>
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>
          As logos dos clientes serão adicionadas na pasta{" "}
          <code className="bg-muted px-2 py-1 rounded">public/clientes</code>
        </p>
      </div>
    </div>
  )
}
