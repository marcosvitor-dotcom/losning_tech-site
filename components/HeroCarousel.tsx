"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

interface HeroCarouselProps {
  onContactClick: () => void
}

const slides = [
  {
    image: "/carroussel/slide1.jpg",
    title: "Transforme Dados em Decisões Estratégicas",
    description: "Business Intelligence de ponta para empresas que buscam excelência",
  },
  {
    image: "/carroussel/slide2.jpg",
    title: "Soluções Tecnológicas Inovadoras",
    description: "Desenvolvimento de produtos que revolucionam o mercado",
  },
  {
    image: "/carroussel/slide3.jpg",
    title: "Engenharia de Dados Avançada",
    description: "Extração e análise para grandes players de publicidade",
  },
]

export function HeroCarousel({ onContactClick }: HeroCarouselProps) {
  const [api, setApi] = useState<any>()

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full h-[600px] md:h-[700px]">
                {/* Imagem de fundo */}
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  {/* Overlay escuro para melhorar legibilidade */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                </div>

                {/* Conteúdo */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                      <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                        {slide.title}
                      </h2>
                      <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-delay">
                        {slide.description}
                      </p>
                      <Button
                        size="lg"
                        onClick={onContactClick}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 animate-fade-in-delay-2"
                      >
                        Fale Conosco
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>

      {/* Indicadores de slide */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              api?.selectedScrollSnap() === index
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
