"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Menu,
    Package,
    Package2,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebarNav } from "@/components/layout/AdminSidebarNav"
import { cn } from "@/lib/utils"

interface MobileSidebarProps {
    role?: string
}

export function MobileSidebar({ role }: MobileSidebarProps) {
    const pathname = usePathname()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-semibold"
                    >
                        <Package2 className="h-6 w-6" />
                        <span className="sr-only">Connect App</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className={cn(
                            "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                            pathname === "/dashboard"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <Home className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/my-groups"
                        className={cn(
                            "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                            pathname === "/dashboard/my-groups"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <Users className="h-5 w-5" />
                        My Groups
                    </Link>
                    <Link
                        href="/dashboard/meetings"
                        className={cn(
                            "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                            pathname === "/dashboard/meetings"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <Package className="h-5 w-5" />
                        My Meetings
                    </Link>
                    {role === 'ADMIN' && (
                        <div className="mt-2">
                            <AdminSidebarNav />
                        </div>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    )
}
