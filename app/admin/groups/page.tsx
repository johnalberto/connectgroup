import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getGroups } from "@/app/admin/actions"
import { GroupActions } from "@/components/admin/GroupActions"
import { CreateGroupButton } from "@/components/admin/CreateGroupButton"
import { Users } from "lucide-react"

export default async function GroupsPage() {
    const { success, data: groups } = await getGroups()

    if (!success || !groups) {
        return <div>Failed to load groups.</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Connection Groups</h2>
                <CreateGroupButton />
            </div>

            <div className="flex w-full items-center space-x-2">
                <Input placeholder="Search groups..." className="max-w-sm" />
                <Button variant="secondary">Filter</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Groups</CardTitle>
                    <CardDescription>Manage connection groups and their leaders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {groups.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No groups found. Create one to get started.
                            </div>
                        ) : (
                            groups.map((group) => (
                                <div key={group.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium leading-none">{group.name}</p>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border">
                                                {group.weekday}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            <span>{group.description || "No description"}</span>
                                        </div>
                                        {/* Leaders List */}
                                        <div className="flex items-center gap-1 mt-1">
                                            <Users className="h-3 w-3 text-muted-foreground" />
                                            {group.leaders.length > 0 ? (
                                                <span className="text-xs text-muted-foreground">
                                                    {group.leaders.map(l => l.user.name).join(", ")}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-red-400 italic">No leaders assigned</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-muted-foreground">
                                            {group._count.meetings} meetings
                                        </div>
                                        <GroupActions group={group} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
