
"use client";

import { useState, useEffect } from "react";
import { ConversationList } from "@/components/whatsapp/ConversationList";
import { ChatWindow } from "@/components/whatsapp/ChatWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        fetchConversations();
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/whatsapp/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error("Failed to load conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations.filter(c => {
        if (!filter) return true;
        const searchLower = filter.toLowerCase();
        const nameMatch = c.user.name?.toLowerCase().includes(searchLower);
        const phoneMatch = c.user.phone?.includes(filter);
        return nameMatch || phoneMatch;
    });

    const selectedConversation = conversations.find(c => c.user.id === selectedUserId);

    return (
        <div className="flex h-[calc(100vh-100px)] border rounded-lg bg-background overflow-hidden">
            {/* Left Sidebar: List */}
            <div className={`w-full md:w-[350px] border-r flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg">WhatsApp</h2>
                        <Button variant="outline" size="sm" onClick={fetchConversations}>Refresh</Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search chats..."
                            className="pl-8"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ConversationList
                        conversations={filteredConversations}
                        selectedUserId={selectedUserId || undefined}
                        onSelect={(id) => setSelectedUserId(id)}
                        isLoading={loading}
                    />
                </div>
            </div>

            {/* Right Content: Chat Window */}
            <div className={`flex-1 flex flex-col ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                {selectedUserId && selectedConversation ? (
                    <div className="flex flex-col h-full">
                        {/* Mobile Back Button */}
                        <div className="md:hidden p-2 border-b bg-gray-50 flex items-center">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)}>
                                ← Back
                            </Button>
                        </div>

                        <ChatWindow
                            key={selectedUserId} // Force remount on user change
                            userId={selectedUserId}
                            userName={selectedConversation.user.name || "Unknown"}
                            userPhone={selectedConversation.user.phone || ""}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground bg-gray-50/50">
                        <div className="text-center">
                            <p className="mb-2">Select a conversation to start chatting</p>
                            <p className="text-sm">or search for a user</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
