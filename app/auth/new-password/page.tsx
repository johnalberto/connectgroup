"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { newPassword } from "./actions"
import Link from "next/link"

function NewPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams?.get("token")
    const router = useRouter()

    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setMessage("")

        if (!token) {
            setError("Missing token!")
            return
        }

        try {
            const result = await newPassword({ password }, token)
            if (result.error) {
                setError(result.error)
            } else {
                setMessage(result.success || "Password Reset!")
                // Optionally redirect
                setTimeout(() => {
                    router.push("/auth/signin")
                }, 2000)
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return <div className="text-center text-red-500">Invalid or missing token</div>
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">Reset Password</CardTitle>
                <CardDescription>
                    Enter your new password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {message ? (
                    <div className="flex flex-col gap-4 text-center">
                        <p className="text-green-600 font-medium">{message}</p>
                        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
                        <Link href="/auth/signin">
                            <Button variant="outline">Click here if not redirected</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}

export default function NewPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewPasswordForm />
        </Suspense>
    )
}
