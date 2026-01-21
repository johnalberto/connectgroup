import { getLeaderGroups } from "../actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"

export default async function MyGroupsPage() {
    const groups = await getLeaderGroups()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Groups</h1>
                    <p className="text-muted-foreground">
                        Manage the groups you are leading.
                    </p>
                </div>
            </div>

            {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center border rounded-lg bg-muted/20">
                    <h3 className="text-lg font-semibold">No groups found</h3>
                    <p className="text-muted-foreground max-w-sm">
                        You haven't been assigned as a leader to any connection group yet.
                        Please contact an administrator.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Card key={group.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>{group.name}</CardTitle>
                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                                            {group.weekday}
                                        </div>
                                    </div>
                                </div>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {group.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{group._count.meetings} Meetings</span>
                                    </div>
                                    {/* Additional stats could go here */}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/my-groups/${group.id}`}>
                                        Manage Group
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
