"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { GroupDialog } from "./GroupDialog"
import { Plus } from "lucide-react"

export function CreateGroupButton() {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
            </Button>
            <GroupDialog open={open} onOpenChange={setOpen} />
        </>
    )
}
