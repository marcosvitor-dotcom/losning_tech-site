"use client"

import { motion, type Variants } from "framer-motion"
import { fadeUp, staggerContainer, staggerItem, viewport } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  className?: string
  variants?: Variants
  delay?: number
}

/** Revela um bloco quando entra na viewport. */
export function Reveal({ children, className, variants = fadeUp, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  )
}

/** Container que orquestra a entrada em cascata dos filhos (use RevealItem dentro). */
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={cn(className)} variants={staggerItem}>
      {children}
    </motion.div>
  )
}
