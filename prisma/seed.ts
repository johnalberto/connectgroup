import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Create Users (Leaders)
    const user1 = await prisma.user.upsert({
        where: { email: 'juan@example.com' },
        update: {},
        create: {
            email: 'juan@example.com',
            name: 'Juan Perez',
            role: 'LEADER',
        },
    })

    const user2 = await prisma.user.upsert({
        where: { email: 'maria@example.com' },
        update: {},
        create: {
            email: 'maria@example.com',
            name: 'Maria Garcia',
            role: 'LEADER',
        },
    })

    const user3 = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN',
        },
    })

    // 2. Create Connection Groups
    const group1 = await prisma.connectionGroup.create({
        data: {
            name: 'Northside Youth',
            description: 'A group for young adults living in the north side.',
            weekday: 'FRIDAY',
            isActive: true,
            leaders: {
                create: {
                    userId: user1.id,
                    isPrimary: true
                }
            }
        },
    })

    const group2 = await prisma.connectionGroup.create({
        data: {
            name: 'Downtown Professionals',
            description: 'Connecting professionals working in downtown.',
            weekday: 'WEDNESDAY',
            isActive: true,
            leaders: {
                create: {
                    userId: user2.id,
                    isPrimary: true
                }
            }
        },
    })

    // 3. Create Meetings
    await prisma.meeting.create({
        data: {
            groupId: group1.id,
            date: new Date('2026-01-23T19:00:00Z'),
            address: '123 Main St, North Side',
            topic: 'Faith in Action',
        }
    })

    await prisma.meeting.create({
        data: {
            groupId: group2.id,
            date: new Date('2026-01-21T20:00:00Z'),
            address: 'Central Coffee Shop',
            topic: 'Workplace Ethics',
        }
    })

    console.log({ user1, user2, group1, group2 })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
