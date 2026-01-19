import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                {/* Mobile Nav is inside Navbar, but we might want a different top bar for Dashboard. 
              For now re-using Navbar but simplified or just Sidebar + Header.
              Let's keep Sidebar separate and use a simple Header here for Mobile Trigger??
              Actually, Sidebar component has hidden on mobile.
              Navbar has Sheet.
          
              Let's use a composite layout.
           */}
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
                    {/* Mobile Sidebar Trigger could go here if we want specific dashboard nav on mobile */}
                    <Navbar />
                </header>
                {/* On Desktop, Navbar is hidden? OR we use Navbar as top-bar? 
              The design requested Sidebar for Admin/Dashboard.
              Let's hide Navbar on Desktop for Dashboard and use Sidebar.
          */}
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
