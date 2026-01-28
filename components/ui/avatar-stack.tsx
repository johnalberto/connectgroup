import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface AvatarStackProps {
    users: {
        name: string | null;
        image: string | null;
    }[];
    max?: number;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function AvatarStack({ users, max = 3, className, size = "md" }: AvatarStackProps) {
    const visibleUsers = users.slice(0, max);
    const remaining = users.length - max;

    const sizeClasses = {
        sm: "h-6 w-6 text-xs",
        md: "h-8 w-8 text-xs",
        lg: "h-10 w-10 text-sm",
    };

    return (
        <div className={cn("flex items-center -space-x-2 overflow-hidden", className)}>
            <TooltipProvider>
                {visibleUsers.map((user, i) => (
                    <Tooltip key={i}>
                        <TooltipTrigger asChild>
                            <Avatar
                                className={cn(
                                    "ring-2 ring-background transition-transform hover:scale-105 hover:z-10 cursor-default",
                                    sizeClasses[size]
                                )}
                            >
                                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {user.name ? user.name.slice(0, 2).toUpperCase() : "??"}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{user.name ? user.name.split(" ")[0] : "User"}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>

            {remaining > 0 && (
                <div className={cn(
                    "flex items-center justify-center rounded-full bg-muted ring-2 ring-background font-medium text-muted-foreground",
                    sizeClasses[size]
                )}>
                    +{remaining}
                </div>
            )}
        </div>
    );
}
