"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { ContactModal } from "@/components/ContactModal"
import { HeroCarousel } from "@/components/HeroCarousel"
import { ProductCarousel } from "@/components/ProductCarousel"
import { ClientsCarousel } from "@/components/ClientsCarousel"
import { BarChart3, Brain, Database, LineChart, TrendingUp, Users, Mail, Phone, MapPin, Building2 } from "lucide-react"
import Image from "next/image"

export default function Page() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Header onContactClick={() => setIsContactModalOpen(true)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

      {/* Main Content Container - centro com gradiente nas bordas */}
      <div className="content-container">
        {/* Spacer for fixed header */}
        <div className="h-16"></div>

        {/* Hero Carousel */}
        <HeroCarousel onContactClick={() => setIsContactModalOpen(true)} />

        {/* Products Carousel */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Nossos Produtos e Soluções
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Desenvolvemos produtos inovadores e dashboards estratégicos para diversos setores
              </p>
            </div>
            <ProductCarousel />
          </div>
        </section>

        {/* A Essência Losning */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                  A Essência <span className="text-primary">Losning</span>
                </h2>
                <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-lg leading-relaxed text-foreground mb-4">
                    <strong className="text-primary">Losning</strong> significa <em>&ldquo;Solução&rdquo;</em> em escandinavo, e é exatamente isso que entregamos.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Nossa equipe combina expertise técnica com visão estratégica, entregando soluções que resolvem problemas reais e impulsionam o crescimento do seu negócio através de clareza analítica, inovação tecnológica e foco em resultados mensuráveis.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full border-4 border-primary/20 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-24 h-24 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Nossos Serviços
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Soluções completas em Business Intelligence e desenvolvimento tecnológico
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-3">
                    Business Intelligence
                  </h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <LineChart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>Dashboards estratégicos personalizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>Engenharia de dados avançada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>Extração e análise de insights estratégicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>Consultoria e capacitação de equipes</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Trabalhamos com grandes players de publicidade, utilizando ferramentas como <strong>Supermetrics</strong>, <strong>Adveronix</strong> e <strong>Airbyte</strong> para extração e análise de dados de grandes agências e clientes corporativos.
                  </p>
                </div>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-3">
                    Desenvolvimento de Produtos
                  </h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                    <span>Soluções proprietárias e inovadoras</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                    <span>Plataformas web modernas e escaláveis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                    <span>Integração de sistemas e automação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                    <span>Aplicações com inteligência artificial</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Destaque: <strong className="text-foreground">Health Mind AI</strong> - Nossa plataforma inovadora para gestão de saúde mental, combinando tecnologia de ponta com cuidado humanizado.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Clients Carousel */}
        <ClientsCarousel />

        {/* Diferencial Corporativo */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 md:p-12 border-2 border-primary/20">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                      Expertise Estratégica em Business Intelligence
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      A Losning Tech conta com uma <strong className="text-foreground">equipe especializada em Business Intelligence</strong>, garantindo que nossas soluções sejam tecnicamente robustas e <strong className="text-foreground">estrategicamente orientadas a resultados de alto impacto</strong>. Entendemos profundamente o seu negócio, não apenas a tecnologia.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                Pronto para transformar seus dados em resultados?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Entre em contato e descubra como podemos impulsionar seu negócio com soluções inteligentes
              </p>
              <Button
                size="lg"
                onClick={() => setIsContactModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
              >
                Solicitar Consultoria
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 border-t border-border py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
              <div>
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-losning-preta-ZpmO5mp0uBVZ1TlID2uN3MUZDZeMm3.png"
                  alt="Losning Tech"
                  width={120}
                  height={40}
                  className="h-8 w-auto mb-4"
                />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Transformando dados em decisões inteligentes.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">CNPJ:</strong> 61.661.169/0001-87
                  </p>
                  <p>
                    <strong className="text-foreground">D-U-N-S:</strong> 572593786
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Endereço
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span>
                      QR 212, Conjunto 13<br />
                      Samambaia Norte<br />
                      Brasília - DF<br />
                      CEP: 72.316-313
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4">Contato</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                    <a href="mailto:contato@losningtech.com.br" className="hover:text-primary transition-colors">
                      contato@losningtech.com.br
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                    <a href="tel:+5561983730910" className="hover:text-primary transition-colors">
                      (61) 98373-0910
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                    <a href="https://www.losningtech.com.br" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                      www.losningtech.com.br
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Losning Tech. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function Globe({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}
