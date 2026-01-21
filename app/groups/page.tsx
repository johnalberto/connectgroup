import { Navbar } from "@/components/layout/Navbar";

import { GroupCard } from "@/components/groups/GroupCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
    // Fetch active groups from DB
    const groups = await prisma.connectionGroup.findMany({
        where: {
            isActive: true
        },
        include: {
            leaders: {
                include: {
                    user: true
                }
            },
            meetings: {
                where: {
                    date: {
                        gte: new Date()
                    }
                },
                orderBy: {
                    date: 'asc'
                },
                take: 1
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Find a Group</h1>
                        <p className="text-muted-foreground">Discover a community that fits your schedule and location.</p>
                    </div>

                    {groups.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No active groups found at this time.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map(group => (
                                <GroupCard key={group.id} group={group} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
