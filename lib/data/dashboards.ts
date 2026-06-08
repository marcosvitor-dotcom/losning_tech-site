export interface Dashboard {
  slug: string
  title: string
  client: string
  url: string
  thumb: string
  tags: string[]
  description: string
}

export const dashboards: Dashboard[] = [
  {
    slug: "porsche-completo",
    title: "Dashboard de Performance — Completo",
    client: "Case Porsche",
    url: "https://dashboard-porsche.vercel.app/",
    thumb: "/portfolio/porsche-completo.png",
    tags: ["BI", "Multi-canal", "Criativos", "Mídia Offline", "Exportação PDF"],
    description:
      "Painel enterprise com 16+ páginas temáticas: visão geral, linha do tempo, performance por plataforma (Meta, TikTok, Google, LinkedIn, Pinterest, Kwai), análise de criativos, dados orgânicos, Google Search e veiculação offline. Consolida todas as fontes de mídia em uma única narrativa de dados.",
  },
  {
    slug: "porsche-simples",
    title: "Dashboard Executivo — Resumido",
    client: "Case Porsche",
    url: "https://dashboard-porsche-simples.vercel.app/",
    thumb: "/portfolio/porsche-simples.png",
    tags: ["BI", "Big Numbers", "Benchmark", "Tempo real"],
    description:
      "Versão executiva e direta ao ponto: big numbers animados, comparação com benchmark e período anterior, filtros inteligentes por veículo, campanha e período. Foco em leitura rápida das métricas de mídia (investimento, impressões, VTR, engajamento, CTR).",
  },
]

export interface OnDemandService {
  title: string
}

export const onDemandServices: OnDemandService[] = [
  { title: "Sites institucionais" },
  { title: "Landing Pages" },
  { title: "Blogs" },
  { title: "Sistemas internos" },
  { title: "Aplicativos, portais e plataformas" },
  { title: "Automações personalizadas" },
  { title: "Integrações via API" },
  { title: "Soluções com IA" },
]
