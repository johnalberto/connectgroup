
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Adjust path
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
    whatsappEnabled: z.boolean(),
    useSandbox: z.boolean(),
    meetingNotifications: z.boolean(),
    meetingUpdateNotifications: z.boolean(),
    reminderNotifications: z.boolean(),
    defaultTemplateId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // @ts-ignore
        const settings = await prisma.systemSettings.findMany({
            where: { key: { startsWith: 'whatsapp_' } }
        });

        // Convert to object
        const config: any = {
            whatsappEnabled: true, // Default
            useSandbox: false,
            meetingNotifications: true,
            meetingUpdateNotifications: true,
            reminderNotifications: true,
            defaultTemplateId: null
        };

        settings.forEach((s: any) => {
            const key = s.key.replace('whatsapp_', '');
            // Parse boolean/value
            if (key === 'defaultTemplateId') {
                config[key] = s.value;
            } else {
                config[key] = s.value === 'true';
            }
        });

        return NextResponse.json({ success: true, config });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validation = settingsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const data = validation.data;
        const updates = [];

        // Helper to upsert
        const upsertSetting = (key: string, value: string) => {
            // @ts-ignore
            return prisma.systemSettings.upsert({
                where: { key: `whatsapp_${key}` },
                update: { value },
                create: { key: `whatsapp_${key}`, value }
            });
        };

        updates.push(upsertSetting('whatsappEnabled', String(data.whatsappEnabled)));
        updates.push(upsertSetting('useSandbox', String(data.useSandbox)));
        updates.push(upsertSetting('meetingNotifications', String(data.meetingNotifications)));
        updates.push(upsertSetting('meetingUpdateNotifications', String(data.meetingUpdateNotifications)));
        updates.push(upsertSetting('reminderNotifications', String(data.reminderNotifications)));

        if (data.defaultTemplateId !== undefined) {
            updates.push(upsertSetting('defaultTemplateId', data.defaultTemplateId || ''));
        }

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Settings Update Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
