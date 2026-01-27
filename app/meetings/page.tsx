import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MeetingSearch } from "@/components/meetings/MeetingSearch"

export const dynamic = "force-dynamic"

export default async function MeetingsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; from?: string; to?: string }>
}) {
    const { q, from, to } = await searchParams

    const whereClause: any = {}

    // Date Filters
    if (from || to) {
        whereClause.date = {}
        if (from) whereClause.date.gte = new Date(from)
        if (to) whereClause.date.lte = new Date(to)
    } else {
        // Default to upcoming if no date selected
        whereClause.date = {
            gte: new Date()
        }
    }

    // Search Query
    if (q) {
        whereClause.OR = [
            {
                description: {
                    contains: q,
                    mode: 'insensitive'
                }
            },
            {
                group: {
                    name: {
                        contains: q,
                        mode: 'insensitive'
                    }
                }
            }
        ]
    }

    const meetings = await prisma.meeting.findMany({
        where: whereClause,
        include: {
            group: true
        },
        orderBy: {
            date: 'asc'
        },
        take: 50
    })

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold">Find a Meeting</h1>
                        <p className="text-muted-foreground">
                            Search for upcoming meetings across all groups.
                        </p>

                        {/* Search Component */}
                        <div className="bg-background p-4 rounded-lg border shadow-sm">
                            <MeetingSearch />
                        </div>
                    </div>

                    {meetings.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-background/50">
                            <p className="text-muted-foreground">No meetings found matching your criteria.</p>
                            {(q || from || to) && (
                                <Link href="/meetings" className="text-primary hover:underline text-sm mt-2 block">
                                    Clear filters
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {meetings.map((meeting) => (
                                <Card key={meeting.id} className="flex flex-col">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-5 w-5 text-primary" />
                                            <CardTitle className="text-base">
                                                {format(new Date(meeting.date), "EEEE, MMMM do, yyyy")}
                                                <br />
                                                <span className="text-sm font-normal text-muted-foreground">
                                                    {format(new Date(meeting.date), "h:mm a")}
                                                </span>
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col gap-3">
                                        <Link href={`/groups/${meeting.groupId}`} className="hover:underline group">
                                            <div className="flex items-center gap-2 font-semibold text-lg">
                                                <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                {meeting.group.name}
                                            </div>
                                        </Link>

                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span className="text-sm">{meeting.address}</span>
                                        </div>

                                        {meeting.description && (
                                            <p className="text-sm text-muted-foreground border-l-2 pl-3 line-clamp-2">
                                                {meeting.description}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
