
"use client";

import { cn } from "@/lib/utils";
import { MessageStatus } from "@/types/whatsapp";
import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
    message: string;
    isSent: boolean;
    timestamp: string | Date;
    status?: MessageStatus;
    senderName?: string;
    className?: string;
}

export function MessageBubble({
    message,
    isSent,
    timestamp,
    status,
    senderName,
    className
}: MessageBubbleProps) {
    const time = timestamp ? format(new Date(timestamp), "HH:mm") : "";

    const StatusIcon = () => {
        if (!isSent) return null;
        switch (status) {
            case 'queued': return <Clock className="h-3 w-3 text-gray-400" />;
            case 'sent': return <Check className="h-3 w-3 text-gray-400" />;
            case 'delivered': return <CheckCheck className="h-3 w-3 text-gray-400" />; // Delivered but not read
            case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
            case 'failed': return <AlertCircle className="h-3 w-3 text-red-500" />;
            case 'undelivered': return <AlertCircle className="h-3 w-3 text-red-500" />;
            default: return <Clock className="h-3 w-3 text-gray-400" />;
        }
    };

    return (
        <div className={cn("flex flex-col mb-4 max-w-[80%]", isSent ? "ml-auto items-end" : "mr-auto items-start", className)}>
            {senderName && !isSent && (
                <span className="text-xs text-muted-foreground mb-1 ml-1">{senderName}</span>
            )}
            <div
                className={cn(
                    "rounded-lg px-4 py-2 text-sm shadow-sm relative break-words",
                    isSent
                        ? "bg-[#D9FDD3] text-gray-800 rounded-tr-none" // WhatsApp green-ish
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                )}
            >
                <p className="mr-8 whitespace-pre-wrap">{message}</p>
                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">{time}</span>
                    <StatusIcon />
                </div>
            </div>
        </div>
    );
}
