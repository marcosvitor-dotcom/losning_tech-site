"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, BarChart3, Database, LineChart } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { GlowBlob } from "@/components/motion/GlowBlob"
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion"

export function Hero() {
  return (
    <section className="lt-gradient-hero relative overflow-hidden">
      <GlowBlob className="-left-24 top-10 h-96 w-96 opacity-25" color="var(--lt-teal)" />
      <GlowBlob className="right-0 top-40 h-80 w-80 opacity-20" color="var(--lt-royal)" />

      <div className="container relative grid items-center gap-12 pb-20 pt-36 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-44">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.span variants={staggerItem} className="lt-badge lt-badge-light">
            <Sparkles size={13} /> BI · Engenharia de Dados · Produtos digitais
          </motion.span>

          <motion.h1
            variants={staggerItem}
            className="mt-6 font-heading text-4xl font-bold leading-[1.1] text-white sm:text-5xl xl:text-6xl"
          >
            Inteligência de dados que{" "}
            <span className="lt-text-gradient-light">move o seu negócio.</span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/75"
          >
            Transformamos dados, tecnologia e inteligência em crescimento escalável
            para operações de mídia e marketing — e construímos produtos digitais
            próprios, como o Health Mind.
          </motion.p>

          <motion.div variants={staggerItem} className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="light">
              <Link href="/contato">
                Fale com a gente <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/60 text-white hover:bg-white hover:text-[var(--lt-navy)]">
              <Link href="/portfolio">Ver portfólio</Link>
            </Button>
          </motion.div>

          <motion.p variants={staggerItem} className="mt-8 text-sm text-white/55">
            “Você nos conecta. A gente cuida do resto.”
          </motion.p>
        </motion.div>

        {/* Visual — cartões flutuantes */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="relative hidden lg:block"
        >
          <div className="lt-card-navy relative rounded-3xl p-6 shadow-card-navy">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Visão consolidada
              </span>
              <span className="lt-badge lt-badge-light">24/7</span>
            </div>
            {/* mini gráfico de barras */}
            <div className="mt-6 flex h-40 items-end gap-2.5">
              {[42, 64, 38, 78, 56, 90, 70, 96].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.7, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 rounded-t-md"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--lt-teal-bright) 0%, var(--lt-teal) 100%)",
                  }}
                />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { v: "40h", l: "/ mês" },
                { v: "60%", l: "economia" },
                { v: "+30", l: "parceiros" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/5 py-3">
                  <p className="lt-stat text-xl text-white">{s.v}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/50">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="absolute -left-8 -top-6 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-card"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="lt-icon-badge h-10 w-10 rounded-xl">
              <BarChart3 size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-[var(--lt-ink)]">Dashboards</p>
              <p className="text-[10px] text-[var(--lt-muted)]">tempo real</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 -right-6 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-card"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            <span className="lt-icon-badge-blue lt-icon-badge h-10 w-10 rounded-xl">
              <Database size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-[var(--lt-ink)]">Pipelines</p>
              <p className="text-[10px] text-[var(--lt-muted)]">automatizados</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
