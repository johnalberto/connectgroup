"use client"

import { format } from "date-fns"
import { useState } from "react"

interface AttendanceData {
    date: Date | string
    name?: string // Meeting/Group Name
    adults: number
    kids: number
    total?: number
}

interface AttendanceChartProps {
    data: AttendanceData[]
}

export function AttendanceChart({ data }: AttendanceChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                No attendance data available
            </div>
        )
    }

    // Configuration
    const height = 350
    const width = 800
    const padding = { top: 40, right: 30, bottom: 60, left: 50 }

    // Scales
    const maxVal = Math.max(...data.map(d => Math.max(d.adults, d.kids)), 5)
    const yMax = Math.ceil(maxVal * 1.1) // 10% headroom

    const getX = (index: number) => {
        const chartWidth = width - padding.left - padding.right
        const step = chartWidth / (Math.max(data.length - 1, 1))
        return padding.left + (index * step)
    }

    const getY = (value: number) => {
        const chartHeight = height - padding.top - padding.bottom
        const percentage = value / yMax
        return height - padding.bottom - (percentage * chartHeight)
    }

    // Bezier Curve Logic for smooth lines
    const generateSmoothPath = (key: 'adults' | 'kids') => {
        if (data.length === 0) return ""
        if (data.length === 1) return `M ${getX(0)} ${getY(data[0][key])} h 10` // Line for single point

        let d = `M ${getX(0)} ${getY(data[0][key])}`

        for (let i = 0; i < data.length - 1; i++) {
            const x0 = getX(i)
            const y0 = getY(data[i][key])
            const x1 = getX(i + 1)
            const y1 = getY(data[i + 1][key])

            // Control points for bezier (smoothness)
            const cpx1 = x0 + (x1 - x0) * 0.4
            const cpy1 = y0
            const cpx2 = x1 - (x1 - x0) * 0.4
            const cpy2 = y1

            d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x1} ${y1}`
        }
        return d
    }

    return (
        <div className="w-full h-full min-h-[350px] relative font-sans select-none">
            {/* Legend */}
            <div className="absolute top-0 right-4 flex gap-4 text-xs font-medium z-10">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <span className="text-muted-foreground">Adults</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                    <span className="text-muted-foreground">Children</span>
                </div>
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
            >
                {/* Y-Axis Grid & Labels */}
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => {
                    const y = height - padding.bottom - (tick * (height - padding.top - padding.bottom))
                    return (
                        <g key={tick}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                stroke="hsl(var(--border))"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                                opacity="0.5"
                            />
                            <text
                                x={padding.left - 10}
                                y={y + 4}
                                textAnchor="end"
                                className="fill-muted-foreground text-[11px] font-medium"
                            >
                                {Math.round(tick * yMax)}
                            </text>
                        </g>
                    )
                })}

                {/* Lines */}
                {/* Kids - Blue #3b82f6 */}
                <path
                    d={generateSmoothPath('kids')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />

                {/* Adults - Red #ef4444 */}
                <path
                    d={generateSmoothPath('adults')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />

                {/* Interactivity & Points */}
                {data.map((d, i) => (
                    <g key={i}>
                        {/* X-Axis Labels (Date + Name) */}
                        {/* Only show label if it fits or we have few items. Alternating if many. */}
                        {(data.length <= 8 || i % 2 === 0) && (
                            <text
                                x={getX(i)}
                                y={height - padding.bottom + 20}
                                textAnchor="middle"
                                className="fill-muted-foreground text-[10px] font-medium"
                            >
                                <tspan x={getX(i)} dy="0">{format(new Date(d.date), "dd-MMM")}</tspan>
                                {/* Uncomment if group name is needed in X-axis (can be cluttered) */}
                                {/* <tspan x={getX(i)} dy="12" className="fill-muted-foreground/70">{d.group?.name.slice(0, 6)}...</tspan> */}
                            </text>
                        )}

                        {/* Hover Trigger Zone */}
                        <rect
                            x={getX(i) - (width / data.length / 2)}
                            y={padding.top}
                            width={width / data.length}
                            height={height - padding.top - padding.bottom}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />

                        {/* Data Points (Visible on Hover or if few points) */}
                        {(hoveredIndex === i || data.length < 15) && (
                            <>
                                <circle
                                    cx={getX(i)}
                                    cy={getY(d.adults)}
                                    r={hoveredIndex === i ? 6 : 4}
                                    fill="#ef4444"
                                    className="stroke-background stroke-[2px] transition-all duration-200"
                                />
                                <circle
                                    cx={getX(i)}
                                    cy={getY(d.kids)}
                                    r={hoveredIndex === i ? 6 : 4}
                                    fill="#3b82f6"
                                    className="stroke-background stroke-[2px] transition-all duration-200"
                                />

                                {/* Vertical Indicator Line on Hover */}
                                {hoveredIndex === i && (
                                    <line
                                        x1={getX(i)}
                                        y1={padding.top}
                                        x2={getX(i)}
                                        y2={height - padding.bottom}
                                        stroke="hsl(var(--foreground))"
                                        strokeDasharray="2 2"
                                        strokeWidth="1"
                                        opacity="0.3"
                                        pointerEvents="none"
                                    />
                                )}
                            </>
                        )}
                    </g>
                ))}
            </svg>

            {/* Premium Tooltip */}
            {hoveredIndex !== null && data[hoveredIndex] && (
                <div
                    className="absolute z-50 bg-popover text-popover-foreground border shadow-xl rounded-lg p-3 text-xs pointer-events-none transform -translate-x-1/2 transition-all duration-75"
                    style={{
                        left: `${(getX(hoveredIndex) / width) * 100}%`,
                        top: 0
                    }}
                >
                    <div className="font-bold mb-1 text-sm border-b pb-1">
                        {data[hoveredIndex].name || format(new Date(data[hoveredIndex].date), "dd-MMM")}
                    </div>
                    {data[hoveredIndex].name && (
                        <div className="text-[10px] text-muted-foreground mb-2">
                            {format(new Date(data[hoveredIndex].date), "PPP")}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                            <span className="font-medium text-muted-foreground">Adults</span>
                        </div>
                        <span className="font-bold text-base">{data[hoveredIndex].adults}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                            <span className="font-medium text-muted-foreground">Kids</span>
                        </div>
                        <span className="font-bold text-base">{data[hoveredIndex].kids}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
