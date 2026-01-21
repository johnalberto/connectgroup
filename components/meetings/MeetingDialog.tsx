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
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { createMeeting, updateMeeting } from "@/app/dashboard/actions"
import { Pencil, Plus } from "lucide-react"
import { format } from "date-fns"

interface MeetingDialogProps {
    groupId: string
    meeting?: {
        id: string
        date: Date | string // Date from DB might be string in client component prop if passed directly? No, usually Date object if server component passes it. BUT serialized over network...
        address: string
        description?: string | null
    }
}

export function MeetingDialog({ groupId, meeting }: MeetingDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Initial State
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [address, setAddress] = useState("")
    const [description, setDescription] = useState("")

    useEffect(() => {
        if (meeting && open) {
            const d = new Date(meeting.date)
            setDate(format(d, "yyyy-MM-dd"))
            setTime(format(d, "HH:mm"))
            setAddress(meeting.address)
            setDescription(meeting.description || "")
        } else if (!meeting && open) {
            // Reset for create mode
            setDate("")
            setTime("")
            setAddress("")
            setDescription("")
        }
    }, [meeting, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const dateTimeString = `${date}T${time}`

        try {
            if (meeting) {
                await updateMeeting({
                    meetingId: meeting.id,
                    groupId,
                    date: dateTimeString,
                    address,
                    description,
                })
            } else {
                await createMeeting({
                    groupId,
                    date: dateTimeString,
                    address,
                    description,
                })
            }
            setOpen(false)
        } catch (error) {
            alert("Failed to save meeting")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const isEditing = !!meeting

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Meeting</span>
                    </Button>
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Meeting
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Meeting" : "New Group Meeting"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Update meeting details." : "Schedule a new meeting for this group."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Time</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    required
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="123 Main St..."
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Topic, snacks, etc."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : (isEditing ? "Save Changes" : "Create Meeting")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
