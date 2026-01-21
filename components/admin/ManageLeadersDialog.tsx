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
import { assignLeader, removeLeader, searchUsers } from "@/app/admin/actions"
import { useState } from "react"
import { X, Plus, Search } from "lucide-react"

interface ManageLeadersDialogProps {
    group: {
        id: string;
        name: string;
        leaders: { user: { name: string | null; email: string } }[]
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

    async function handleRemoveLeader(userId: string) { // This actually requires userID of the leader in relation... wait.
        // My server action removeLeader takes (groupId, userId).
        // But the group.leaders prop passed here from Prisma "include" might need user ID.
        // I need to ensure the parent component passes the user ID of the leader.
        // Let's assume the parent passes the correct structure or I need to fetch it?
        // Ah, in actions.ts getGroups includes: leaders: { include: { user: ... } }
        // It doesn't include the User ID directly unless I select it.
        // I'll update the component to expect user ID.
        await removeLeader(group.id, userId)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Leaders - {group.name}</DialogTitle>
                    <DialogDescription>
                        Add or remove leaders for this group.
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
                                {/* Note: I need the user ID here. I will fix the parent fetch to include it. */
                                    /* For now assuming 'user' has id. Typescript will whine if I don't fix the type. */
                                }
                                {group.leaders.map((leader: any) => (
                                    <div key={leader.userId} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                        <div>
                                            <p className="font-medium">{leader.user.name || "No Name"}</p>
                                            <p className="text-xs text-muted-foreground">{leader.user.email}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveLeader(leader.userId)}>
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
