
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Get distinct users who have messages
        const usersWithMessages = await prisma.whatsAppMessage.findMany({
            distinct: ['userId'],
            select: {
                userId: true
            }
        });

        console.log(`Found ${usersWithMessages.length} users with messages:`, usersWithMessages.map(u => u.userId));

        const userIds = usersWithMessages.map(u => u.userId);

        // Fetch user details and last message for each
        const conversations = await Promise.all(userIds.map(async (userId) => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, image: true, phone: true }
            });

            if (!user) {
                console.warn(`User ${userId} found in messages but not in User table.`);
            }

            const lastMessage = await prisma.whatsAppMessage.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });

            const unreadCount = await prisma.whatsAppMessage.count({
                where: {
                    userId,
                    direction: 'inbound',
                    status: 'delivered' // Assuming 'delivered' means unread by admin in this context, or add a 'read' field
                }
            });

            return {
                user,
                lastMessage,
                unreadCount
            };
        }));

        // Filter out conversations where user might be null (e.g. deleted users)
        const validConversations = conversations.filter(c => c.user !== null);

        console.log(`Returning ${validConversations.length} valid conversations.`);

        // Sort by last message date
        validConversations.sort((a, b) => {
            const dateA = a.lastMessage?.createdAt.getTime() || 0;
            const dateB = b.lastMessage?.createdAt.getTime() || 0;
            return dateB - dateA;
        });

        return NextResponse.json({
            success: true,
            conversations: validConversations
        });

    } catch (error: any) {
        console.error('Conversations List Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
