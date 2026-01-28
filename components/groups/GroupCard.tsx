import { ConnectorGroup } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { AvatarStack } from "@/components/ui/avatar-stack";

interface GroupCardProps {
    group: ConnectorGroup;
}

export function GroupCard({ group }: GroupCardProps) {
    const nextMeeting = group.meetings?.[0]; // Assuming sorted

    // Map leaders to the format expected by AvatarStack
    const leaders = group.leaders?.map(l => ({
        name: l.user.name,
        image: l.user.image
    })) || [];

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl line-clamp-1" title={group.name}>{group.name}</CardTitle>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                        {group.weekday}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                        {group.description}
                    </p>
                )}

                <div className="space-y-3 pt-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Leaders</span>
                            <AvatarStack users={leaders} size="sm" max={4} />
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                            {leaders.map(l => l.name).join(", ")}
                        </p>
                    </div>

                    {nextMeeting && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                Next Meeting
                            </p>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="font-medium">{new Date(nextMeeting.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate text-muted-foreground">{nextMeeting.address}</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6">
                <Link href={`/groups/${group.id}`} className="w-full">
                    <Button className="w-full font-semibold shadow-sm" variant="default">View Details</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
