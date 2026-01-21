
import { prisma } from "@/lib/prisma"

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error("Please provide an email")
        process.exit(1)
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true }
    })

    console.log("User found:", user)
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
