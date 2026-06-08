export interface Client {
  name: string
  logo: string
  alt: string
}

// Logos disponíveis em /public/clientes. Núcleo de Mídia (SECOM/SG-PR)
// entra quando o arquivo de logo for adicionado.
export const clients: Client[] = [
  { name: "Artplan", logo: "/clientes/logo-artplan.png", alt: "Artplan" },
  { name: "BRB", logo: "/clientes/logo-brb.png", alt: "Banco BRB" },
  { name: "Banco da Amazônia", logo: "/clientes/banco_amazonia.png", alt: "Banco da Amazônia" },
  { name: "SENAI", logo: "/clientes/Logo-SENAI.png", alt: "SENAI" },
  { name: "Nacional Comunicação", logo: "/clientes/logo_nacional.png", alt: "Nacional Comunicação" },
  { name: "W+E Comunicação", logo: "/clientes/W+E_logo.png", alt: "W+E Comunicação" },
  { name: "Binder", logo: "/clientes/binder_logo.webp", alt: "Binder" },
  // Nexus: o arquivo enviado (nexus-logo.png) é a versão BRANCA do logo —
  // some sobre a faixa branca. Basta trocar por uma versão escura/colorida
  // e descomentar a linha abaixo.
  // { name: "Nexus", logo: "/clientes/nexus-logo.png", alt: "Nexus — Pesquisa e Inteligência de Dados" },
]
