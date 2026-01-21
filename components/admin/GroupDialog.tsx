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
import { createGroup, updateGroup } from "@/app/admin/actions"
import { useState } from "react"
import { Weekday } from "@prisma/client"

interface GroupDialogProps {
    group?: { id: string; name: string; weekday: Weekday; description: string | null }
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GroupDialog({ group, open, onOpenChange }: GroupDialogProps) {
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const data = {
            name: formData.get("name") as string,
            weekday: formData.get("weekday") as string,
            description: formData.get("description") as string,
        }

        try {
            let result;
            if (group) {
                result = await updateGroup(group.id, data)
            } else {
                result = await createGroup(data)
            }

            if (result.success) {
                onOpenChange(false)
            } else {
                alert(result.error)
            }
        } catch (error) {
            alert("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{group ? "Edit Group" : "Create Group"}</DialogTitle>
                    <DialogDescription>
                        {group ? "Edit the details of the connection group." : "Add a new connection group to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={group?.name}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weekday" className="text-right">
                                Day
                            </Label>
                            <Select name="weekday" defaultValue={group?.weekday || "WEDNESDAY"}>
                                <SelectTrigger className="col-span-3">
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={group?.description || ""}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
