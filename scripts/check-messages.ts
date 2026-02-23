
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const messages = await prisma.whatsAppMessage.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, phone: true }
                }
            }
        });

        console.log(JSON.stringify(messages, null, 2));
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
