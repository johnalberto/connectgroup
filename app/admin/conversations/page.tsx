"use client"

import { useState, useEffect } from "react"
import { ConversationList } from "@/components/whatsapp/ConversationList"
import { ChatWindow } from "@/components/whatsapp/ChatWindow"
import { getConversations } from "@/app/admin/actions"
import { Loader2 } from "lucide-react"

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<any[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchConversations = async () => {
        const res = await getConversations()
        if (res.success && res.data) {
            setConversations(res.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchConversations()
        // Optional: Poll for new conversations/last messages
        // const interval = setInterval(fetchConversations, 10000)
        // return () => clearInterval(interval)
    }, [])

    const selectedConversation = conversations.find((c: any) => c.user.id === selectedUserId)

    return (
        <div className="flex h-[calc(100vh-100px)] border rounded-lg overflow-hidden bg-background">
            <div className="w-[300px] border-r flex flex-col">
                <div className="p-4 border-b font-semibold bg-muted/40">Conversations</div>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <ConversationList
                        conversations={conversations}
                        selectedUserId={selectedUserId || undefined}
                        onSelect={setSelectedUserId}
                    />
                )}
            </div>
            <div className="flex-1 flex flex-col">
                {selectedUserId && selectedConversation ? (
                    <ChatWindow
                        userId={selectedUserId}
                        userName={selectedConversation.user.name || "User"}
                        userPhone={selectedConversation.user.phone}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    )
}
