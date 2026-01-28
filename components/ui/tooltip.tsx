"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

const Tooltip = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative group flex items-center justify-center">
            {children}
        </div>
    )
}

const TooltipTrigger = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
    if (asChild) {
        return <>{props.children}</>
    }
    return <div ref={ref} className={className} {...props} />
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }
>(({ className, sideOffset = 4, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
            "bottom-full mb-2 hidden group-hover:block animate-in fade-in-0 zoom-in-95",
            "whitespace-nowrap",
            className
        )}
        {...props}
    />
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
