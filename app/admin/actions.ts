"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
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
                role: true,
                createdAt: true,
                enabled: true,
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

export async function createUser(data: { name: string; email: string }) {
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

export async function getGroups() {
    await checkAdmin()
    try {
        const groups = await prisma.connectionGroup.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                leaders: {
                    include: {
                        user: {
                            select: { name: true, email: true }
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

export async function updateUser(userId: string, data: { name: string; email: string }) {
    await checkAdmin()
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email
            }
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update user" }
    }
}
