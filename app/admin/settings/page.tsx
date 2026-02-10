import { getTemplates } from "@/app/admin/actions"
import { TemplateManager } from "@/components/whatsapp/TemplateManager"

export default async function SettingsPage() {
    const { success, data: templates } = await getTemplates()

    if (!success || !templates) {
        return <div>Failed to load settings.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage application configuration and templates.</p>
            </div>

            <TemplateManager templates={templates} />
        </div>
    )
}
