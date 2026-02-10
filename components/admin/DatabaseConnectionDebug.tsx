'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { getDatabaseConnectionInfo } from '@/app/admin/actions'
import { useToast } from '@/components/ui/use-toast'

export function DatabaseConnectionDebug() {
    const [connectionString, setConnectionString] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const { toast } = useToast()

    const checkConnection = async () => {
        setLoading(true)
        try {
            const result = await getDatabaseConnectionInfo()
            if (result.success && result.data) {
                setConnectionString(result.data)
                toast({
                    title: "Connection Checked",
                    description: "Database URL retrieved successfully.",
                })
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to retrieve connection info",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    System Database Connection
                </CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={checkConnection}
                    disabled={loading}
                >
                    {loading ? "Checking..." : "Check Connection"}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                        <p>Verifies the <code>DATABASE_URL</code> currently active in this environment.</p>
                        <p>The password is masked for security.</p>
                    </div>

                    {connectionString ? (
                        <div className="rounded-md bg-muted p-3 font-mono text-xs flex items-center justify-between overflow-hidden">
                            <span className="truncate mr-2">
                                {visible ? connectionString : connectionString.replace(/:([^:@]+)@/, ":******@")}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 shrink-0"
                                onClick={() => setVisible(!visible)}
                            >
                                {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground text-center">
                            Click "Check Connection" to view active database configuration.
                        </div>
                    )}

                    {connectionString && (
                        <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Configuration loaded successfully</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
