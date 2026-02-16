# Losning Tech - Site Institucional

Site corporativo da Losning Tech, empresa especializada em Business Intelligence e desenvolvimento de soluções tecnológicas inovadoras.

## 🚀 Tecnologias

- **Next.js 16** - Framework React para produção
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **Embla Carousel** - Carrosséis

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

O site estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
losning-tech-landing-page/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página inicial
│   └── globals.css         # Estilos globais
├── components/
│   ├── Header.tsx          # Cabeçalho fixo com animação
│   ├── ContactModal.tsx    # Modal de contato/lead
│   ├── ProductCarousel.tsx # Carrossel de produtos
│   ├── ClientsCarousel.tsx # Carrossel de clientes
│   └── ui/                 # Componentes base (shadcn/ui)
├── public/
│   ├── background_site.webp  # Background fixo
│   └── clientes/             # Logos dos clientes
└── ...
```

## ✨ Funcionalidades

### 1. Design Moderno
- Background fixo com container scrollável
- Header que desaparece/aparece no scroll
- Animações suaves
- Totalmente responsivo

### 2. Captura de Leads
- Modal de contato integrado
- Formulário completo (nome, email, telefone, empresa, mensagem)
- Pronto para integração com CRM

### 3. Showcase de Produtos
- Carrossel de produtos e soluções
- Links para dashboards demo
- Destaque para Health Mind AI

### 4. Carrossel de Clientes
- Scroll infinito automático
- Preparado para logos de grandes clientes

### 5. Conteúdo Corporativo
- Linguagem profissional
- Foco institucional (empresa, não pessoas)
- Informações completas no footer (CNPJ, D-U-N-S, endereço)

## 🔧 Configuração

### 1. Adicionar Logos de Clientes

Veja instruções completas em: `public/clientes/README.md`

1. Adicione as logos em `public/clientes/`
2. Edite `components/ClientsCarousel.tsx`
3. Configure o array de clientes com as imagens

### 2. Integrar CRM

Veja guia completo em: `CRM_INTEGRATION.md`

1. Escolha seu CRM (HubSpot, Salesforce, etc.)
2. Crie uma API route em `app/api/leads/route.ts`
3. Configure as variáveis de ambiente

```bash
# Copie o exemplo
cp .env.example .env.local

# Edite com suas chaves
# .env.local
```

### 3. Analytics (Opcional)

Adicione seus tracking IDs em `.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789
```

## 📊 Informações Corporativas

- **Empresa**: Losning Tech
- **CNPJ**: 61.661.169/0001-87
- **D-U-N-S**: 572593786
- **Telefone**: (61) 98373-0910
- **Site**: www.losningtech.com.br
- **Endereço**: QR 212, Conjunto 13, Samambaia Norte, Brasília - DF, CEP: 72.316-313

## 🎨 Customização

### Cores

Edite as cores no arquivo `app/globals.css` na seção `:root`:

```css
--primary: 210 75% 58%;  /* Azul principal */
--foreground: 220 15% 20%; /* Texto */
--background: 0 0% 100%; /* Fundo */
```

### Fontes

As fontes são configuradas em `app/layout.tsx`:
- **Inter**: Texto geral
- **Space Grotesk**: Headings

## 📝 Atualizações Recentes

Veja o changelog completo em: `ATUALIZACOES.md`

## 🚢 Deploy

### Vercel (Recomendado)

```bash
# Deploy automático ao fazer push para main
git push origin main
```

Ou use o Vercel CLI:

```bash
npm install -g vercel
vercel
```

### Outras Plataformas

- **Netlify**: Configure o build command como `npm run build`
- **AWS Amplify**: Use o adaptador do Next.js
- **Docker**: Crie um Dockerfile com Node.js

## 📄 Licença

© 2025 Losning Tech. Todos os direitos reservados.

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato:
- Email: contato@losningtech.com.br
- Telefone: (61) 98373-0910
