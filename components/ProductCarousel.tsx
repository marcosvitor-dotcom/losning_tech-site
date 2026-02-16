"use client"

import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

const products = [
  {
    title: "Health Mind AI",
    description: "Plataforma inovadora para gestão de saúde mental com inteligência artificial",
    category: "Saúde Mental",
    image: "/products/health-mind.jpg",
  },
  {
    title: "Dashboard Artplan",
    description: "Analytics avançado para gestão de campanhas publicitárias",
    category: "Publicidade",
    link: "https://dashboard-artplan.vercel.app/",
  },
  {
    title: "Dashboard BRB",
    description: "Inteligência de negócios para instituições financeiras",
    category: "Financeiro",
    link: "https://dashboard-brb.vercel.app/",
  },
  {
    title: "Dashboard Global Citizen",
    description: "Análise de dados para impacto social global",
    category: "Social",
    link: "https://dashboard-global-citizen.vercel.app/",
  },
]

export function ProductCarousel() {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-5xl mx-auto"
    >
      <CarouselContent>
        {products.map((product, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <Card className="p-6 h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {product.category}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg">{product.title}</h3>
                    {product.link && (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
