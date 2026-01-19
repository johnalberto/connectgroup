import { ConnectorGroup } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns"; // Will need to install date-fns

interface GroupCardProps {
    group: ConnectorGroup;
}

export function GroupCard({ group }: GroupCardProps) {
    const nextMeeting = group.meetings?.[0]; // Assuming sorted
    const primaryLeader = group.leaders?.[0]?.user;

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {group.weekday}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {group.description}
                    </p>
                )}

                <div className="space-y-2 text-sm">
                    {primaryLeader && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Leader: {primaryLeader.name || 'Unknown'}</span>
                        </div>
                    )}

                    {nextMeeting && (
                        <>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Next: {new Date(nextMeeting.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{nextMeeting.address}</span>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
                <Link href={`/groups/${group.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
