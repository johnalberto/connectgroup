import { getMyMeetings } from "../actions"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default async function MyMeetingsPage() {
    const meetings = await getMyMeetings()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Meetings</h1>
                    <p className="text-muted-foreground">
                        Upcoming meetings for groups you lead.
                    </p>
                </div>
            </div>

            {meetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center border rounded-lg bg-muted/20">
                    <h3 className="text-lg font-semibold">No upcoming meetings</h3>
                    <p className="text-muted-foreground max-w-sm">
                        You don't have any upcoming meetings scheduled for your groups.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {meetings.map((meeting) => (
                        <Card key={meeting.id} className="flex flex-col">
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
                    ))}
                </div>
            )}
        </div>
    )
}
