"use client";

import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageTemplate } from "@/types/whatsapp";

import { FileText, Loader2 } from "lucide-react";

interface TemplateSelectorProps {
    onSelect: (template: MessageTemplate) => void;
    className?: string; // Expecting button styling classes or width
    disabled?: boolean;
    compact?: boolean;
}

export function TemplateSelector({ onSelect, className, disabled, compact }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchTemplates = async () => {
            try {
                const res = await fetch("/api/whatsapp/templates");
                if (res.ok && mounted) {
                    const data = await res.json();
                    setTemplates(data.templates || []);
                }
            } catch (error) {
                console.error("Failed to load templates", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchTemplates();

        return () => {
            mounted = false;
        };
    }, []);

    const handleSelect = (template: MessageTemplate) => {
        onSelect(template);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={className}
                    disabled={disabled || loading}
                    size={compact ? "icon" : "default"}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : compact ? (
                        <FileText className="h-5 w-5" />
                    ) : (
                        <span>Select a template...</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                {templates.map((template) => (
                    <DropdownMenuItem key={template.id} onClick={() => handleSelect(template)}>
                        <div className="flex flex-col">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-xs text-muted-foreground">{template.language}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
                {templates.length === 0 && !loading && (
                    <div className="p-2 text-sm text-muted-foreground text-center">No templates found</div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
