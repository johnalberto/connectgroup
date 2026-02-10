
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: { name: { contains: "John", mode: "insensitive" } },
            select: { id: true, name: true, phone: true }
        });

        const messages = await prisma.whatsAppMessage.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, phone: true } } }
        });

        // Replication of getConversations query
        const potentialConversations = await prisma.user.findMany({
            where: {
                whatsappMessages: {
                    some: {}
                }
            },
            include: {
                whatsappMessages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        const mappedConversations = potentialConversations.map((u: any) => ({
            user: u.name,
            msgCount: u.whatsappMessages.length,
            lastMsg: u.whatsappMessages[0]?.messageBody
        }));

        return NextResponse.json({
            debugType: "CONVERSATIONS_CHECK",
            conversationsFound: mappedConversations.length,
            conversationsData: mappedConversations,
            users,
            messages
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
