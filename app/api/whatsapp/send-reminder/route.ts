
// ==========================================
// DEPLOYMENT INTEGRITY CHECK: V1
// This comment shifts code down by 3 lines.
// ==========================================
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TwilioService } from "@/lib/twilio-service";
import { NextResponse } from "next/server";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Assuming Spanish context based on prompts

const SendReminderSchema = z.object({
    meetingId: z.string(),
    groupId: z.string()
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = SendReminderSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
        }

        const { meetingId, groupId } = validation.data;

        // Verify permissions (Admin or Leader of the group)
        if (session.user.role !== "ADMIN") {
            const isLeader = await prisma.connectionGroupLeader.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: session.user.id!
                    }
                }
            });

            if (!isLeader) {
                return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 });
            }
        }

        // Fetch meeting details
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
            include: { group: true }
        });

        if (!meeting) {
            return NextResponse.json({ success: false, error: "Meeting not found" }, { status: 404 });
        }

        // Fetch recipients: Members/Leaders who have phone + whatsapp enabled
        // Currently, our schema only links Users to Groups via 'ConnectionGroupLeader'.
        // If there's no 'Member' table, we assume Leaders are the ones to be notified OR
        // maybe there's a misunderstanding of the schema. 
        // prompt says: "Obtener todos los usuarios del grupo"
        // In the `sendMeetingNotification` in `lib/notifications.ts`, I noted:
        // "The schema doesn't seem to have a direct "Member" relation... Assuming for now we notify LEADERS."
        // I will stick to this logic: Notify all leaders of the group.
        // If there is another way to identify members (maybe assumed via some other relation?), it is not visible in `schema.prisma`.
        // Wait, looking at schema again:
        // `ConnectionGroup` has `leaders`.
        // `User` has `leaderGroups`.
        // No `members` relation.
        // So "Members of the group" effectively means "Leaders" in this context? 
        // OR maybe all users are members? No.
        // I will fetch all leaders of the group as "members".

        const recipients = await prisma.connectionGroupLeader.findMany({
            where: { groupId },
            include: { user: true }
        });

        const validRecipients = recipients
            .map((r: any) => r.user)
            .filter((u: any) => u.phone && u.whatsappNotifications);

        if (validRecipients.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No recipients with WhatsApp enabled found in this group."
            }, { status: 400 }); // Or 200 with 0 sent? 400 seems appropriate as action failed to do anything useful.
        }

        // Prepare format variables
        const dateStr = format(new Date(meeting.date), "PPP", { locale: es });
        const timeStr = format(new Date(meeting.date), "p", { locale: es });

        const sortedValidRecipients = validRecipients.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
        const results = await Promise.all(sortedValidRecipients.map(async (user: any) => {
            try {
                const res = await TwilioService.sendReminderTemplate({
                    to: user.phone!,
                    userName: user.name || "Member", // Fallback
                    groupName: meeting.group.name,
                    date: dateStr,
                    time: timeStr,
                    address: meeting.address,
                    description: meeting.description || ""
                });

                // Log message to DB
                await prisma.whatsAppMessage.create({
                    data: {
                        userId: user.id,
                        direction: 'outbound',
                        senderType: 'system',
                        messageBody: `Reminder for meeting on ${dateStr}`,
                        status: res.success ? 'sent' : 'failed',
                        twilioMessageSid: res.messageSid,
                        templateUsed: 'recordatory_church_group_invitation',
                        templateVariables: JSON.stringify({ name: user.name }),
                        // errorCode: res.errorCode?.toString(), // Type mismatch if number
                        errorCode: res.errorCode ? String(res.errorCode) : undefined,
                        errorMessage: res.error,
                        // meeting relation removed as it does not exist in schema
                    }
                });

                return { userId: user.id, success: res.success, error: res.error };
            } catch (err: any) {
                console.error(`Failed to send to ${user.id}`, err);
                return { userId: user.id, success: false, error: err.message };
            }
        }));

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failCount,
            results
        });

    } catch (error: any) {
        console.error("Send Reminder Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
