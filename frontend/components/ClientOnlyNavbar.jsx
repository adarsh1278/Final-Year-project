'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';

export default function ClientOnlyNavbar() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Return a simple navbar for server-side rendering to avoid hydration mismatch
        return (
            <div className="sticky top-0 z-40 w-full border-b border-gray-300 bg-blue-900 text-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex justify-center items-center">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold tracking-wide">GrievEase</span>
                                <span className="text-xs font-light text-yellow-100">Government of India | Public Grievance Portal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <Navbar />;
}
