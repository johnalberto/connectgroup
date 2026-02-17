
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TwilioService } from "@/lib/twilio-service";
import { NextResponse } from "next/server";
import { z } from "zod";

const SendInvitationSchema = z.object({
    userId: z.string()
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = SendInvitationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
        }

        const { userId } = validation.data;

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        if (!user.phone) {
            return NextResponse.json({ success: false, error: "User has no phone number" }, { status: 400 });
        }


        // Send Invitation
        console.log('Attempting to send WhatsApp invitation to:', user.phone, 'for user:', user.name);
        const res = await TwilioService.sendWelcomeInvitation({
            to: user.phone,
            userName: user.name || "Friend"
        });

        console.log('Twilio response:', JSON.stringify(res, null, 2));

        // Log message
        const dbMessage = await prisma.whatsAppMessage.create({
            data: {
                userId: user.id,
                direction: 'outbound',
                senderType: 'admin', // Admin triggered
                messageBody: `Invitation to platform`,
                status: res.success ? 'sent' : 'failed',
                twilioMessageSid: res.messageSid,
                templateUsed: 'welcome_church_group_invitation',
                templateVariables: JSON.stringify({ name: user.name }),
                errorCode: res.errorCode ? String(res.errorCode) : undefined,
                errorMessage: res.error,
            }
        });

        if (res.success) {
            console.log('Message logged to database with ID:', dbMessage.id);
            return NextResponse.json({
                success: true,
                messageSid: res.messageSid,
                dbMessage
            });
        } else {
            console.error('Twilio send failed:', res.error);
            return NextResponse.json({
                success: false,
                error: res.error
            }, { status: 500 });
        }


    } catch (error: any) {
        console.error("Send Invitation Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
