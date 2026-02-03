"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateLeaderGroup } from "@/app/dashboard/actions"
import { useState } from "react"
import { Weekday } from "@prisma/client"
import { Edit } from "lucide-react"

interface LeaderEditGroupDialogProps {
    group: { id: string; name: string; weekday: Weekday; description: string | null }
}

export function LeaderEditGroupDialog({ group }: LeaderEditGroupDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await updateLeaderGroup(group.id, formData)

            if (result.success) {
                setOpen(false)
                // Optional: success feedback could be improved later, but for now we just close.
            } else {
                alert(result.error || "Failed to update group")
            }
        } catch (error) {
            alert("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Group
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Group Details</DialogTitle>
                    <DialogDescription>
                        Update your connection group details.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Group Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={group.name}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="weekday">Meeting Day</Label>
                            <Select name="weekday" defaultValue={group.weekday}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(Weekday).map((day) => (
                                        <SelectItem key={day} value={day}>
                                            {day}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={group.description || ""}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
