"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Calendar, ArrowUpRight, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { AttendanceChart } from "./AttendanceChart"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface LeaderDashboardProps {
    stats: {
        totalMeetings: number
        avgAttendance: number
        totalGroups: number
    }
    upcomingMeetings: any[]
    attendanceHistory: any[]
}

export function LeaderDashboard({ stats, upcomingMeetings, attendanceHistory }: LeaderDashboardProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Leader Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Attendance
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgAttendance}</div>
                        <p className="text-xs text-muted-foreground">
                            Average per meeting
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Meetings
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMeetings}</div>
                        <p className="text-xs text-muted-foreground">
                            Recorded meetings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            My Groups
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGroups}</div>
                        <p className="text-xs text-muted-foreground">
                            Active groups led
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Upcoming */}
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">

                {/* Attendance Chart Section */}
                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="grid gap-2">
                            <CardTitle>Attendance History</CardTitle>
                            <CardDescription>
                                Attendance trends for your groups over time.
                            </CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <BarChart3 className="h-4 w-4" />
                                    Detail
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px]">
                                <DialogHeader>
                                    <DialogTitle>Meeting Attendance Detail</DialogTitle>
                                    <DialogDescription>
                                        Detailed breakdown of adults vs kids attendance per meeting.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <AttendanceChart data={attendanceHistory} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <AttendanceChart data={attendanceHistory} />
                    </CardContent>
                </Card>

                {/* Upcoming Meetings */}
                <Card className="xl:col-span-1">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>Upcoming Meetings</CardTitle>
                            <CardDescription>
                                Next scheduled meetings.
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" className="ml-auto gap-1">
                            <Link href="/dashboard/meetings">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingMeetings.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No upcoming meetings scheduled.</p>
                            ) : (
                                upcomingMeetings.map((meeting) => (
                                    <div key={meeting.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-semibold line-clamp-1">{meeting.group.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(meeting.date), "dd/MMM • h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
