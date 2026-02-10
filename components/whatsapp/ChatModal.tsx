
"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ChatWindow } from "./ChatWindow";
import { useState } from "react";

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    userPhone: string | null | undefined;
}

export function ChatModal({ isOpen, onClose, userId, userName, userPhone }: ChatModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] p-0 h-[600px] flex flex-col">
                <DialogTitle className="sr-only">Chat with {userName}</DialogTitle>
                {/* We use a key to reset chat state when user changes */}
                <ChatWindow
                    key={userId}
                    userId={userId}
                    userName={userName}
                    userPhone={userPhone || "No number"}
                />
            </DialogContent>
        </Dialog>
    );
}
