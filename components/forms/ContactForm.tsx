"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const schema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("E-mail inválido."),
  phone: z.string().optional(),
  company: z.string().optional(),
  interest: z.enum(["bi-dados", "health-mind", "geral"]),
  message: z.string().min(10, "Conte um pouco mais (mín. 10 caracteres)."),
  website: z.string().optional(), // honeypot
})

type FormValues = z.infer<typeof schema>

const inputClass =
  "w-full rounded-xl border border-[var(--lt-border)] bg-white px-4 py-3 text-sm text-[var(--lt-ink)] outline-none transition-colors placeholder:text-[var(--lt-muted)]/70 focus:border-[var(--lt-teal)] focus:ring-2 focus:ring-[var(--lt-teal)]/20"
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--lt-ink)]"

export function ContactForm({ defaultInterest = "geral" }: { defaultInterest?: FormValues["interest"] }) {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { interest: defaultInterest },
  })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("request failed")
      toast.success("Mensagem enviada! Em breve nossa equipe entra em contato.")
      reset({ interest: defaultInterest })
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Honeypot — oculto de humanos */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("website")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Nome *
          </label>
          <input id="name" className={inputClass} placeholder="Seu nome" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            E-mail *
          </label>
          <input id="email" type="email" className={inputClass} placeholder="voce@empresa.com" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="phone">
            Telefone / WhatsApp
          </label>
          <input id="phone" className={inputClass} placeholder="(00) 00000-0000" {...register("phone")} />
        </div>
        <div>
          <label className={labelClass} htmlFor="company">
            Empresa
          </label>
          <input id="company" className={inputClass} placeholder="Nome da empresa" {...register("company")} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="interest">
          Interesse
        </label>
        <select id="interest" className={cn(inputClass, "appearance-none")} {...register("interest")}>
          <option value="geral">Não sei ainda / Geral</option>
          <option value="bi-dados">BI & Engenharia de Dados</option>
          <option value="health-mind">Health Mind</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="message">
          Mensagem *
        </label>
        <textarea
          id="message"
          rows={4}
          className={cn(inputClass, "resize-none")}
          placeholder="Conte rapidamente o seu desafio ou objetivo."
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <button type="submit" disabled={submitting} className="lt-btn-primary w-full disabled:opacity-60">
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Enviando…
          </>
        ) : (
          <>
            <Send size={16} /> Enviar mensagem
          </>
        )}
      </button>
    </form>
  )
}
