# Como Adicionar Logos dos Clientes

## Passo 1: Adicione as Imagens Nesta Pasta

Coloque os arquivos de logo dos seus clientes aqui. Por exemplo:

```
public/clientes/
├── artplan.png
├── brb.png
├── global-citizen.png
├── cliente4.png
└── ...
```

## Passo 2: Edite o Componente ClientsCarousel

Abra o arquivo: `components/ClientsCarousel.tsx`

### Substitua este código:

```typescript
const clients = [
  "Cliente 1",
  "Cliente 2",
  "Cliente 3",
  // ...
]
```

### Por este:

```typescript
const clients = [
  { name: "Artplan", logo: "/clientes/artplan.png" },
  { name: "BRB", logo: "/clientes/brb.png" },
  { name: "Global Citizen", logo: "/clientes/global-citizen.png" },
  { name: "Cliente 4", logo: "/clientes/cliente4.png" },
  // Adicione mais clientes aqui
]
```

### E substitua a parte do map:

```typescript
{[...clients, ...clients].map((client, index) => (
  <div
    key={index}
    className="inline-flex items-center justify-center min-w-[200px] h-24 bg-background border border-border rounded-lg px-8"
  >
    <div className="text-lg font-semibold text-muted-foreground">
      {client}
    </div>
  </div>
))}
```

### Por:

```typescript
{[...clients, ...clients].map((client, index) => (
  <div
    key={index}
    className="inline-flex items-center justify-center min-w-[200px] h-24 bg-background border border-border rounded-lg px-8"
  >
    <Image
      src={client.logo}
      alt={client.name}
      width={150}
      height={60}
      className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
    />
  </div>
))}
```

### Adicione o import do Image no topo:

```typescript
import Image from "next/image"
```

## Dicas

- **Formato**: Prefira PNG com fundo transparente ou SVG
- **Tamanho**: Otimize as imagens (max 200KB cada)
- **Dimensões**: Aproximadamente 200-400px de largura
- **Efeito**: As logos ficam em grayscale e ganham cor ao passar o mouse
