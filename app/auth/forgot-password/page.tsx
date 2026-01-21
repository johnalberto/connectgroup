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
import { useState } from "react"
import { resetPasswordRequest } from "../new-password/actions"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        setError("")

        try {
            const result = await resetPasswordRequest({ email })
            if (result.error) {
                setError(result.error)
            } else {
                setMessage(result.success || "Check your email!")
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email to receive a reset link.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {message ? (
                    <div className="flex flex-col gap-4 text-center">
                        <p className="text-green-600 font-medium">{message}</p>
                        <Link href="/auth/signin">
                            <Button variant="outline">Back to Login</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                        <div className="text-center text-sm">
                            <Link href="/auth/signin" className="underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
