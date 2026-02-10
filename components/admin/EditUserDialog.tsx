"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/whatsapp/PhoneInput"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { updateUser } from "@/app/admin/actions"
import { Loader2 } from "lucide-react"

interface EditUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: {
        id: string
        name: string
        email: string
        phone?: string
        whatsappNotifications?: boolean
    } | null
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [whatsappNotifications, setWhatsappNotifications] = useState(true)

    useEffect(() => {
        if (user) {
            setName(user.name || "")
            setEmail(user.email || "")
            // @ts-ignore
            setPhone(user.phone || "") // Helper: ignore until migration makes type available
            // @ts-ignore
            setWhatsappNotifications(user.whatsappNotifications ?? true)
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const result = await updateUser(user.id, { name, email, phone, whatsappNotifications })
            if (result.success) {
                onOpenChange(false)
                alert("User updated successfully")
            } else {
                alert(result.error)
            }
        } catch (error) {
            alert("Failed to update user")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Make changes to the user profile here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <PhoneInput
                                value={phone}
                                onChange={setPhone}
                                placeholder="+61..."
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="whatsapp-notifications"
                                checked={whatsappNotifications}
                                onCheckedChange={setWhatsappNotifications}
                            />
                            <Label htmlFor="whatsapp-notifications">Enable WhatsApp Notifications</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
