"use client"
import { useState, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function ScanPage() {
    const [scanResult, setScanResult] = useState(null)
    const [isAvailable, setIsAvailable] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [html5Qrcode, setHtml5Qrcode] = useState(null)

    const checkAvailability = async () => {
        try {
            const response = await axios.get('/api/scan/availability')
            setIsAvailable(response.data.isAvailable)
            setIsLoading(false)
        } catch (error) {
            console.error('Error checking availability:', error)
            toast.error("Failed to check availability")
            setIsLoading(false)
        }
    }

    const startCamera = async () => {
        try {
            const qrCodeInstance = new Html5Qrcode("reader")
            setHtml5Qrcode(qrCodeInstance)

            await qrCodeInstance.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                onScanSuccess,
                onScanFailure
            )
        } catch (error) {
            console.error("Error starting camera:", error)
            toast.error("Failed to start camera")
        }
    }

    const stopCamera = async () => {
        if (html5Qrcode) {
            try {
                await html5Qrcode.stop()
                setHtml5Qrcode(null)
            } catch (error) {
                console.error("Error stopping camera:", error)
            }
        }
    }

    const onScanSuccess = async (decodedText) => {
        try {
            const response = await axios.post('/api/scan', {
                qrCode: decodedText
            })
            
            setScanResult(decodedText)
            await stopCamera()
            toast.success("Scan successful!")
            
            // Refresh availability after successful scan
            checkAvailability()
        } catch (error) {
            console.error('Error processing scan:', error)
            toast.error("Failed to process scan")
        }
    }

    const onScanFailure = (error) => {
        console.warn(`QR Code scan failed: ${error}`)
    }

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Card className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                        <CardTitle className="text-2xl font-bold text-center">
                            QR Code Scanner
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {!isAvailable ? (
                            <div className="text-center p-6">
                                <div className="mb-4 text-xl font-semibold text-gray-700">
                                    You have already scanned for this session
                                </div>
                                <p className="text-gray-500">
                                    Please come back during the next session
                                </p>
                            </div>
                        ) : (
                            <>
                                {!scanResult && !html5Qrcode && (
                                    <div className="text-center">
                                        <Button 
                                            onClick={startCamera}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
                                        >
                                            Open Camera
                                        </Button>
                                    </div>
                                )}
                                <div id="reader" className="mt-4"></div>
                                {html5Qrcode && !scanResult && (
                                    <div className="text-center mt-4">
                                        <Button 
                                            onClick={stopCamera}
                                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                                        >
                                            Stop Camera
                                        </Button>
                                    </div>
                                )}
                                {scanResult && (
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                        <p className="text-green-700 text-center">
                                            Scan completed successfully!
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}