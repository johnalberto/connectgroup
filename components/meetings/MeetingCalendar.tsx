"use client"

import { useState } from "react"
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    parseISO,
    startOfMonth,
    startOfWeek,
    subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Meeting {
    id: string
    date: string | Date
    address: string
    description?: string | null
    groupId: string
    group: {
        name: string
    }
}

interface MeetingCalendarProps {
    meetings: Meeting[]
}

export function MeetingCalendar({ meetings }: MeetingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const reset = () => setCurrentDate(new Date())

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
        <div className="flex flex-col gap-4">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={reset} title="Today">
                        <span className="sr-only">Go to Today</span>
                        <span className="text-xs font-bold border rounded px-1">Today</span>
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
                {/* Weekday Headers */}
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="bg-background p-2 text-center text-sm font-medium text-muted-foreground border-b"
                    >
                        {day}
                    </div>
                ))}

                {/* Days */}
                {calendarDays.map((day, dayIdx) => {
                    const dayMeetings = meetings.filter((meeting) =>
                        isSameDay(new Date(meeting.date), day)
                    )
                    const isCurrentMonth = isSameMonth(day, monthStart)
                    const isToday = isSameDay(day, new Date())

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[100px] bg-background p-2 flex flex-col gap-1 transition-colors hover:bg-muted/50",
                                !isCurrentMonth && "bg-muted/10 text-muted-foreground"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span
                                    className={cn(
                                        "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                        isToday && "bg-primary text-primary-foreground"
                                    )}
                                >
                                    {format(day, "d")}
                                </span>
                            </div>

                            {/* Meetings for this day */}
                            <div className="flex flex-col gap-1 mt-1">
                                {dayMeetings.map((meeting) => (
                                    <Link
                                        key={meeting.id}
                                        href={`/dashboard/my-groups/${meeting.groupId}`}
                                        className="block"
                                    >
                                        <div className="text-xs p-1.5 rounded border bg-card hover:bg-accent/50 hover:text-accent-foreground transition-colors truncate shadow-sm">
                                            <div className="font-semibold truncate">
                                                {meeting.group.name}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                <span>{format(new Date(meeting.date), "p")}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
