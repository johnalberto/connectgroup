"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { deleteGroup } from "@/app/admin/actions"
import { useState } from "react"
import { GroupDialog } from "./GroupDialog"
import { ManageLeadersDialog } from "./ManageLeadersDialog"

interface GroupActionsProps {
    group: any // Types defined in page or shared type
}

export function GroupActions({ group }: GroupActionsProps) {
    const [editOpen, setEditOpen] = useState(false)
    const [leadersOpen, setLeadersOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this group?")) return;

        setLoading(true)
        try {
            const result = await deleteGroup(group.id)
            if (!result.success) {
                alert("Failed to delete group")
            }
        } catch (error) {
            alert("Error deleting group")
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
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLeadersOpen(true)}>
                        Manage Leaders
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/my-groups/${group.id}`}>
                            Manage Meetings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                        Delete Group
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <GroupDialog
                group={group}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <ManageLeadersDialog
                group={group}
                open={leadersOpen}
                onOpenChange={setLeadersOpen}
            />
        </>
    )
}
