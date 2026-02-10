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

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
