"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider {...props}>
            {children}
            <Toaster position="top-right" />
        </NextThemesProvider>
    )
}

import { Toaster } from "react-hot-toast"
