# Hero Carousel - Documentação

## ✅ Implementado com Sucesso

Foi adicionado um **carrossel hero profissional** no topo da página, usando as imagens da pasta `public/carroussel/`.

## 🎨 Características

### Imagens do Carrossel
- **Slide 1**: `slide1.jpg` - "Transforme Dados em Decisões Estratégicas"
- **Slide 2**: `slide2.jpg` - "Soluções Tecnológicas Inovadoras"
- **Slide 3**: `slide3.jpg` - "Engenharia de Dados Avançada"

### Funcionalidades

✅ **Autoplay**: Muda automaticamente a cada 5 segundos
✅ **Loop Infinito**: Volta ao primeiro slide após o último
✅ **Navegação**: Setas esquerda/direita para controle manual
✅ **Indicadores**: Bolinhas na parte inferior mostram o slide atual
✅ **Responsivo**: Adapta-se a mobile, tablet e desktop
✅ **Animações**: Texto com fade-in suave ao trocar slides
✅ **Overlay**: Gradient escuro para melhorar legibilidade do texto
✅ **Botão CTA**: "Fale Conosco" em cada slide

## 📱 Tamanhos

- **Desktop**: 700px de altura
- **Mobile**: 600px de altura
- **Largura**: 100% (responsivo)

## 🎯 Posicionamento

O carrossel está logo após o header fixo, substituindo a antiga hero section estática.

## 🎨 Customização

### Alterar Textos dos Slides

Edite o arquivo: `components/HeroCarousel.tsx`

```typescript
const slides = [
  {
    image: "/carroussel/slide1.jpg",
    title: "Seu Título Aqui",
    description: "Sua descrição aqui",
  },
  // ... adicione mais slides
]
```

### Alterar Velocidade do Autoplay

No mesmo arquivo, procure por:

```typescript
plugins: [
  Autoplay({
    delay: 5000, // Altere este valor (em milissegundos)
  }),
]
```

### Adicionar Mais Slides

1. Adicione a imagem em `public/carroussel/`
2. Adicione um novo objeto no array `slides`:

```typescript
{
  image: "/carroussel/slide4.jpg",
  title: "Novo Título",
  description: "Nova descrição",
},
```

### Alterar Altura

No arquivo `components/HeroCarousel.tsx`, procure por:

```typescript
<div className="relative w-full h-[600px] md:h-[700px]">
```

Altere `600px` (mobile) e `700px` (desktop) para os valores desejados.

## 🎬 Animações

### Animações Incluídas

- **fade-in**: Título aparece com fade-in
- **fade-in-delay**: Descrição aparece 0.2s depois
- **fade-in-delay-2**: Botão aparece 0.4s depois

Essas animações estão definidas em `app/globals.css`

## 🔧 Tecnologia

- **Embla Carousel**: Motor do carrossel
- **Embla Autoplay**: Plugin de autoplay
- **Next.js Image**: Otimização automática de imagens
- **Tailwind CSS**: Estilização

## 📦 Arquivos Criados/Modificados

### Novos Arquivos
- `components/HeroCarousel.tsx` - Componente do carrossel

### Arquivos Modificados
- `app/page.tsx` - Importa e usa o HeroCarousel
- `app/globals.css` - Animações CSS
- `package.json` - Adicionado `embla-carousel-autoplay`

## 🚀 Como Testar

```bash
# Limpar cache
rm -rf .next

# Rodar em desenvolvimento
npm run dev

# Abrir no navegador
# http://localhost:3000
```

## 🎯 Resultado

Você verá:
1. Header fixo no topo
2. **Carrossel hero** com 3 slides de imagens em tela cheia
3. Texto sobre cada imagem (título + descrição)
4. Botão "Fale Conosco" em cada slide
5. Setas de navegação nas laterais
6. Indicadores de slide na parte inferior
7. Mudança automática a cada 5 segundos

## 💡 Dicas

### Otimizar Imagens

As imagens são grandes (15MB, 4MB, 10MB). Para melhor performance, considere:

```bash
# Instalar ferramenta de otimização
npm install -g sharp-cli

# Otimizar imagens
sharp -i public/carroussel/slide1.jpg -o public/carroussel/slide1-opt.jpg -q 80 --width 1920

# Depois atualize os caminhos no código
```

### Pausar ao Hover

Para pausar o autoplay quando o mouse estiver sobre o carrossel, adicione em `HeroCarousel.tsx`:

```typescript
plugins: [
  Autoplay({
    delay: 5000,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  }),
]
```

### Adicionar Efeitos de Transição

O Embla Carousel suporta diversos efeitos. Veja a documentação:
https://www.embla-carousel.com/

## ✨ Pronto!

O carrossel hero está funcionando perfeitamente e pronto para produção! 🎉
