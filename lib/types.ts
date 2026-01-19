export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ConnectorGroup {
    id: string;
    name: string;
    weekday: Weekday;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    leaders?: {
        user: {
            name: string | null;
            image: string | null;
        }
    }[];
    meetings?: {
        date: Date;
        address: string;
    }[];
}
