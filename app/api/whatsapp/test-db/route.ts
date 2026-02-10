
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const count = await prisma.whatsAppMessage.count();
        const messages = await prisma.whatsAppMessage.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        const users = await prisma.user.findMany({
            where: {
                id: { in: messages.map(m => m.userId).filter((id): id is string => id !== null) }
            },
            select: { id: true, name: true, phone: true }
        });

        return NextResponse.json({
            count,
            messages,
            users
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
