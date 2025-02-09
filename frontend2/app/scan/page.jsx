"use client";
import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import apiUrl from "@/constants/apiUrl";
import isProtected from '@/hooks/isProtected';

export default function ScanPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [html5Qrcode, setHtml5Qrcode] = useState(null);
    const [selectedTab, setSelectedTab] = useState("lunch"); // Track selected tab (lunch/snack)
    const [message, setMessage] = useState(""); // To display success/error messages
    const [showCamera, setShowCamera] = useState(true); // Control whether to show the camera
    const [isApiCalled, setIsApiCalled] = useState(false); // Track if API call has been made

    useEffect(() => {
        const checkProtection = async () => {
            let protectedStatus = await isProtected();
            if (!protectedStatus) {
                localStorage.removeItem('token');
                router.push('/login');
            }
        };
        checkProtection();
    }, []);

    // Check availability for the selected session (lunch/snack)
    const checkAvailability = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/scan/availability?type=${selectedTab}`);
            setIsAvailable(response.data.isAvailable);
            setIsLoading(false);
        } catch (error) {
            console.error('Error checking availability:', error);
            toast.error("Failed to check availability");
            setIsLoading(false);
        }
    };

    // Start the camera for scanning
    const startCamera = async () => {
        try {
            const qrCodeInstance = new Html5Qrcode("reader");
            setHtml5Qrcode(qrCodeInstance);
            await qrCodeInstance.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                onScanSuccess,
                onScanFailure
            );
        } catch (error) {
            console.error("Error starting camera:", error);
            toast.error("Failed to start camera");
        }
    };

    // Stop the camera
    const stopCamera = async () => {
        if (html5Qrcode) {
            try {
                await html5Qrcode.stop();
                setHtml5Qrcode(null);
            } catch (error) {
                console.error("Error stopping camera:", error);
            }
        }
        setShowCamera(false); // Hide the camera component
    };

    // Handle successful QR code scan
    const onScanSuccess = async (decodedText) => {
        await stopCamera();
        // Prevent multiple API calls
        if (isApiCalled) {
            return;
        }

        // Mark API as called
        setIsApiCalled(true);

        try {
            const response = await axios.post(apiUrl + '/api/scan', {
                type: selectedTab, // Include the selected tab (lunch/snack)
                code: decodedText
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    "x-access-token": localStorage.getItem('token')
                }
            });

            setScanResult(decodedText);
            setMessage(response.data.message || ""); // Set the server response message
            toast.success(response.data.message || "Scan successful!");

            // Stop the camera after scanning
            await stopCamera();

            // Redirect to the completed page with the success message
            router.push(`/scan/completed?message=${encodeURIComponent(response.data.message || "Scan successful!")}`);
        } catch (error) {
            console.error('Error processing scan:', error);
            setMessage(error.response?.data?.error || ""); // Set the error message
            toast.error(error.response?.data?.error || "Failed to process scan");

            // Stop the camera even if there's an error
            await stopCamera();

            // Redirect to the completed page with the error message
            router.push(`/scan/completed?message=${encodeURIComponent(error.response?.data?.error || "Failed to process scan")}`);
        }
    };

    // Handle failed QR code scan
    const onScanFailure = (error) => {
        console.warn(`QR Code scan failed: ${error}`);
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Refresh the page
    const refreshPage = () => {
        window.location.reload(); // Reload the page to reset the state
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end mb-6">
                <Button onClick={() => {
                    localStorage.clear();
                    router.push('/login');
                }}>Logout</Button>
            </div>
            <div className="max-w-3xl mx-auto">
                <Card className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                        <CardTitle className="text-2xl font-bold text-center">
                            QR Code Scanner
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Tabs for switching between Lunch and Snack */}
                        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="lunch">Lunch</TabsTrigger>
                                <TabsTrigger value="snack">Snack</TabsTrigger>
                            </TabsList>
                            <TabsContent value="lunch">
                                {renderScanContent()}
                            </TabsContent>
                            <TabsContent value="snack">
                                {renderScanContent()}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // Helper function to render scan content
    function renderScanContent() {
        if (!isAvailable) {
            return (
                <div className="text-center p-6">
                    <div className="mb-4 text-xl font-semibold text-gray-700">
                        You have already scanned for this session
                    </div>
                    <p className="text-gray-500">
                        Please come back during the next session
                    </p>
                </div>
            );
        }
        return (
            <>
                {/* Show the camera only if `showCamera` is true */}
                {showCamera && !scanResult && !html5Qrcode && (
                    <div className="text-center">
                        <Button
                            onClick={startCamera}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
                        >
                            Open Camera
                        </Button>
                    </div>
                )}
                {showCamera && (
                    <div id="reader" className="mt-4"></div>
                )}
                {showCamera && html5Qrcode && !scanResult && (
                    <div className="text-center mt-4">
                        <Button
                            onClick={stopCamera}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                        >
                            Stop Camera
                        </Button>
                    </div>
                )}
                {/* Show the response message or refresh button */}
                {!showCamera && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        {message ? (
                            <p className={`text-center ${message.includes("successful") ? "text-green-700" : "text-red-700"}`}>
                                {message}
                            </p>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-700">No response received. Please try again.</p>
                                <Button
                                    onClick={refreshPage}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mt-4"
                                >
                                    Refresh and Try Again
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    }
}