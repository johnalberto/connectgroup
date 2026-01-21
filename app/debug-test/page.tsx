export default function DebugPage() {
    console.log("Rendering Debug Test Page");
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold text-red-600">Debug Page Works!</h1>
            <p>If you see this, the server is working.</p>
        </div>
    )
}
