"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { createTemplate, updateTemplate, deleteTemplate } from "@/app/admin/actions"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"

interface Template {
    id: string
    name: string
    templateBody: string // Renamed from body
    createdAt: Date
    updatedAt: Date
}

interface TemplateManagerProps {
    templates: any[] // Relaxing this to avoid strict type issues with excess properties from Prisma
}

export function TemplateManager({ templates }: TemplateManagerProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
    const [loading, setLoading] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [body, setBody] = useState("") // Keeping state as 'body' for form input

    const resetForm = () => {
        setName("")
        setBody("")
        setEditingTemplate(null)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await createTemplate({ name, body })
            if (res.success) {
                setIsCreateOpen(false)
                resetForm()
            } else {
                alert("Failed to create template")
            }
        } catch (error) {
            alert("Error creating template")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTemplate) return
        setLoading(true)
        try {
            const res = await updateTemplate(editingTemplate.id, { name, body })
            if (res.success) {
                setEditingTemplate(null)
                resetForm()
            } else {
                alert("Failed to update template")
            }
        } catch (error) {
            alert("Error updating template")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this template?")) return
        setLoading(true)
        try {
            await deleteTemplate(id)
        } catch (error) {
            alert("Error deleting template")
        } finally {
            setLoading(false)
        }
    }

    const openEdit = (t: any) => {
        setEditingTemplate(t)
        setName(t.name)
        setBody(t.templateBody) // Map from prisma model
    }

    return (
        <Card>
            <div className="flex items-center justify-between p-6">
                <div className="space-y-1">
                    <CardTitle>Message Templates</CardTitle>
                    <CardDescription>
                        Manage templates for WhatsApp messages. Variables: {'{userName}'}, {'{groupName}'}, {'{meetDate}'}, {'{meetTime}'}
                    </CardDescription>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Template</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Meeting Reminder" />
                            </div>
                            <div className="space-y-2">
                                <Label>Body</Label>
                                <Textarea
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    required
                                    placeholder="Hi {userName}, reminder for..."
                                    className="h-32"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <CardContent>
                <div className="space-y-4">
                    {templates.length === 0 && <p className="text-sm text-muted-foreground">No templates created yet.</p>}
                    {templates.map(t => (
                        <div key={t.id} className="flex items-start justify-between border p-4 rounded-lg">
                            <div>
                                <h4 className="font-semibold">{t.name}</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">{t.templateBody}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(t.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Edit Dialog */}
                <Dialog open={!!editingTemplate} onOpenChange={(open) => { if (!open) resetForm(); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Template</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Body</Label>
                                <Textarea value={body} onChange={e => setBody(e.target.value)} required className="h-32" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
