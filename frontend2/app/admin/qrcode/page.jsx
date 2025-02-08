"use client"
import Navbar from "@/components/Navbar/Navbar"
import "./dashboard.css"
export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <p className="title">FLIP CARD</p>
                                <p>Hover Me</p>
                            </div>
                            <div className="flip-card-back">
                                <p className="title">BACK</p>
                                <p>Leave Me</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}