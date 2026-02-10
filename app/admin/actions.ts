"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole, TemplateCategory } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { sendInviteEmail } from "@/lib/mail"

// Helper to check admin access
async function checkAdmin() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
    }
    return session
}

export async function getUsers() {
    await checkAdmin()
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                whatsappNotifications: true,
                role: true,
                createdAt: true,
                enabled: true,
                image: true,
                _count: {
                    select: {
                        leaderGroups: true
                    }
                }
            }
        })
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: "Failed to fetch users" }
    }
}

export async function createUser(data: { name: string; email: string; phone?: string }) {
    try {
        await checkAdmin()

        // Check if exists
        const existing = await prisma.user.findUnique({ where: { email: data.email } })
        if (existing) {
            return { success: false, error: "User already exists" }
        }

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: "USER",
                enabled: true,
            }
        })

        // Generate Reset/Invite Token
        const token = uuidv4()
        const expires = new Date(new Date().getTime() + 24 * 3600 * 1000) // 24 hours

        await prisma.passwordResetToken.create({
            data: {
                email: data.email,
                token,
                expires
            }
        })

        // Send Email with error handling
        try {
            await sendInviteEmail(data.email, token)
        } catch (emailError) {
            console.error("Failed to send invite email:", emailError)
            return { success: true, message: "User created, but failed to send invite email." }
        }

        revalidatePath("/admin/users")
        return { success: true }

    } catch (error) {
        console.error("Create User Error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to create user" }
    }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    await checkAdmin()
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update user role" }
    }
}

export async function deleteUser(userId: string) {
    await checkAdmin()
    try {
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete user" }
    }
}

// Group Actions

export async function getAdminStats() {
    await checkAdmin()

    const totalGroups = await prisma.connectionGroup.count()
    const totalUsers = await prisma.user.count()

    // Calculate total attendance across all meetings
    const attendanceAgg = await prisma.meetingAttendance.aggregate({
        _sum: {
            adultsCount: true,
            kidsCount: true
        },
        _count: {
            _all: true
        }
    })

    const totalAttendanceCount = (attendanceAgg._sum.adultsCount || 0) + (attendanceAgg._sum.kidsCount || 0)
    const totalMeetings = attendanceAgg._count._all || 0

    // Average attendance per meeting
    const avgAttendance = totalMeetings > 0
        ? Math.round(totalAttendanceCount / totalMeetings)
        : 0

    // Active groups (groups with at least one meeting in the last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeGroupsCount = await prisma.connectionGroup.count({
        where: {
            meetings: {
                some: {
                    date: { gte: thirtyDaysAgo }
                }
            }
        }
    })

    return {
        totalGroups,
        totalUsers,
        avgAttendance, // Changed from totalAttendance
        activeGroupsCount
    }
}

export async function getGroups() {
    await checkAdmin()
    try {
        const groups = await prisma.connectionGroup.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                leaders: {
                    include: {
                        user: {
                            select: { name: true, email: true, image: true }
                        }
                    }
                },
                _count: {
                    select: { meetings: true }
                }
            }
        })
        return { success: true, data: groups }
    } catch (error) {
        return { success: false, error: "Failed to fetch groups" }
    }
}

export async function setPrimaryLeader(groupId: string, userId: string) {
    await checkAdmin()
    try {
        // Transaction to ensure only one primary leader per group
        await prisma.$transaction([
            // 1. Reset all leaders in this group to not primary
            prisma.connectionGroupLeader.updateMany({
                where: { groupId },
                data: { isPrimary: false }
            }),
            // 2. Set the specific leader to primary
            prisma.connectionGroupLeader.update({
                where: {
                    groupId_userId: {
                        groupId,
                        userId
                    }
                },
                data: { isPrimary: true }
            })
        ])

        revalidatePath("/admin/groups")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to set primary leader" }
    }
}


export async function createGroup(data: { name: string; weekday: string; description?: string }) {
    await checkAdmin()
    try {
        await prisma.connectionGroup.create({
            data: {
                name: data.name,
                weekday: data.weekday as any,
                description: data.description,
            }
        })
        revalidatePath("/admin/groups")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to create group" }
    }
}

export async function updateGroup(groupId: string, data: { name: string; weekday: string; description?: string }) {
    await checkAdmin()
    try {
        await prisma.connectionGroup.update({
            where: { id: groupId },
            data: {
                name: data.name,
                weekday: data.weekday as any,
                description: data.description,
            }
        })
        revalidatePath("/admin/groups")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update group" }
    }
}

export async function deleteGroup(groupId: string) {
    await checkAdmin()
    try {
        await prisma.connectionGroup.delete({
            where: { id: groupId }
        })
        revalidatePath("/admin/groups")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete group" }
    }
}

export async function searchUsers(query: string) {
    await checkAdmin()
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 5,
            select: { id: true, name: true, email: true }
        })
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: "Search failed" }
    }
}

export async function assignLeader(groupId: string, userId: string) {
    await checkAdmin()
    try {
        await prisma.connectionGroupLeader.create({
            data: {
                groupId,
                userId,
                isPrimary: false
            }
        })
        // Also update user role to LEADER if they are currently USER?
        // Let's optionally do that or leave it separate.
        // For now just link.
        revalidatePath("/admin/groups")
        return { success: true }
    } catch (error) {
        // Unique constraint might fail if already leader
        return { success: false, error: "Failed to assign leader" }
    }
}

export async function removeLeader(groupId: string, userId: string) {
    await checkAdmin()
    try {
        await prisma.connectionGroupLeader.deleteMany({
            where: {
                groupId,
                userId
            }
        })
        revalidatePath("/admin/groups")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to remove leader" }
    }
}

export async function resendUserInvite(userId: string) {
    await checkAdmin()
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || !user.email) {
            return { success: false, error: "User not found or has no email" }
        }

        // Generate New Token
        const token = uuidv4()
        const expires = new Date(new Date().getTime() + 24 * 3600 * 1000)

        // Delete any existing tokens for this user to keep it clean
        await prisma.passwordResetToken.deleteMany({
            where: { email: user.email }
        })

        await prisma.passwordResetToken.create({
            data: {
                email: user.email,
                token,
                expires
            }
        })

        // Send Email
        try {
            await sendInviteEmail(user.email, token)
        } catch (emailError) {
            console.error("Failed to re-send invite email:", emailError)
            return { success: false, error: "Failed to send email (Resend error)" }
        }

        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to resend invite" }
    }
}

export async function updateUser(userId: string, data: { name: string; email: string; phone?: string; whatsappNotifications?: boolean }) {
    await checkAdmin()
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                whatsappNotifications: data.whatsappNotifications
            }
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update user" }
    }
}

// Message Template Actions

export async function getTemplates() {
    await checkAdmin()
    try {
        const templates = await prisma.messageTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: templates }
    } catch (error) {
        return { success: false, error: "Failed to fetch templates" }
    }
}

export async function createTemplate(data: { name: string; body: string }) {
    const session = await checkAdmin()
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized: User ID missing" }
    }

    try {
        await prisma.messageTemplate.create({
            data: {
                name: data.name,
                templateBody: data.body,
                createdBy: session.user.id,
                category: TemplateCategory.general
            }
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create template" }
    }
}

export async function updateTemplate(id: string, data: { name: string; body: string }) {
    await checkAdmin()
    try {
        await prisma.messageTemplate.update({
            where: { id },
            data: {
                name: data.name,
                templateBody: data.body
            }
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update template" }
    }
}

export async function deleteTemplate(id: string) {
    await checkAdmin()
    try {
        await prisma.messageTemplate.delete({
            where: { id }
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete template" }
    }
}

export async function getConversations() {
    await checkAdmin()
    try {
        const users = await prisma.user.findMany({
            where: {
                whatsappMessages: {
                    some: {}
                }
            },
            include: {
                whatsappMessages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        })

        // Transform to a friendlier format if needed
        // Transform to match ConversationList interface
        const conversations = users.map(user => ({
            user: {
                id: user.id,
                name: user.name,
                image: user.image,
                phone: user.phone
            },
            lastMessage: user.whatsappMessages[0] || null,
            unreadCount: 0 // TODO: Implement unread count logic
        }))

        return { success: true, data: conversations }
    } catch (error) {
        return { success: false, error: "Failed to fetch conversations" }
    }
}
