
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fetching users with whatsapp messages...");
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
        });

        console.log(`Found ${users.length} users.`);
        users.forEach(u => {
            console.log(`User: ${u.name} (${u.email}) - Messages: ${u.whatsappMessages.length}`);
            if (u.whatsappMessages.length > 0) {
                console.log(`  Last msg: ${u.whatsappMessages[0].messageBody} [${u.whatsappMessages[0].status}]`);
            }
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
