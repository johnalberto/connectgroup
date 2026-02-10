
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const templateSchema = z.object({
    name: z.string().min(1),
    category: z.enum(['notification', 'invitation', 'reminder', 'general']),
    language: z.string().default('es'),
    templateBody: z.string().min(1),
    variables: z.any().optional(),
    twilioContentSid: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // @ts-ignore
        const templates = await prisma.messageTemplate.findMany({
            include: {
                creator: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, templates });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validation = templateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const template = await prisma.messageTemplate.create({
            data: {
                ...validation.data,
                createdBy: session.user.id!,
                // @ts-ignore
                approvalStatus: 'approved', // Auto-approve for internal system for now
            }
        });

        return NextResponse.json({ success: true, template });

    } catch (error: any) {
        console.error('Create Template Error:', error);
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({ success: false, error: 'Template name already exists' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
