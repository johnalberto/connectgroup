"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Users, Package, MessageCircle, MessageSquare } from "lucide-react"
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
        <div className="space-y-1">
            <div className="px-3 py-2">
                <h3 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
                    Admin
                </h3>
                <div className="space-y-1">
                    <Link
                        href="/admin/conversations"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                            pathname?.startsWith("/admin/conversations") ? "bg-muted text-primary" : "text-muted-foreground"
                        )}
                    >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                    </Link>

                    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary h-auto font-normal"
                            >
                                <Settings className="h-4 w-4" />
                                Configuration
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
                                Users
                            </Link>
                            <Link
                                href="/admin/groups"
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                                    pathname === "/admin/groups" ? "bg-muted text-primary" : "text-muted-foreground"
                                )}
                            >
                                <Package className="h-4 w-4" />
                                Groups
                            </Link>
                            <Link
                                href="/admin/settings"
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                                    pathname === "/admin/settings" ? "bg-muted text-primary" : "text-muted-foreground"
                                )}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Templates
                            </Link>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
        </div>
    )
}
