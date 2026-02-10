import { auth } from "@/lib/auth"
import { getAdminStats } from "@/app/admin/actions"
import { getGroupAttendanceHistory, getLeaderStats, getMyMeetings } from "./actions"
import { AdminDashboard } from "@/components/dashboard/AdminDashboard"
import { LeaderDashboard } from "@/components/dashboard/LeaderDashboard"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin")
    }

    if (session.user.role === "ADMIN") {
        const [stats, groupsResult] = await Promise.all([
            getAdminStats(),
            import("@/app/admin/actions").then(mod => mod.getGroups())
        ])
        const groups = (groupsResult.success && groupsResult.data) ? groupsResult.data : []
        return <AdminDashboard stats={stats} groups={groups} />
    } else {
        // Leader View
        const [stats, meetings, history] = await Promise.all([
            getLeaderStats(),
            getMyMeetings(),
            getGroupAttendanceHistory()
        ])

        const upcomingMeetings = meetings
            .filter(m => new Date(m.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)

        return (
            <LeaderDashboard
                stats={stats}
                upcomingMeetings={upcomingMeetings}
                attendanceHistory={history}
            />
        )
    }
}

