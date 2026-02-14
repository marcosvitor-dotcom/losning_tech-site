import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, Brain, Database, LineChart, TrendingUp, Users, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-losning-preta-ZpmO5mp0uBVZ1TlID2uN3MUZDZeMm3.png" 
              alt="Losning Tech" 
              width={120} 
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Solicitar Consultoria
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 text-balance">
              Transformamos dados em decisões, e problemas em soluções inteligentes
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Na Losning Tech, aplicamos expertise em Business Intelligence para simplificar processos complexos e potencializar resultados.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
              Solicitar Consultoria
            </Button>
          </div>
        </div>
      </section>

      {/* A Essência Losning */}
      <section className="py-20 bg-muted/30">
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
                  Não apenas fornecemos tecnologia; entregamos a <strong>resolução de problemas reais</strong> que travam o crescimento do seu negócio. Nossa abordagem combina clareza analítica, inovação tecnológica e foco absoluto em resultados mensuráveis.
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Nossos Serviços
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluções especializadas em Business Intelligence e desenvolvimento tecnológico
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">
                  Consultoria em Business Intelligence
                </h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <LineChart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Dashboards estratégicos personalizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Database className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Extração e análise avançada de insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Governança e qualidade de dados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Treinamento e capacitação de equipes</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">
                  Desenvolvimento de Produtos Inovadores
                </h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                  <span>Soluções proprietárias para nichos específicos</span>
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
                  <span>Destaque: <strong className="text-foreground">Health Mind</strong> - Plataforma para saúde mental</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Diferencial */}
      <section className="py-20 bg-muted/30">
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
                    Liderado por Especialista em BI
                  </h2>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    A Losning Tech conta com a expertise de um <strong className="text-foreground">Head de Business Intelligence</strong>, garantindo que nossas soluções não são apenas técnicas, mas <strong className="text-foreground">estrategicamente orientadas a resultados de alto nível</strong>. Entendemos o negócio, não apenas a tecnologia.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
              Pronto para transformar seus dados em resultados?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Entre em contato e descubra como podemos impulsionar seu negócio
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
              Solicitar Consultoria Gratuita
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <Image 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-losning-preta-ZpmO5mp0uBVZ1TlID2uN3MUZDZeMm3.png" 
                alt="Losning Tech" 
                width={120} 
                height={40}
                className="h-8 w-auto mb-4"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Transformando dados em decisões inteligentes desde 2024.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Contato</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href="mailto:marcos.vitor@losningtech.com" className="hover:text-primary transition-colors">
                    marcos.vitor@losningtech.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href="tel:+5561983730910" className="hover:text-primary transition-colors">
                    (61) 98373-0910
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                  <span>
                    QR 212, Conjunto 13, Casa 05<br />
                    Samambaia Norte, Brasília<br />
                    CEP: 72316-313
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Losning Tech. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
