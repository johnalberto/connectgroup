"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const AttendanceSchema = z.object({
    meetingId: z.string(),
    adultsCount: z.coerce.number().min(0),
    kidsCount: z.coerce.number().min(0),
    observations: z.string().optional(),
})

export async function registerAttendance(data: z.infer<typeof AttendanceSchema>) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const result = AttendanceSchema.safeParse(data);
    if (!result.success) {
        return { error: "Invalid data" }
    }

    const { meetingId, adultsCount, kidsCount, observations } = result.data;

    // Verify ownership/leadership
    // We need to find the group of this meeting, and check if the current user is a leader
    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
            group: {
                include: {
                    leaders: {
                        where: { userId: session.user.id }
                    }
                }
            }
        }
    })

    if (!meeting) {
        return { error: "Meeting not found" }
    }

    // Check if user is a leader of this group
    const isLeader = meeting.group.leaders.length > 0;
    // Allow admins too eventually? For now just leaders.

    if (!isLeader) {
        // Double check using role if needed, but leaders schema is explicit
        return { error: "You are not a leader of this group" }
    }

    // Upsert attendance
    await prisma.meetingAttendance.upsert({
        where: { meetingId },
        update: {
            adultsCount,
            kidsCount,
            observations,
        },
        create: {
            meetingId,
            adultsCount,
            kidsCount,
            observations,
        }
    })

    revalidatePath(`/groups/${meeting.groupId}`)
    return { success: "Attendance registered successfully" }
}
