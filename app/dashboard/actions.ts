"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Weekday } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

export async function getLeaderGroups() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const memberships = await prisma.connectionGroupLeader.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            group: {
                include: {
                    _count: {
                        select: { meetings: true },
                    },
                },
            },
        },
    })

    return memberships.map((m) => m.group)
}

export async function getGroupDetails(groupId: string) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    if (session.user.role !== "ADMIN") {
        const isLeader = await prisma.connectionGroupLeader.findUnique({
            where: {
                groupId_userId: {
                    groupId: groupId,
                    userId: session.user.id!,
                },
            },
        })

        if (!isLeader) {
            throw new Error("You do not have permission to view this group.")
        }
    }

    const group = await prisma.connectionGroup.findUnique({
        where: { id: groupId },
        include: {
            meetings: {
                orderBy: {
                    date: "desc",
                },
                include: {
                    attendance: true
                }
            },
            leaders: {
                include: {
                    user: true
                }
            }
        },
    })

    if (!group) throw new Error("Group not found")

    return group
}

const MeetingSchema = z.object({
    groupId: z.string(),
    date: z.string(), // ISO string
    address: z.string().min(3),
    description: z.string().optional(),
})

export async function createMeeting(data: z.infer<typeof MeetingSchema>) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    if (session.user.role !== "ADMIN") {
        const isLeader = await prisma.connectionGroupLeader.findUnique({
            where: {
                groupId_userId: {
                    groupId: data.groupId,
                    userId: session.user.id!,
                },
            },
        })
        if (!isLeader) {
            throw new Error("You do not have permission to manage this group.")
        }
    }

    await prisma.meeting.create({
        data: {
            groupId: data.groupId,
            date: new Date(data.date),
            address: data.address,
            description: data.description,
        },
    })

    revalidatePath(`/dashboard/my-groups/${data.groupId}`)
    revalidatePath(`/dashboard/my-groups`)
    return { success: true }
}

const UpdateMeetingSchema = MeetingSchema.partial().extend({
    meetingId: z.string(),
    groupId: z.string(),
})

export async function updateMeeting(data: z.infer<typeof UpdateMeetingSchema>) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    if (session.user.role !== "ADMIN") {
        const meeting = await prisma.meeting.findUnique({
            where: { id: data.meetingId },
            select: { groupId: true }
        })

        if (!meeting) throw new Error("Meeting not found")

        const isLeader = await prisma.connectionGroupLeader.findUnique({
            where: {
                groupId_userId: {
                    groupId: meeting.groupId,
                    userId: session.user.id!,
                },
            },
        })
        if (!isLeader) {
            throw new Error("You do not have permission to manage this group.")
        }
    }

    await prisma.meeting.update({
        where: { id: data.meetingId },
        data: {
            date: data.date ? new Date(data.date) : undefined,
            address: data.address,
            description: data.description,
        },
    })

    revalidatePath(`/dashboard/my-groups/${data.groupId}`)
    return { success: true }
}

export async function getMyMeetings() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin")
    }

    // Get meetings for groups where the user is a leader
    // Logic: Find meetings where Meeting.group.leaders includes userId

    // Efficient query:
    const meetings = await prisma.meeting.findMany({
        where: {
            group: {
                leaders: {
                    some: {
                        userId: session.user.id
                    }
                }
            },

        },
        include: {
            group: true
        },
        orderBy: {
            date: 'asc'
        }
    })

    return meetings
}

const UpdateProfileSchema = z.object({
    name: z.string().min(2),
    imageBase64: z.string().optional(),
})

export async function updateProfile(data: z.infer<typeof UpdateProfileSchema>) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Optional: Add server-side validation for image size here if needed
    // The client should curb this, but checking string length is a safety measure.
    // 1MB ~ 1.33 Million chars in Base64.
    if (data.imageBase64 && data.imageBase64.length > 2000000) {
        throw new Error("Image too large")
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            name: data.name,
            image: data.imageBase64 || undefined,
        },
    })

    revalidatePath("/dashboard")
    return { success: true }
}

const UpdateGroupSchemaStr = z.object({
    name: z.string().min(2),
    weekday: z.string(),
    description: z.string().optional(),
})

export async function getLeaderStats() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Get groups led by user
    const leaderGroups = await prisma.connectionGroupLeader.findMany({
        where: { userId: session.user.id! },
        select: { groupId: true }
    })

    const groupIds = leaderGroups.map(lg => lg.groupId)

    if (groupIds.length === 0) {
        return {
            totalMeetings: 0,
            avgAttendance: 0,
            totalGroups: 0
        }
    }

    // Get meetings for these groups
    const meetings = await prisma.meeting.findMany({
        where: { groupId: { in: groupIds } },
        include: { attendance: true }
    })

    const totalMeetings = meetings.length

    let totalAttendance = 0
    let meetingsWithAttendance = 0

    meetings.forEach(m => {
        if (m.attendance) {
            totalAttendance += (m.attendance.adultsCount + m.attendance.kidsCount)
            meetingsWithAttendance++
        }
    })

    const avgAttendance = meetingsWithAttendance > 0
        ? Math.round(totalAttendance / meetingsWithAttendance)
        : 0

    return {
        totalMeetings,
        avgAttendance,
        totalGroups: groupIds.length
    }
}

export async function getGroupAttendanceHistory(groupId?: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    let whereClause: any = {}

    // If groupId is provided, check permission
    if (groupId) {
        if (session.user.role !== "ADMIN") {
            const isLeader = await prisma.connectionGroupLeader.findUnique({
                where: { groupId_userId: { groupId, userId: session.user.id! } }
            })
            if (!isLeader) throw new Error("Unauthorized")
        }
        whereClause.groupId = groupId
    } else {
        // If no groupId, and not admin, fetch for all leader groups
        if (session.user.role !== "ADMIN") {
            const leaderGroups = await prisma.connectionGroupLeader.findMany({
                where: { userId: session.user.id! },
                select: { groupId: true }
            })
            const groupIds = leaderGroups.map(lg => lg.groupId)
            whereClause.groupId = { in: groupIds }
        }
        // If admin and no groupId, fetch all
    }

    const meetings = await prisma.meeting.findMany({
        where: whereClause,
        orderBy: { date: 'asc' },
        include: {
            attendance: true,
            group: {
                select: { name: true }
            }
        }
    })

    return meetings
        .filter(m => m.attendance) // Only meetings with attendance
        .map(m => ({
            date: m.date,
            dateStr: m.date.toISOString(),
            name: m.group.name,
            adults: m.attendance!.adultsCount,
            kids: m.attendance!.kidsCount,
            total: m.attendance!.adultsCount + m.attendance!.kidsCount
        }))
}


export async function updateLeaderGroup(groupId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Check permission
    if (session.user.role !== "ADMIN") {
        const isLeader = await prisma.connectionGroupLeader.findUnique({
            where: {
                groupId_userId: {
                    groupId: groupId,
                    userId: session.user.id!,
                },
            },
        })

        if (!isLeader) {
            return { success: false, error: "You do not have permission to edit this group." }
        }
    }

    const rawData = {
        name: formData.get("name"),
        weekday: formData.get("weekday"),
        description: formData.get("description"),
    }

    const validation = UpdateGroupSchemaStr.safeParse(rawData)

    if (!validation.success) {
        return { success: false, error: "Invalid data" }
    }

    const data = validation.data

    try {
        await prisma.connectionGroup.update({
            where: { id: groupId },
            data: {
                name: data.name,
                weekday: data.weekday as any, // Cast to enum
                description: data.description,
            }
        })

        revalidatePath(`/dashboard/my-groups`)
        revalidatePath(`/dashboard/my-groups/${groupId}`)
        return { success: true }
    } catch (error) {
        console.error("Update Group Error:", error)
        return { success: false, error: "Failed to update group" }
    }
}
