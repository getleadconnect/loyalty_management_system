import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
  ArrowLeft,
  ScanLine,
  Coins,
  AlertCircle,
  Check,
  Trophy,
  Camera,
  Play,
  StopCircle,
  RefreshCw,
  X
} from 'lucide-react';

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Configure toastr
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: '5000'
  };

  // QR code scanning state
  const [scannedQRData, setScannedQRData] = useState(null);
  const [uniqueId, setUniqueId] = useState('');
  const [points, setPoints] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Alert dialog state for duplicate scans
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Camera scanning state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const html5QrCode = useRef(null);
  const isProcessing = useRef(false);
  const lastScannedCode = useRef(null);
  const scannerInitialized = useRef(false);

  // Recent scans and stats
  const [scanStats, setScanStats] = useState(null);

  useEffect(() => {
    loadScanStats();

    return () => {
      // Cleanup camera on unmount
      stopCamera();
    };
  }, []);

  const loadScanStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('/api/customer/barcode/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setScanStats(response.data);
    } catch (err) {
      console.error('Failed to load scan stats:', err);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setError('');
    isProcessing.current = false;
    lastScannedCode.current = null;

    try {
      // Initialize Html5Qrcode if not already done
      if (!html5QrCode.current) {
        html5QrCode.current = new Html5Qrcode("qr-reader");
        scannerInitialized.current = true;
      }

      const config = {
        fps: 10, // Frames per second for scanning
        qrbox: 250, // Square scanning box (simpler format)
        aspectRatio: 1.0, // Square aspect ratio
        disableFlip: false, // Enable camera flip
        videoConstraints: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: "environment"
        }
      };

      // Success callback when QR code is detected
      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        if (!isProcessing.current) {
          // Check if this is the same code we just scanned
          if (lastScannedCode.current === decodedText) {
            return;
          }

          // Mark as processing and store the scanned code
          isProcessing.current = true;
          lastScannedCode.current = decodedText;

          // Vibrate on mobile devices if supported
          if ('vibrate' in navigator) {
            navigator.vibrate(200);
          }

          handleScanQRCode(decodedText);
          stopCamera();
        }
      };

      // Error callback (optional, for debugging)
      const qrCodeErrorCallback = (errorMessage) => {
        // Ignore "No MultiFormat Readers" errors (normal when no QR code is visible)
        // Only log other errors for debugging
        if (!errorMessage.includes('No MultiFormat Readers')) {
          // console.log('QR scan error:', errorMessage);
        }
      };

      // Start scanning
      // Try to get available cameras first
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          // Use the first available camera (usually back camera on mobile, webcam on desktop)
          const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;

          await html5QrCode.current.start(
            cameraId,
            config,
            qrCodeSuccessCallback,
            qrCodeErrorCallback
          );
        } else {
          throw new Error('No cameras found');
        }
      } catch (deviceError) {
        // Fallback: try with facingMode if camera enumeration fails
        await html5QrCode.current.start(
          { facingMode: { ideal: "environment" } },
          config,
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        );
      }

      setCameraActive(true);
    } catch (err) {
      console.error('Camera start error:', err);

      // Handle specific error messages
      if (err.toString().includes('NotAllowedError')) {
        setCameraError('Camera access denied. Please allow camera permissions.');
      } else if (err.toString().includes('NotFoundError')) {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Failed to access camera. Please check permissions.');
      }

      setCameraActive(false);
      scannerInitialized.current = false;
      html5QrCode.current = null;
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCode.current && scannerInitialized.current) {
        // Check if scanner is currently scanning
        const state = html5QrCode.current.getState();
        if (state === 2) { // Html5QrcodeScannerState.SCANNING
          await html5QrCode.current.stop();
        }
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    } finally {
      setCameraActive(false);
      setCameraError('');
      isProcessing.current = false;

      // Clear the scanner instance for next use
      if (html5QrCode.current) {
        try {
          html5QrCode.current.clear();
        } catch (e) {
          console.log('Clear error:', e);
        }
      }
      scannerInitialized.current = false;
      html5QrCode.current = null;
    }
  };

  const handleScanQRCode = async (qrCode) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post('/api/customer/qrcode/scan',
        { qr_code: qrCode },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setScannedQRData(response.data);
        setUniqueId(response.data.unique_id);
        setPoints(response.data.points);
        setShowModal(true);
        toastr.success('QR code scanned successfully!');
      } else {
        // Show error in AlertDialog
        setAlertMessage(response.data.message || 'Invalid QR code');
        setShowAlertDialog(true);
        setScannedQRData(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to scan QR code';
      // Show error in AlertDialog
      setAlertMessage(errorMessage);
      setShowAlertDialog(true);
      setScannedQRData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessQRCode = async () => {
    if (!scannedQRData) {
      toastr.error('Please scan a QR code first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post('/api/customer/qrcode/process',
        {
          unique_id: uniqueId,
          points: points
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toastr.success(`${response.data.points_earned} points added to your account!`);
        setSuccess(`Successfully earned ${response.data.points_earned} points! New balance: ${response.data.new_balance} points`);

        // Close modal and reset form
        setShowModal(false);
        setScannedQRData(null);
        setUniqueId('');
        setPoints(0);

        // Reload stats
        loadScanStats();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to process QR code';
      toastr.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Custom CSS for html5-qrcode styling */}
      <style>{`
        #qr-reader {
          border-radius: 0.5rem;
          overflow: hidden;
          width: 100%;
          min-height: 300px;
        }
        #qr-reader__dashboard_section {
          display: none !important;
        }
        #qr-reader__camera_selection {
          display: none !important;
        }
        #qr-reader video {
          border-radius: 0.5rem;
          width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        #qr-reader__scan_region {
          border-radius: 0.5rem !important;
          position: relative !important;
        }
        #qr-reader__dashboard_section_csr {
          display: none !important;
        }
        #qr-reader__header_message {
          display: none !important;
        }
        #qr-reader__camera_permission_button {
          display: none !important;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-3 sm:px-6">
          <div className="flex items-center justify-between py-2 sm:py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stopCamera();
                setTimeout(() => {
                  navigate('/customer/dashboard');
                }, 100);
              }}
              className="text-xs sm:text-sm p-1 sm:p-2"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">QR Code Scanner</h1>
            <div className="w-8 sm:w-16"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto w-full">
        {/* Stats Cards - Mobile Optimized */}
        {scanStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-6">
            <Card className="overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col">
                  <p className="text-[10px] sm:text-xs text-gray-600">Today's Scans</p>
                  <p className="text-sm sm:text-2xl font-bold">{scanStats.today_scans}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col">
                  <p className="text-[10px] sm:text-xs text-gray-600">Today's Points</p>
                  <p className="text-sm sm:text-2xl font-bold">{scanStats.today_points}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col">
                  <p className="text-[10px] sm:text-xs text-gray-600">Total Scans</p>
                  <p className="text-sm sm:text-2xl font-bold">{scanStats.total_scans}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col">
                  <p className="text-[10px] sm:text-xs text-gray-600">Total Points</p>
                  <p className="text-sm sm:text-2xl font-bold">{scanStats.points_from_scans}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <Alert className="mb-3 bg-red-50 border-red-200">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription className="text-xs sm:text-sm text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-3 bg-green-50 border-green-200">
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription className="text-xs sm:text-sm text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Content - QR Code Scanner */}
        <div className="space-y-3 sm:space-y-6">
          {/* Scanner Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <ScanLine className="h-4 w-4 sm:h-5 sm:w-5" />
                Scan QR Code
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Point your camera at the QR code to scan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {/* Camera View */}
              <div className="mb-3">
                {cameraError ? (
                  <Alert className="bg-red-50 border-red-200 mb-3">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertDescription className="text-xs sm:text-sm text-red-800">
                      {cameraError}
                    </AlertDescription>
                  </Alert>
                ) : null}

                {/* Scanner Container */}
                <div className="relative rounded-lg overflow-hidden">
                  {/* QR Reader Container */}
                  <div
                    id="qr-reader"
                    className="w-full"
                    style={{
                      display: cameraActive ? 'block' : 'none',
                    }}
                  ></div>

                  {/* Placeholder when camera is not active */}
                  {!cameraActive && (
                    <div className="flex items-center justify-center bg-gray-900 rounded-lg" style={{ aspectRatio: '1/1' }}>
                      <div className="text-center">
                        <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-xs sm:text-sm">Camera not active</p>
                        <p className="text-gray-500 text-[10px] sm:text-xs mt-1">Click "Start Scanning" to begin</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2 mt-3">
                  {!cameraActive ? (
                    <Button
                      onClick={startCamera}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 h-9 sm:h-10"
                      size="sm"
                    >
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="text-xs sm:text-sm">Start Scanning</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={stopCamera}
                      className="flex-1 bg-red-600 hover:bg-red-700 h-9 sm:h-10"
                      size="sm"
                    >
                      <StopCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="text-xs sm:text-sm">Stop Scanning</span>
                    </Button>
                  )}
                  {cameraError && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCameraError('');
                        startCamera();
                      }}
                      className="flex-1 h-9 sm:h-10"
                      size="sm"
                    >
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="text-xs sm:text-sm">Retry</span>
                    </Button>
                  )}
                </div>

                {/* Scanning Status */}
                {cameraActive && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center gap-2">
                      <ScanLine className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 animate-pulse" />
                      <span className="text-xs sm:text-sm text-blue-700 font-medium">Scanning for QR codes...</span>
                    </div>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </main>

      {/* QR Code Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              QR Code Scanned!
            </DialogTitle>
            <DialogDescription>
              Review the scanned QR code details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Unique ID */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Unique ID:</span>
              <span className="font-mono text-sm font-semibold text-gray-900">
                {uniqueId}
              </span>
            </div>

            {/* Points */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Points:</span>
              <span className="flex items-center gap-2 text-lg font-bold text-green-600">
                <Coins className="h-5 w-5 text-yellow-500" />
                {points}
              </span>
            </div>

            {/* Total Points to Add */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Points to Add:</span>
                <span className="text-3xl font-bold text-green-600 flex items-center gap-2">
                  <Coins className="h-8 w-8 text-yellow-500" />
                  {points}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="!flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setScannedQRData(null);
                setUniqueId('');
                setPoints(0);
              }}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button
              onClick={handleProcessQRCode}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Submit & Add Points
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Errors (e.g., Already Scanned) */}
      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              QR Code Already Scanned
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowAlertDialog(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BarcodeScanner;
