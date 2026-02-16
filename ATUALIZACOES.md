# Atualizações do Site Losning Tech

## Resumo das Alterações

O site foi completamente reformulado para uma apresentação mais corporativa e profissional, removendo o foco pessoal e centralizando na empresa.

## Principais Mudanças

### 1. Design e Layout
- ✅ **Background Fixo**: Implementado usando a imagem `background_site.webp` como fundo fixo
- ✅ **Container com Scroll**: Conteúdo principal em container com fundo semitransparente que se move com o scroll
- ✅ **Header Fixo com Animação**: Menu superior que desaparece ao rolar para baixo e reaparece ao rolar para cima
- ✅ **Layout Bootstrap**: Todo o conteúdo organizado com margens laterais (container)

### 2. Componentes Criados

#### Header (`components/Header.tsx`)
- Header fixo no topo
- Desaparece ao rolar para baixo
- Reaparece ao rolar para cima
- Botão "Fale Conosco" que abre o modal

#### ContactModal (`components/ContactModal.tsx`)
- Modal de contato com formulário completo
- Captura de leads com campos:
  - Nome Completo
  - E-mail
  - Telefone
  - Empresa
  - Mensagem
- Notificações toast ao enviar
- Pronto para integração com CRM

#### ProductCarousel (`components/ProductCarousel.tsx`)
- Carrossel de produtos e soluções
- Inclui:
  - Health Mind AI
  - Dashboard Artplan (com link)
  - Dashboard BRB (com link)
  - Dashboard Global Citizen (com link)

#### ClientsCarousel (`components/ClientsCarousel.tsx`)
- Carrossel infinito de logos de clientes
- Scroll automático contínuo
- Preparado para receber logos reais na pasta `public/clientes`

### 3. Conteúdo Atualizado

#### Linguagem Corporativa
- ❌ Removido: Foco em "Head de BI" individual
- ✅ Adicionado: "Equipe especializada em Business Intelligence"
- ✅ Tom profissional e institucional
- ✅ Foco na empresa, não em indivíduos

#### Informações Corporativas no Footer
- **CNPJ**: 61.661.169/0001-87
- **D-U-N-S**: 572593786
- **Telefone**: (61) 98373-0910
- **Site**: www.losningtech.com.br
- **Endereço**: QR 212, Conjunto 13, Samambaia Norte, Brasília - DF, CEP: 72.316-313

#### Seções Adicionadas
1. **Nossos Produtos e Soluções**: Carrossel com produtos principais
2. **Parceiros de Confiança**: Carrossel de clientes (aguardando logos)
3. **Expertise Estratégica**: Destaca a equipe especializada

### 4. Melhorias Técnicas

#### Engenharia de Dados
Adicionado destaque para:
- Trabalho com grandes players de publicidade
- Ferramentas: Supermetrics, Adveronix, Airbyte
- Foco em extração e análise para grandes agências

#### Health Mind AI
Destacado como produto principal com descrição:
"Plataforma inovadora para gestão de saúde mental, combinando tecnologia de ponta com cuidado humanizado"

## Próximos Passos

### 1. Adicionar Logos de Clientes
Adicione os arquivos de logo dos clientes na pasta: `public/clientes/`

Formatos recomendados:
- PNG ou SVG
- Fundo transparente
- Tamanho: 200-300px de largura

Depois, edite o arquivo `components/ClientsCarousel.tsx` para substituir os placeholders pelas imagens reais.

### 2. Integração com CRM
O formulário de contato está preparado para integração. Edite o arquivo `components/ContactModal.tsx` na função `handleSubmit` para integrar com seu CRM preferido.

Opções recomendadas:
- HubSpot
- Salesforce
- RD Station
- Pipedrive

### 3. Analytics
Considere adicionar:
- Google Analytics
- Meta Pixel
- LinkedIn Insight Tag

## Comandos para Testar

```bash
# Instalar dependências (se necessário)
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

## Estrutura de Arquivos Criados/Modificados

```
losning-tech-landing-page/
├── app/
│   ├── layout.tsx          # Adicionado Toaster
│   ├── page.tsx            # Completamente reescrito
│   └── globals.css         # Adicionado background fixo
├── components/
│   ├── Header.tsx          # NOVO
│   ├── ContactModal.tsx    # NOVO
│   ├── ProductCarousel.tsx # NOVO
│   └── ClientsCarousel.tsx # NOVO
└── public/
    ├── background_site.webp # Existente
    └── clientes/           # NOVO - Adicionar logos aqui
```

## Observações Importantes

1. O D-U-N-S foi incluído no footer conforme solicitado
2. Todas as referências pessoais foram removidas
3. O site agora fala em nome da empresa, não de indivíduos
4. Design moderno com animações sutis
5. Totalmente responsivo (mobile, tablet, desktop)
6. Preparado para SEO e conversão de leads

## Suporte

Para dúvidas ou ajustes adicionais, entre em contato através do próprio site! 😉
