'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    console.error("Global Error Caught:", error);
    return (
        <html>
            <body className="p-10">
                <h2 className="text-2xl font-bold text-red-600">Critical Error Caught</h2>
                <p className="mb-4">Something went wrong in the Root Layout.</p>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mb-4">
                    {error.message}
                </pre>
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Try again
                </button>
            </body>
        </html>
    )
}
