"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendPasswordResetEmail, sendInviteEmail } from "@/lib/mail"
import { v4 as uuidv4 } from "uuid"
import { hash } from "bcryptjs"

const ResetSchema = z.object({
    email: z.string().email(),
})

export async function resetPasswordRequest(data: z.infer<typeof ResetSchema>) {
    const validatedFields = ResetSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Invalid email!" };
    }

    const { email } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        return { error: "Email not found!" };
    }

    // Generate token
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    // Save token
    await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        }
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    return { success: "Reset email sent!" };
}


const NewPasswordSchema = z.object({
    password: z.string().min(6),
    token: z.string().optional(),
})

export async function newPassword(data: z.infer<typeof NewPasswordSchema>, token?: string | null) {
    if (!token) {
        return { error: "Missing token!" };
    }

    const validatedFields = NewPasswordSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { password } = validatedFields.data;

    const existingToken = await prisma.passwordResetToken.findUnique({
        where: { token }
    });

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.email }
    });

    if (!existingUser) {
        return { error: "User does not exist!" };
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            password: hashedPassword,
            emailVerified: new Date(), // If this was an invite, verify them now
            enabled: true // Ensure enabled
        }
    });

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    });

    return { success: "Password updated!" };
}
