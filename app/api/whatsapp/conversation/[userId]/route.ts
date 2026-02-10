
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ userId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        // Allow Admin or the User themselves
        if (!session || (session.user?.role !== 'ADMIN' && session.user?.id !== params.userId)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = params;

        const messages = await prisma.whatsAppMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            take: 100, // Limit to last 100 messages
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, image: true, phone: true }
        });

        return NextResponse.json({
            success: true,
            messages,
            user
        });

    } catch (error: any) {
        console.error('Conversation API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
