import { PrismaClient } from "@prisma/client"

import { validateEnvironment } from "./env-validation"

// Validate environment before connecting
validateEnvironment()

const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL_DEV || process.env.DATABASE_URL
    console.log(`Initializing Prisma Client with URL: ${url?.replace(/:([^:@]+)@/, ":******@")}`)

    return new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    })
}

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
