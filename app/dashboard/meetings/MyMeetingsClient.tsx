"use client"

import { useState } from "react"
import { MeetingCalendar } from "@/components/meetings/MeetingCalendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, LayoutList, MapPin, Users, Calendar as CalendarIconLucide } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

interface Meeting {
    id: string
    date: Date
    address: string
    description?: string | null
    groupId: string
    group: {
        name: string
    }
}

export function MyMeetingsClient({ meetings }: { meetings: any[] }) {
    const [view, setView] = useState<"list" | "calendar">("list")

    const now = new Date()
    const upcoming = meetings
        .filter((m: any) => new Date(m.date) >= now)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const past = meetings
        .filter((m: any) => new Date(m.date) < now)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Meetings</h1>
                    <p className="text-muted-foreground">
                        All meetings for groups you lead.
                    </p>
                </div>
                {/* View Toggle */}
                <div className="flex items-center border rounded-lg p-1">
                    <Button
                        variant={view === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setView("list")}
                        className="gap-2"
                    >
                        <LayoutList className="h-4 w-4" />
                        List
                    </Button>
                    <Button
                        variant={view === "calendar" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setView("calendar")}
                        className="gap-2"
                    >
                        <CalendarIconLucide className="h-4 w-4" />
                        Calendar
                    </Button>
                </div>
            </div>

            {view === "calendar" ? (
                <MeetingCalendar meetings={meetings} />
            ) : (
                <>
                    {meetings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center border rounded-lg bg-muted/20">
                            <h3 className="text-lg font-semibold">No meetings found</h3>
                            <p className="text-muted-foreground max-w-sm">
                                You don't have any meetings scheduled for your groups.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Upcoming Meetings */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
                                {upcoming.length === 0 ? (
                                    <p className="text-muted-foreground">No upcoming meetings.</p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {upcoming.map((meeting: any) => (
                                            <MeetingCard key={meeting.id} meeting={meeting} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Past Meetings */}
                            {past.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold text-muted-foreground">Past Meetings</h2>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75">
                                        {past.map((meeting: any) => (
                                            <MeetingCard key={meeting.id} meeting={meeting} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function MeetingCard({ meeting }: { meeting: any }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                        {format(new Date(meeting.date), "PPP p")}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2">
                <Link href={`/dashboard/my-groups/${meeting.groupId}`} className="hover:underline font-semibold block">
                    <div className="flex items-center gap-2 text-primary">
                        <Users className="h-4 w-4" />
                        {meeting.group.name}
                    </div>
                </Link>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{meeting.address}</span>
                </div>

                {meeting.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {meeting.description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
