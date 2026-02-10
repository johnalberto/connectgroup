
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageTemplate } from "@/types/whatsapp";
import { format } from "date-fns";
import { Plus, Trash } from "lucide-react";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Template Form
    const [newName, setNewName] = useState("");
    const [newBody, setNewBody] = useState("");
    const [newCategory, setNewCategory] = useState("general");
    const [newLang, setNewLang] = useState("es");

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/whatsapp/templates");
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates || []);
            }
        } catch (error) {
            console.error("Failed to fetch templates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch("/api/whatsapp/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    templateBody: newBody,
                    category: newCategory,
                    language: newLang,
                }),
            });

            if (res.ok) {
                setIsCreateOpen(false);
                setNewName("");
                setNewBody("");
                fetchTemplates();
            } else {
                const err = await res.json();
                alert("Error: " + (err.error || "Failed to create"));
            }
        } catch (e) {
            alert("Error creating template");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Message Templates</h2>
                    <p className="text-muted-foreground">Manage WhatsApp templates for automated and manual messaging.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Template</DialogTitle>
                            <DialogDescription>
                                Define the message content and variables.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Template Name</Label>
                                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="meeting_reminder" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select value={newCategory} onValueChange={setNewCategory}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="notification">Notification</SelectItem>
                                            <SelectItem value="reminder">Reminder</SelectItem>
                                            <SelectItem value="invitation">Invitation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Language</Label>
                                    <Select value={newLang} onValueChange={setNewLang}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="es">Spanish (es)</SelectItem>
                                            <SelectItem value="en">English (en)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Message Body</Label>
                                <Textarea
                                    value={newBody}
                                    onChange={e => setNewBody(e.target.value)}
                                    placeholder="Hello {{userName}}, your meeting is at {{time}}."
                                    rows={5}
                                />
                                <p className="text-xs text-muted-foreground">Use {"{{variableName}}"} for dynamic content.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Save Template</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead className="w-[50%]">Content</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                        ) : templates.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">No templates found.</TableCell></TableRow>
                        ) : (
                            templates.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.name}</TableCell>
                                    <TableCell className="capitalize">{t.category}</TableCell>
                                    <TableCell className="uppercase">{t.language}</TableCell>
                                    <TableCell className="truncate max-w-[300px]" title={t.templateBody}>{t.templateBody}</TableCell>
                                    <TableCell>{format(new Date(t.createdAt), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-destructive">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
