# Integração com CRM - Guia Rápido

## Onde Integrar

O formulário de contato está no arquivo: `components/ContactModal.tsx`

Procure pela função `handleSubmit` (linha ~27):

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  // Simulação de envio - aqui você integraria com seu CRM
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log("Lead capturado:", formData)

  toast.success("Mensagem enviada com sucesso!", {
    description: "Entraremos em contato em breve.",
  })

  setFormData({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })
  setIsSubmitting(false)
  onClose()
}
```

## Opções de Integração

### 1. API Route (Recomendado)

Crie um arquivo: `app/api/leads/route.ts`

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Integre aqui com seu CRM
    // Exemplo: HubSpot, Salesforce, etc.

    // Exemplo com fetch para API externa
    const response = await fetch('https://seu-crm.com/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRM_API_KEY}`
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message
      })
    })

    if (!response.ok) {
      throw new Error('Falha ao enviar lead')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
```

Depois, atualize o `handleSubmit` em `ContactModal.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar')
    }

    toast.success("Mensagem enviada com sucesso!", {
      description: "Entraremos em contato em breve.",
    })

    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    })
    onClose()
  } catch (error) {
    toast.error("Erro ao enviar mensagem", {
      description: "Por favor, tente novamente.",
    })
  } finally {
    setIsSubmitting(false)
  }
}
```

### 2. HubSpot (Exemplo)

```bash
npm install @hubspot/api-client
```

Crie `.env.local`:
```
HUBSPOT_API_KEY=your_api_key_here
```

Em `app/api/leads/route.ts`:
```typescript
import { Client } from '@hubspot/api-client'

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_API_KEY })

export async function POST(request: Request) {
  const data = await request.json()

  try {
    const contactObj = {
      properties: {
        email: data.email,
        firstname: data.name.split(' ')[0],
        lastname: data.name.split(' ').slice(1).join(' '),
        phone: data.phone,
        company: data.company,
        message: data.message
      }
    }

    await hubspotClient.crm.contacts.basicApi.create(contactObj)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('HubSpot error:', error)
    return NextResponse.json({ error: 'Erro ao criar contato' }, { status: 500 })
  }
}
```

### 3. Google Sheets (Simples)

Instale:
```bash
npm install googleapis
```

Configure as credenciais do Google Cloud e use a API do Google Sheets para adicionar uma linha com os dados do lead.

### 4. E-mail Direto (Alternativa Simples)

Use um serviço como SendGrid, Mailgun ou Resend:

```bash
npm install resend
```

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const data = await request.json()

  await resend.emails.send({
    from: 'leads@losningtech.com.br',
    to: 'contato@losningtech.com.br',
    subject: `Novo Lead: ${data.name}`,
    html: `
      <h2>Novo contato do site</h2>
      <p><strong>Nome:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefone:</strong> ${data.phone}</p>
      <p><strong>Empresa:</strong> ${data.company}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${data.message}</p>
    `
  })

  return NextResponse.json({ success: true })
}
```

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
# CRM
CRM_API_KEY=sua_chave_aqui

# ou para HubSpot
HUBSPOT_API_KEY=sua_chave_aqui

# ou para e-mail
RESEND_API_KEY=sua_chave_aqui
```

**IMPORTANTE**: Nunca commite o arquivo `.env.local` no Git!

Ele já está no `.gitignore` por padrão.

## Testando

Após implementar, teste o formulário:

1. Abra o site
2. Clique em "Fale Conosco"
3. Preencha o formulário
4. Envie
5. Verifique se o lead chegou no seu CRM

## Dúvidas?

Escolha o CRM que melhor se adequa à sua necessidade e siga a documentação oficial:

- **HubSpot**: https://developers.hubspot.com/
- **Salesforce**: https://developer.salesforce.com/
- **RD Station**: https://developers.rdstation.com/
- **Pipedrive**: https://developers.pipedrive.com/
