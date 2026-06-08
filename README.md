# Losning Tech — Site Institucional

Site institucional da **Losning Tech**, refletindo as duas vertentes da empresa:

- **BI & Engenharia de Dados** — dashboards, automação de relatórios e pipelines para agências e veículos de mídia.
- **Health Mind** — sistema completo (SaaS) para psicologia, produto próprio.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS 3** + design system próprio (`lt-*`)
- **Framer Motion** (animações de scroll / stagger)
- **Radix UI** (Dialog) + **Lucide** (ícones)
- **Mongoose / MongoDB** (captura de leads)
- **React Hook Form + Zod** + **Sonner** (formulário e toasts)

## Estrutura

```
app/
  page.tsx            # Home institucional
  bi-dados/           # Vertente BI & Engenharia de Dados
  health-mind/        # Produto Health Mind
  portfolio/          # Dashboards no ar + projetos sob demanda
  contato/            # Formulário + dados corporativos
  api/leads/          # POST cria lead no MongoDB / GET protegido
  sitemap.ts robots.ts
components/
  layout/   (Navbar, Footer)
  sections/ (Hero, StatsBand, ServicesSplit, PainPoints, Pillars, ...)
  ui/       (Button, SectionHeading)
  motion/   (Reveal, GlowBlob)
  portfolio/(DashboardCard — preview ao vivo via iframe)
  forms/    (ContactForm)
lib/
  mongodb.ts models/Lead.ts utils.ts motion.ts
  data/     (company, clients, dashboards)
public/
  clientes/ (logos de parceiros)  portfolio/ (screenshots dos dashboards)
```

## Design system

Paleta híbrida: base **azul-marinho** da marca BI + **teal** como acento conector + elegância do Health Mind (Playfair Display + Inter, gradientes, glassmorphism). Tokens em `app/globals.css` (`--lt-*`) e `tailwind.config.ts`.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha MONGODB_URI
npm run dev                  # http://localhost:3000
```

### Variáveis de ambiente

| Variável      | Descrição                                              |
| ------------- | ------------------------------------------------------ |
| `MONGODB_URI` | Conexão MongoDB Atlas (banco `losning_crm`, leads). |

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm start` — servidor de produção
- `npm run lint` — lint

## Notas

- Os thumbnails em `public/portfolio/` são capturas reais dos dashboards Porsche publicados. Para atualizá-los, recapture as URLs e substitua os PNGs.
- Logos de parceiros adicionais citados na apresentação comercial (Banco da Amazônia, Nexus, W+E, Núcleo de Mídia) podem ser adicionados em `public/clientes/` e registrados em `lib/data/clients.ts`.
- Deploy recomendado: **Vercel** (defina `MONGODB_URI` nas variáveis de ambiente do projeto).
