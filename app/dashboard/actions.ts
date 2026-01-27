"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
