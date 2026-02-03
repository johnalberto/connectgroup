"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Calendar, ArrowUpRight, Activity, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AttendanceChart } from "./AttendanceChart"
import { getGroupAttendanceHistory } from "@/app/dashboard/actions"

interface AdminDashboardProps {
    stats: {
        totalGroups: number
        totalUsers: number
        avgAttendance: number
        activeGroupsCount: number
    }
    groups: any[]
}

export function AdminDashboard({ stats, groups }: AdminDashboardProps) {
    const [selectedGroupStats, setSelectedGroupStats] = useState<{ name: string, data: any[] } | null>(null)
    const [loadingStats, setLoadingStats] = useState(false)
    const [isStatsOpen, setIsStatsOpen] = useState(false)

    const handleViewStats = async (group: any) => {
        setLoadingStats(true)
        setIsStatsOpen(true)
        setSelectedGroupStats({ name: group.name, data: [] }) // Reset/Set name

        try {
            const history = await getGroupAttendanceHistory(group.id)
            setSelectedGroupStats({ name: group.name, data: history })
        } catch (error) {
            console.error("Failed to fetch stats", error)
        } finally {
            setLoadingStats(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Admin Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Groups
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGroups}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Groups (30d)
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeGroupsCount}</div>
                    </CardContent>
                </Card>
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
                            Per meeting
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Groups List */}
            <div className="grid gap-4 md:gap-8">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>All Groups</CardTitle>
                            <CardDescription>
                                Overview of all connection groups.
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" className="ml-auto gap-1">
                            <Link href="/dashboard/my-groups">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {groups.map((group) => (
                                <div key={group.id} className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{group.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {group._count.meetings} meetings recorded
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {group.leaders.map((leader: any) => (
                                                <div key={leader.user.email} className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] overflow-hidden" title={leader.user.name}>
                                                    {leader.user.image ? (
                                                        <img src={leader.user.image} alt={leader.user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span>{leader.user.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 hidden sm:flex"
                                                onClick={() => handleViewStats(group)}
                                            >
                                                <BarChart3 className="h-3 w-3" />
                                                Statistics
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="sm:hidden"
                                                onClick={() => handleViewStats(group)}
                                            >
                                                <BarChart3 className="h-4 w-4" />
                                            </Button>

                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/my-groups/${group.id}`}>
                                                    Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics Dialog */}
            <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>{selectedGroupStats?.name || "Group"} Statistics</DialogTitle>
                        <DialogDescription>
                            Attendance history for this group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {loadingStats ? (
                            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                                Loading stats...
                            </div>
                        ) : (
                            <AttendanceChart data={selectedGroupStats?.data || []} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
