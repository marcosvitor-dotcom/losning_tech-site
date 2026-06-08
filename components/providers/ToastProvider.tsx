"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        style: { fontFamily: "var(--font-inter), system-ui, sans-serif" },
      }}
    />
  )
}
