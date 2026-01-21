import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/app/admin/actions";
import { UserActions } from "@/components/admin/UserActions";
import { UserDialog } from "@/components/admin/UserDialog";
import { format } from "date-fns";

export default async function UsersPage() {
    const { success, data: users } = await getUsers();

    if (!success || !users) {
        return <div>Failed to load users.</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                <UserDialog />
            </div>

            <div className="flex w-full items-center space-x-2">
                <Input placeholder="Search users..." className="max-w-sm" />
                <Button variant="secondary">Filter</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage user access and roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name || "No Name"}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-xs text-muted-foreground">
                                        Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full font-medium border ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                        user.role === 'LEADER' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            'bg-gray-100 text-gray-700 border-gray-200'
                                        }`}>
                                        {user.role}
                                    </div>
                                    <UserActions
                                        userId={user.id}
                                        currentRole={user.role}
                                        userName={user.name || ""}
                                        userEmail={user.email}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
