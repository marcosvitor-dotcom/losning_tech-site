"use client"

import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowUpRight, Eye, X, ImageOff } from "lucide-react"
import { useState } from "react"
import type { Dashboard } from "@/lib/data/dashboards"

export function DashboardCard({ dashboard }: { dashboard: Dashboard }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="lt-card group flex flex-col overflow-hidden">
      {/* Thumb */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--lt-navy)]">
        {!imgError ? (
          <Image
            src={dashboard.thumb}
            alt={`Preview do ${dashboard.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/50">
            <ImageOff size={28} />
            <span className="text-xs">{dashboard.client}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--lt-navy-deep)]/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lt-teal)]">
          {dashboard.client}
        </span>
        <h3 className="mt-1.5 font-heading text-xl font-bold text-[var(--lt-ink)]">{dashboard.title}</h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[var(--lt-muted)]">
          {dashboard.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {dashboard.tags.map((tag) => (
            <span key={tag} className="lt-badge lt-badge-blue text-[11px]">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <a
            href={dashboard.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lt-btn-primary flex-1 text-xs"
          >
            Abrir dashboard <ArrowUpRight size={15} />
          </a>

          <Dialog.Root>
            <Dialog.Trigger className="lt-btn-outline text-xs">
              <Eye size={15} /> Preview
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--lt-navy-deep)]/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[85vh] w-[92vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--lt-border)] px-5 py-3">
                  <div>
                    <Dialog.Title className="font-heading text-base font-bold text-[var(--lt-ink)]">
                      {dashboard.title}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-[var(--lt-muted)]">
                      {dashboard.client} · pré-visualização ao vivo
                    </Dialog.Description>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={dashboard.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lt-btn-ghost text-xs"
                    >
                      Abrir em nova aba <ArrowUpRight size={14} />
                    </a>
                    <Dialog.Close className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--lt-muted)] hover:bg-[var(--lt-teal-pale)]">
                      <X size={18} />
                    </Dialog.Close>
                  </div>
                </div>
                <iframe
                  src={dashboard.url}
                  title={dashboard.title}
                  className="h-full w-full flex-1 border-0"
                  loading="lazy"
                />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </div>
  )
}
