
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
    user: {
        id: string;
        name: string | null;
        image: string | null;
        phone: string | null;
    };
    lastMessage: {
        messageBody: string;
        createdAt: Date;
        status: string;
    } | null;
    unreadCount: number;
}

interface ConversationListProps {
    conversations: Conversation[];
    selectedUserId?: string;
    onSelect: (userId: string) => void;
    isLoading?: boolean;
}

export function ConversationList({
    conversations,
    selectedUserId,
    onSelect,
    isLoading
}: ConversationListProps) {
    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Loading chats...</div>;
    }

    if (conversations.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No conversations yet</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {conversations.map((conv) => {
                if (!conv?.user) return null;
                const isSelected = selectedUserId === conv.user.id;
                const lastMsgTime = conv.lastMessage
                    ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })
                    : "";

                return (
                    <div
                        key={conv.user.id}
                        onClick={() => onSelect(conv.user.id)}
                        className={cn(
                            "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b",
                            isSelected && "bg-muted"
                        )}
                    >
                        <Avatar>
                            <AvatarImage src={conv.user.image || ""} />
                            <AvatarFallback>{conv.user.name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-medium truncate">{conv.user.name || "Unknown User"}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{lastMsgTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground truncate">
                                    {conv.lastMessage?.messageBody || "No messages"}
                                </p>
                                {conv.unreadCount > 0 && (
                                    <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
