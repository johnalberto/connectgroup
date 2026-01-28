"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProfile } from "@/app/dashboard/actions"
// import { useToast } from "@/components/ui/use-toast" // Assuming toast is available or will use simple alert

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    // const { toast } = useToast()

    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState(session?.user?.name || "")
    const [preview, setPreview] = useState<string | null>(session?.user?.image || null)
    const [imageBase64, setImageBase64] = useState<string | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Reading file and converting to Base64
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setPreview(base64String)
            setImageBase64(base64String)
        }
        reader.readAsDataURL(file)
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await updateProfile({
                name,
                imageBase64: imageBase64 || undefined
            })

            // Update session client-side to reflect changes immediately
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: name,
                    image: imageBase64 || session?.user?.image
                }
            })

            // toast({ title: "Profile updated", description: "Your changes have been saved." })
            alert("Profile updated successfully!")
            router.refresh()
        } catch (error) {
            console.error(error)
            // toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
            alert("Failed to update profile.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        Manage your public profile information.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <Label>Profile Picture</Label>
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={preview || ""} alt={name} />
                                    <AvatarFallback className="text-xl">
                                        {name ? name.slice(0, 2).toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="picture" className="cursor-pointer">
                                        <div className="flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm hover:bg-accent hover:text-accent-foreground">
                                            <Upload className="h-4 w-4" />
                                            Change Picture
                                        </div>
                                    </Label>
                                    <Input
                                        id="picture"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Recommended: Square JPG, PNG. Max 1MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={session?.user?.email || ""}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
