"use client";
import React from 'react';
import { useRouter } from "next/navigation";
export default function CompletedPage() {
    const router = useRouter();

    // Extract the `message` query parameter
    const { message } = router.query || {};

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Scan Completed</h2>
                {/* Display the message if it exists */}
                {message ? (
                    <p className="text-center text-gray-700">{message}</p>
                ) : (
                    <p className="text-center text-red-500">No message received.</p>
                )}
            </div>
        </div>
    );
}