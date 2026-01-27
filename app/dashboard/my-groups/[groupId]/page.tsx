import { getGroupDetails } from "@/app/dashboard/actions"
import { MeetingDialog } from "@/components/meetings/MeetingDialog"
import { AttendanceDialog } from "@/components/groups/AttendanceDialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { format } from "date-fns"
import { CalendarIcon, MapPin } from "lucide-react"
import { notFound } from "next/navigation"

export default async function GroupDetailsPage({
    params,
}: {
    params: Promise<{ groupId: string }>
}) {
    const { groupId } = await params
    let group

    try {
        group = await getGroupDetails(groupId)
    } catch (error) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                    <p className="text-muted-foreground">
                        {group.description}
                    </p>
                </div>
                {/* Create Mode */}
                <MeetingDialog groupId={group.id} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{group.weekday}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Leaders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {group.leaders.map(l => l.user.name || l.user.email).join(", ")}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{group.meetings.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Meetings</h2>
                {group.meetings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-muted-foreground">No meetings recorded yet.</p>
                            <p className="text-sm text-muted-foreground">Click "New Meeting" to start.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {group.meetings.map((meeting) => (
                            <Card key={meeting.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">
                                            {format(new Date(meeting.date), "PPP p")}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Attendance */}
                                        <AttendanceDialog meetingId={meeting.id} initialData={meeting.attendance} />
                                        {/* Edit Mode */}
                                        <MeetingDialog groupId={group.id} meeting={meeting} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                        {meeting.description && (
                                            <p>{meeting.description}</p>
                                        )}
                                        <div className="flex items-center gap-1 mt-1">
                                            <span>{meeting.address}</span>
                                        </div>
                                        {meeting.attendance && (
                                            <div className="mt-2 text-xs font-semibold text-primary/80">
                                                Attendance: {meeting.attendance.adultsCount} Adults, {meeting.attendance.kidsCount} Kids
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
