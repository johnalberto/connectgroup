import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PublicGroupDetailsPage({
    params,
}: {
    params: Promise<{ groupId: string }>
}) {
    const { groupId } = await params

    const group = await prisma.connectionGroup.findUnique({
        where: { id: groupId },
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
                }
            }
        }
    })

    if (!group || !group.isActive) {
        notFound()
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Back Button */}
                    <div>
                        <Link href="/groups">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Groups
                            </Button>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold tracking-tight">{group.name}</h1>
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                    {group.weekday}
                                </span>
                            </div>
                            <p className="text-xl text-muted-foreground">{group.description}</p>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-5 w-5" />
                            <span className="font-medium">
                                Led by {group.leaders.map(l => l.user.name).join(" & ")}
                            </span>
                        </div>
                    </div>

                    {/* Meetings List */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Upcoming Meetings</h2>
                        {group.meetings.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <p>No upcoming meetings scheduled at the moment.</p>
                                    <p className="text-sm">Please check back later or contact the leader.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {group.meetings.map(meeting => (
                                    <Card key={meeting.id}>
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-5 w-5 text-primary" />
                                                <CardTitle className="text-lg">
                                                    {format(new Date(meeting.date), "EEEE, MMMM do, yyyy 'at' h:mm a")}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span className="font-medium">{meeting.address}</span>
                                            </div>
                                            {meeting.description && (
                                                <p className="text-sm pl-6 border-l-2 border-muted ml-2">
                                                    {meeting.description}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
