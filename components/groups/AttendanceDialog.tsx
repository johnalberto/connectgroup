"use client"

import { useState } from "react"
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
import { registerAttendance } from "@/app/groups/actions"
import { useRouter } from "next/navigation" // If needed for refresh

interface AttendanceDialogProps {
    meetingId: string
    initialData?: {
        adultsCount: number
        kidsCount: number
        observations: string | null
    } | null
    trigger?: React.ReactNode
}

export function AttendanceDialog({ meetingId, initialData, trigger }: AttendanceDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [adults, setAdults] = useState(initialData?.adultsCount ?? 0)
    const [kids, setKids] = useState(initialData?.kidsCount ?? 0)
    const [obs, setObs] = useState(initialData?.observations ?? "")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = {
                meetingId,
                adultsCount: Number(adults),
                kidsCount: Number(kids),
                observations: obs
            }

            const result = await registerAttendance(formData)

            if (result.error) {
                alert(result.error)
            } else {
                setOpen(false)
            }
        } catch (error) {
            console.error(error)
            alert("Failed to save attendance")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Attendance</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register Attendance</DialogTitle>
                    <DialogDescription>
                        Enter the number of attendees for this meeting.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="adults" className="text-right">
                                Adults
                            </Label>
                            <Input
                                id="adults"
                                type="number"
                                min="0"
                                value={adults}
                                onChange={(e) => setAdults(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="kids" className="text-right">
                                Kids
                            </Label>
                            <Input
                                id="kids"
                                type="number"
                                min="0"
                                value={kids}
                                onChange={(e) => setKids(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="obs" className="text-right">
                                Notes
                            </Label>
                            <Textarea
                                id="obs"
                                value={obs}
                                onChange={(e) => setObs(e.target.value)}
                                className="col-span-3"
                                placeholder="Any observations..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
