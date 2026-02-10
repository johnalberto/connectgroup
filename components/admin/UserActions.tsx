"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { deleteUser, updateUserRole, resendUserInvite } from "@/app/admin/actions"
import { UserRole } from "@prisma/client"
import { useState } from "react"
import { EditUserDialog } from "@/components/admin/EditUserDialog"
import { Loader2 } from "lucide-react"
import { ChatModal } from "@/components/whatsapp/ChatModal"

interface UserActionsProps {
    userId: string
    currentRole: UserRole
    userName: string
    userEmail: string
    userPhone?: string | null
    whatsappNotifications?: boolean
}

export function UserActions({ userId, currentRole, userName, userEmail, userPhone, whatsappNotifications }: UserActionsProps) {
    const [loading, setLoading] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)

    const handleRoleChange = async (newRole: UserRole) => {
        // ... (unchanged)
        if (newRole === currentRole) return;
        setLoading(true)
        try {
            const result = await updateUserRole(userId, newRole)
            if (result.success) {
                // toast.success("Role updated")
            } else {
                alert("Failed to update role")
            }
        } catch (error) {
            alert("Error updating role")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        // ... (unchanged)
        if (!confirm("Are you sure you want to delete this user?")) return;

        setLoading(true)
        try {
            const result = await deleteUser(userId)
            if (result.success) {
                // toast.success("User deleted")
            } else {
                alert("Failed to delete user")
            }
        } catch (error) {
            alert("Error deleting user")
        } finally {
            setLoading(false)
        }
    }

    const handleResendInvite = async () => {
        // ... (unchanged)
        setLoading(true)
        try {
            const result = await resendUserInvite(userId)
            if (result.success) {
                alert("Invite sent successfully!")
            } else {
                alert(result.error || "Failed to send invite")
            }
        } catch (error) {
            alert("Error sending invite")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                        <span className="sr-only">Open menu</span>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setChatOpen(true)}>
                        Send WhatsApp Message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        Edit user
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleResendInvite}>
                        Resend Invite
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={currentRole} onValueChange={(val) => handleRoleChange(val as UserRole)}>
                                <DropdownMenuRadioItem value="USER">User</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="LEADER">Leader</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="ADMIN">Admin</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                        Delete user
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditUserDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                user={{
                    id: userId,
                    name: userName,
                    email: userEmail,
                    phone: userPhone || undefined,
                    whatsappNotifications: whatsappNotifications
                }}
            />

            <ChatModal
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                userId={userId}
                userName={userName}
                userPhone={userPhone}
            />
        </>
    )
}
