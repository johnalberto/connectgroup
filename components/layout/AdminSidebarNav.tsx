"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Users, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function AdminSidebarNav() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(pathname?.startsWith("/admin") || false)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 space-y-1">
                <Link
                    href="/admin/users"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                        pathname === "/admin/users" ? "bg-muted text-primary" : "text-muted-foreground"
                    )}
                >
                    <Users className="h-4 w-4" />
                    Manage Users
                </Link>
                <Link
                    href="/admin/groups"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                        pathname === "/admin/groups" ? "bg-muted text-primary" : "text-muted-foreground"
                    )}
                >
                    <Package className="h-4 w-4" />
                    Manage Groups
                </Link>
            </CollapsibleContent>
        </Collapsible>
    )
}
