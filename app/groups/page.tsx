import { Navbar } from "@/components/layout/Navbar";
import { GroupCard } from "@/components/groups/GroupCard";
import { ConnectorGroup } from "@/lib/types";

// Mock data for now until DB is connected
const MOCK_GROUPS: ConnectorGroup[] = [
    {
        id: "1",
        name: "Northside Youth",
        weekday: "FRIDAY",
        description: "A group for young adults living in the north side.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        leaders: [{ user: { name: "Juan Perez", image: null } }],
        meetings: [{ date: new Date('2026-01-23'), address: "123 Main St, North A" }]
    },
    {
        id: "2",
        name: "Downtown Professionals",
        weekday: "WEDNESDAY",
        description: "Connecting professionals working in downtown.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        leaders: [{ user: { name: "Maria Garcia", image: null } }],
        meetings: [{ date: new Date('2026-01-21'), address: "Central Coffee Shop" }]
    },
    {
        id: "3",
        name: "Families East",
        weekday: "SUNDAY",
        description: "Family focused group meeting after service.",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        leaders: [{ user: { name: "Carlos & Ana", image: null } }],
        meetings: [{ date: new Date('2026-01-25'), address: "Park Ave 456" }]
    }
];

export default function GroupsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Find a Group</h1>
                        <p className="text-muted-foreground">Discover a community that fits your schedule and location.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_GROUPS.map(group => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
