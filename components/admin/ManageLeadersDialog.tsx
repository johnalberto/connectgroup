"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { assignLeader, removeLeader, searchUsers, setPrimaryLeader } from "@/app/admin/actions"
import { useState } from "react"
import { X, Plus, Search, Star } from "lucide-react"

interface ManageLeadersDialogProps {
    group: {
        id: string;
        name: string;
        leaders: {
            userId: string;
            isPrimary: boolean;
            user: { name: string | null; email: string; image?: string | null }
        }[]
    }
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ManageLeadersDialog({ group, open, onOpenChange }: ManageLeadersDialogProps) {
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState<{ id: string; name: string | null; email: string }[]>([])
    const [loading, setLoading] = useState(false)

    async function handleSearch() {
        if (!query) return;
        setLoading(true)
        const res = await searchUsers(query)
        if (res.success && res.data) {
            setSearchResults(res.data)
        }
        setLoading(false)
    }

    async function handleAddLeader(userId: string) {
        await assignLeader(group.id, userId)
        setQuery("")
        setSearchResults([])
    }

    async function handleRemoveLeader(userId: string) {
        await removeLeader(group.id, userId)
    }

    async function handleSetPrimary(userId: string) {
        await setPrimaryLeader(group.id, userId)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Leaders - {group.name}</DialogTitle>
                    <DialogDescription>
                        Add or remove leaders, and designate a primary leader.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Leaders */}
                    <div>
                        <h4 className="mb-2 text-sm font-medium">Current Leaders</h4>
                        {group.leaders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No leaders assigned.</p>
                        ) : (
                            <div className="space-y-2">
                                {group.leaders.map((leader) => (
                                    <div key={leader.userId} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-yellow-500 hover:text-yellow-600"
                                                onClick={() => handleSetPrimary(leader.userId)}
                                                title={leader.isPrimary ? "Primary Leader" : "Set as Primary"}
                                            >
                                                <Star className={`h-4 w-4 ${leader.isPrimary ? "fill-current" : ""}`} />
                                            </Button>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{leader.user.name || "No Name"}</p>
                                                    {leader.isPrimary && (
                                                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full font-medium">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{leader.user.email}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleRemoveLeader(leader.userId)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Leader */}
                    <div className="space-y-2">
                        <Label>Add Leader</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search by name or email"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <Button size="icon" onClick={handleSearch} disabled={loading}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        {searchResults.length > 0 && (
                            <ScrollArea className="h-[150px] rounded-md border p-2">
                                {searchResults.map(user => (
                                    <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => handleAddLeader(user.id)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
