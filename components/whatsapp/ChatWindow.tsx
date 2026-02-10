
"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, MoreVertical, RefreshCw, UserPlus, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { WhatsAppMessage, MessageTemplate } from "@/types/whatsapp";
import { TemplateSelector } from "./TemplateSelector";
import { useToast } from "@/hooks/use-toast"; // Assuming hook exists

interface ChatWindowProps {
    userId: string;
    userName: string;
    userPhone: string;
    initialMessages?: WhatsAppMessage[];
}

export function ChatWindow({
    userId,
    userName,
    userPhone,
    initialMessages = []
}: ChatWindowProps) {
    const [messages, setMessages] = useState<WhatsAppMessage[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Invite Dialog State
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isSendingInvite, setIsSendingInvite] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // If initialMessages provided, use them. 
        // Otherwise (or if userId changes), fetch from API.
        if (initialMessages.length > 0) {
            setMessages(initialMessages);
        } else {
            refreshMessages();
        }

        // Polling interaction
        const intervalId = setInterval(() => {
            refreshMessages();
        }, 3000);

        return () => clearInterval(intervalId);
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length, userId]); // Only scroll when message count changes or user switches

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !selectedTemplate) || isSending) return;

        setIsSending(true);
        try {
            const payload: any = {
                userId,
                messageType: selectedTemplate ? 'template' : 'text',
            };

            if (selectedTemplate) {
                payload.templateSid = selectedTemplate.twilioContentSid;
                payload.templateVariables = {}; // Add logic to collect vars if needed
                // For now, we assume simple templates or static ones.
                // A real impl needs a modal to fill variables.
            } else {
                payload.body = newMessage;
            }

            const res = await fetch("/api/whatsapp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                setNewMessage("");
                setSelectedTemplate(null);

                if (data.dbMessage) {
                    setMessages((prev) => [...prev, data.dbMessage]);
                } else {
                    refreshMessages();
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Error sending message",
                    description: data.error || "Unknown error"
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast({
                variant: "destructive",
                title: "Network error",
                description: "Could not send message"
            });
        } finally {
            setIsSending(false);
        }
    };

    const refreshMessages = async () => {
        try {
            const res = await fetch(`/api/whatsapp/conversation/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => {
                    // Simple check to avoid unnecessary re-renders/scrolls
                    if (JSON.stringify(prev) === JSON.stringify(data.messages)) {
                        return prev;
                    }
                    return data.messages;
                });
            }
        } catch (error) {
            console.error("Failed to refresh messages", error);
        }
    };

    const handleSendInvitation = async () => {
        setIsSendingInvite(true);
        try {
            const res = await fetch("/api/whatsapp/send-invitation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Invitation Sent",
                    description: "User has been invited via WhatsApp.",
                    className: "bg-green-600 text-white"
                });
                setIsInviteDialogOpen(false);
                if (data.dbMessage) {
                    setMessages((prev) => [...prev, data.dbMessage]);
                }
            } else {
                toast({
                    title: "Error Sending Invitation",
                    description: data.error,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Network Error",
                description: "Failed to send invitation.",
                variant: "destructive"
            });
        } finally {
            setIsSendingInvite(false);
        }
    };

    return (
        <>
            <div className="flex flex-col h-full bg-[#E5DDD5]">
                {/* Header */}
                <div className="bg-white p-4 flex items-center justify-between border-b shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            {userName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">{userName}</h3>
                            <p className="text-xs text-gray-500">{userPhone}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => refreshMessages()} title="Refresh messages">
                            <RefreshCw className="h-5 w-5 text-gray-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsInviteDialogOpen(true)}
                            title="Send Platform Invitation"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                            <UserPlus className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5 text-gray-500" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg.messageBody || (msg.templateUsed ? `[Template: ${msg.templateUsed}]` : "")}
                            isSent={msg.direction === 'outbound'}
                            timestamp={msg.createdAt}
                            status={msg.status}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white p-3 border-t">
                    {selectedTemplate && (
                        <div className="mb-2 p-2 bg-gray-100 rounded text-sm flex justify-between items-center">
                            <span>Selected: <strong>{selectedTemplate.name}</strong></span>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>X</Button>
                        </div>
                    )}
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            {!selectedTemplate && (
                                <Textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="min-h-[40px] max-h-[120px] resize-none"
                                />
                            )}
                        </div>

                        <div className="flex gap-2">
                            <TemplateSelector
                                onSelect={setSelectedTemplate}
                                disabled={isSending || !!selectedTemplate}
                                className="w-[40px] px-0 justify-center"
                                compact={true}
                            />

                            <Button
                                onClick={handleSendMessage}
                                disabled={(!newMessage && !selectedTemplate) || isSending}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full h-10 w-10 p-0 flex items-center justify-center"
                            >
                                <Send className="h-5 w-5 ml-0.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Dialog */}
            < Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen} >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Send Platform Invitation</DialogTitle>
                        <DialogDescription>
                            Send an invitation to join the Connect Groups platform to <strong>{userName}</strong> via WhatsApp?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-sm text-gray-500">
                        <p className="italic bg-gray-50 p-3 rounded border">
                            "¡Hola {userName}! 👋 Te invitamos a formar parte de nuestra nueva plataforma..."
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)} disabled={isSendingInvite}>
                            Cancel
                        </Button>
                        <Button onClick={handleSendInvitation} disabled={isSendingInvite} className="bg-blue-600 hover:bg-blue-700">
                            {isSendingInvite ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Invitation"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    );
}
