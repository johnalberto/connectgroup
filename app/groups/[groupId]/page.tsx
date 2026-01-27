import { Navbar } from "@/components/layout/Navbar"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Users, ArrowLeft, ClipboardList } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { AttendanceDialog } from "@/components/groups/AttendanceDialog"

export default async function PublicGroupDetailsPage({
    params,
}: {
    params: Promise<{ groupId: string }>
}) {
    const { groupId } = await params
    const session = await auth()
    const userId = session?.user?.id

    // Check if current user is a leader of this group
    const isLeader = userId ? await prisma.connectionGroupLeader.findFirst({
        where: {
            groupId: groupId,
            userId: userId
        }
    }) : null;


    const group = await prisma.connectionGroup.findUnique({
        where: { id: groupId },
        include: {
            leaders: {
                include: {
                    user: true
                }
            },
            meetings: {
                where: isLeader ? {} : { // If leader, get all meetings (past/future) for context, or maybe limit past?
                    date: {
                        gte: new Date()
                    }
                },
                orderBy: {
                    date: 'asc'
                },
                include: {
                    attendance: true
                },
                take: isLeader ? 20 : undefined // Limit for leaders if showing history
            }
        }
    })

    if (!group || !group.isActive) {
        notFound()
    }

    // Split meetings if leader
    const upcomingMeetings = group.meetings.filter(m => new Date(m.date) >= new Date());
    // For past meetings, maybe we only want recent ones or ones without attendance?
    // Let's just show recent past meetings for now.
    const pastMeetings = isLeader ? group.meetings.filter(m => new Date(m.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];


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

                    {/* Leader Dashboard Section */}
                    {isLeader && (
                        <div className="space-y-4 border-t pt-8">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <ClipboardList className="h-6 w-6 text-blue-600" />
                                Leader Dashboard - Past Meetings
                            </h2>
                            {pastMeetings.length === 0 ? (
                                <p className="text-muted-foreground">No past meetings recorded recently.</p>
                            ) : (
                                <div className="grid gap-4">
                                    {pastMeetings.map(meeting => (
                                        <Card key={meeting.id} className="bg-slate-50 border-slate-200">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="h-5 w-5 text-slate-500" />
                                                        <CardTitle className="text-base text-slate-700">
                                                            {format(new Date(meeting.date), "EEE, MMM do, yyyy")}
                                                        </CardTitle>
                                                    </div>
                                                    <AttendanceDialog
                                                        meetingId={meeting.id}
                                                        initialData={meeting.attendance}
                                                        trigger={
                                                            <Button size="sm" variant={meeting.attendance ? "secondary" : "default"}>
                                                                {meeting.attendance ? "Edit Attendance" : "Register Attendance"}
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {meeting.attendance && (
                                                    <div className="text-sm text-slate-600">
                                                        <span className="font-semibold">Attendance:</span> {meeting.attendance.adultsCount} Adults, {meeting.attendance.kidsCount} Kids
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upcoming Meetings List */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Upcoming Meetings</h2>
                        {upcomingMeetings.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <p>No upcoming meetings scheduled at the moment.</p>
                                    <p className="text-sm">Please check back later or contact the leader.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {upcomingMeetings.map(meeting => (
                                    <Card key={meeting.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                                    <CardTitle className="text-lg">
                                                        {format(new Date(meeting.date), "EEEE, MMMM do, yyyy 'at' h:mm a")}
                                                    </CardTitle>
                                                </div>
                                                {isLeader && (
                                                    <AttendanceDialog
                                                        meetingId={meeting.id}
                                                        initialData={meeting.attendance}
                                                    />
                                                )}
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
