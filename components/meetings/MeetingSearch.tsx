"use client"

import * as React from "react"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export function MeetingSearch() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        const from = searchParams.get("from")
        const to = searchParams.get("to")
        if (from) {
            return {
                from: new Date(from),
                to: to ? new Date(to) : undefined
            }
        }
        return undefined
    })

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("q", term)
        } else {
            params.delete("q")
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleDateSelect = (range: DateRange | undefined) => {
        setDate(range)
        const params = new URLSearchParams(searchParams)
        if (range?.from) {
            params.set("from", range.from.toISOString())
        } else {
            params.delete("from")
        }
        if (range?.to) {
            params.set("to", range.to.toISOString())
        } else {
            params.delete("to")
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-3xl">
            <div className="relative w-full sm:flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search meetings (e.g. 'Youth', 'Bible Study')..."
                    className="pl-8"
                    defaultValue={searchParams.get("q")?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <div className="grid gap-2 w-full sm:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal sm:w-[300px]",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
