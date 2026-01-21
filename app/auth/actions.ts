"use server"

import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { z } from "zod"

const RegisterSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function registerUser(data: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields!" }
    }

    const { firstName, lastName, email, password } = validatedFields.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return { error: "Email already in use!" }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    // Determine Role: First user is Admin? No, let's just default to USER.
    // User can manually be promoted by existing Admin.

    await prisma.user.create({
        data: {
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: "USER", // Default role
            enabled: true, // Auto-enable for now for smoother onboarding? Or false?
            // Given this is a small app, auto-enable is likely preferred for now.
            // If strict admin approval is needed, change to false.
        },
    })

    return { success: "User created! Please login." }
}
