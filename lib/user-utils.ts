
import { prisma } from "@/lib/prisma";

export async function findUserByPhone(phone: string) {
    // Phone comes as "whatsapp:+61412345678" or just "+614..."
    // We need to strip "whatsapp:" if present
    const cleanPhone = phone.replace('whatsapp:', '').trim();

    // Try detailed search first (exact match)
    let user = await prisma.user.findFirst({
        where: { phone: cleanPhone }
    });

    if (user) return user;

    // Remove any spaces or non-digit chars from cleanPhone (except +)
    const sanitized = cleanPhone.replace(/[\s-]/g, '');

    // Try without spaces if successful
    if (sanitized !== cleanPhone) {
        user = await prisma.user.findFirst({ where: { phone: sanitized } });
        if (user) return user;
    }

    // Handle AU formats
    if (sanitized.startsWith('+61')) {
        // Try local: 04...
        const local = '0' + sanitized.substring(3);
        user = await prisma.user.findFirst({ where: { phone: local } });
        if (user) return user;

        // Try no-plus: 61...
        const noPlus = sanitized.substring(1);
        user = await prisma.user.findFirst({ where: { phone: noPlus } });
        if (user) return user;
    } else if (sanitized.startsWith('61')) {
        // Try with plus
        const plus = '+' + sanitized;
        user = await prisma.user.findFirst({ where: { phone: plus } });
        if (user) return user;

        // Try local
        const local = '0' + sanitized.substring(2);
        user = await prisma.user.findFirst({ where: { phone: local } });
        if (user) return user;
    } else if (sanitized.startsWith('04')) {
        // Try international
        const international = '+61' + sanitized.substring(1);
        user = await prisma.user.findFirst({ where: { phone: international } });
        if (user) return user;
    }

    return null;
}
