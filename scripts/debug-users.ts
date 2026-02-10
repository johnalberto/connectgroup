
import { prisma } from "../lib/prisma";

async function main() {
    console.log("--- FINDING USERS WITH 'John' ---");
    const users = await prisma.user.findMany({
        where: { name: { contains: "John", mode: "insensitive" } },
        include: { whatsappMessages: { take: 5 } }
    });

    console.log(JSON.stringify(users, null, 2));

    console.log("\n--- LAST 5 WHATSAPP MESSAGES ---");
    const messages = await prisma.whatsAppMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true, id: true } } }
    });

    console.log(JSON.stringify(messages, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
