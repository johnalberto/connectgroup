
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Adjust import based on your auth setup
import { prisma } from '@/lib/prisma';
import { TwilioService } from '@/lib/twilio-service';
import { z } from 'zod';
import { isProduction } from '@/lib/env-validation';

// Schema Validation
const sendSchema = z.object({
    userId: z.string().optional(),
    phone: z.string().optional(),
    messageType: z.enum(['template', 'text']),
    templateSid: z.string().optional(),
    templateVariables: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check (Admin only for now)
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Input Validation
        const body = await req.json();
        const validation = sendSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.errors }, { status: 400 });
        }

        const { userId, phone, messageType, templateSid, templateVariables, body: textBody } = validation.data;

        // 3. Resolve Target Phone
        let targetPhone = phone;
        let targetUserId = userId;

        if (userId && !phone) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user?.phone) {
                return NextResponse.json({ success: false, error: 'User has no phone number' }, { status: 400 });
            }
            targetPhone = user.phone;
        }

        if (!targetPhone) {
            return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
        }

        // 4. Send Message via Twilio
        let result;
        if (messageType === 'template') {
            if (!templateSid || !templateVariables) {
                return NextResponse.json({ success: false, error: 'Template details missing' }, { status: 400 });
            }
            result = await TwilioService.sendTemplateMessage({
                to: targetPhone,
                templateSid,
                variables: templateVariables
            });
        } else {
            if (!textBody) {
                return NextResponse.json({ success: false, error: 'Message body missing' }, { status: 400 });
            }
            result = await TwilioService.sendFreeTextMessage({
                to: targetPhone,
                body: textBody
            });
        }

        // 5. Store in Database
        let dbMessage;
        if (result.success && targetUserId) {
            console.log(`Creating DB record for user ${targetUserId}, SID: ${result.messageSid}`);
            try {
                dbMessage = await prisma.whatsAppMessage.create({
                    data: {
                        userId: targetUserId,
                        twilioMessageSid: result.messageSid,
                        direction: 'outbound',
                        senderType: 'admin',
                        messageBody: messageType === 'template' ? `Template: ${templateSid}` : textBody || '',
                        status: 'queued', // Twilio status starts as queued usually
                        templateUsed: templateSid,
                        templateVariables: templateVariables ? templateVariables : undefined,
                    }
                });
                console.log('DB Message created:', dbMessage.id);
            } catch (dbError) {
                console.error('Failed to save message to DB:', dbError);
                // We don't fail the request because the message WAS sent
            }
        } else {
            console.warn('Skipping DB creation. Success:', result.success, 'TargetUserId:', targetUserId);
        }

        return NextResponse.json({ ...result, dbMessage });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
