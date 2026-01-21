import NextAuth from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')

    if (isOnDashboard || isOnAdmin) {
        if (isLoggedIn) return
        return NextResponse.redirect(new URL('/auth/signin', req.nextUrl))
    }
})

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
}
