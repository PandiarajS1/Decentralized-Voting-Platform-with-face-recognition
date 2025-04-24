import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

interface FaceCaptureProps {
  onRegistrationComplete: (success: boolean, message: string) => void;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({
  onRegistrationComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedFrames, setCapturedFrames] = useState<number[][]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Initialize camera on component mount
  useEffect(() => {
    initCamera();

    // Cleanup on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);

          // Initialize canvas size once video is loaded
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            console.log(
              `Canvas initialized: ${canvasRef.current.width}x${canvasRef.current.height}`
            );
          }
        };
      }
    } catch (err) {
      console.error("Camera initialization error:", err);
      setError(
        "Failed to access camera. Please ensure camera permissions are granted and try again."
      );
    }
  };

  const processFrame = (imageData: ImageData): number[] => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Simple downsampling to create numeric representation
    const result: number[] = [];
    const step = 10; // Sample every 10th pixel for performance

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const pixelIndex = (y * width + x) * 4;
        // Convert RGB to grayscale
        const gray = Math.floor(
          0.299 * data[pixelIndex] +
            0.587 * data[pixelIndex + 1] +
            0.114 * data[pixelIndex + 2]
        );
        result.push(gray);
      }
    }

    return result;
  };

  const startCapture = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) {
      setError("Camera not ready. Please reload the page and try again.");
      return;
    }

    setIsCapturing(true);
    setCapturedFrames([]);
    setProgress(0);
    setError("");

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    if (!context) {
      setError("Could not initialize canvas context");
      setIsCapturing(false);
      return;
    }

    let frameCount = 0;
    const maxFrames = 10;
    const frames: number[][] = [];

    const captureFrame = () => {
      try {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data from canvas
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Process frame to numeric data
        const frameData = processFrame(imageData);
        frames.push(frameData);

        frameCount++;
        const newProgress = Math.round((frameCount / maxFrames) * 100);
        setProgress(newProgress);

        // Update state with new frames
        setCapturedFrames([...frames]);

        if (frameCount < maxFrames) {
          // Continue capturing frames
          setTimeout(captureFrame, 300);
        } else {
          // Finished capturing
          setIsCapturing(false);
        }
      } catch (err) {
        console.error("Frame capture error:", err);
        setError("Error capturing video frame. Please try again.");
        setIsCapturing(false);
      }
    };

    // Start the capture process
    captureFrame();
  };

  const submitFaceData = async () => {
    if (capturedFrames.length < 10) {
      setError("Please capture all required frames first.");
      return;
    }

    setIsLoading(true);

    console.log(capturedFrames);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register/user",
        {
          faceData: capturedFrames,
        }
      );

      onRegistrationComplete(true, "Face registration successful!");
    } catch (err) {
      console.error("Registration error:", err);
      onRegistrationComplete(
        false,
        "Face registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const retryCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    setError("");
    setTimeout(initCamera, 500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Face Registration</h2>
      <p className="text-gray-600 text-center mb-6">
        We need to capture 10 frames of your face for verification purposes.
      </p>

      <div className="flex flex-col items-center">
        <div
          className="relative w-full max-w-md mb-6 bg-gray-200 rounded-lg overflow-hidden"
          style={{ height: "320px" }}
        >
          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-700 mb-4">Initializing camera...</p>
                <button
                  onClick={retryCamera}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Retry Camera Access
                </button>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            className={cameraActive ? "w-full h-full object-cover" : "hidden"}
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <p className="text-white font-bold text-lg">
                Capturing... {Math.min(capturedFrames.length, 10)}/10
              </p>
            </div>
          )}
        </div>

        <div className="w-full mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {progress}% - {capturedFrames.length}/10 frames captured
          </p>
        </div>

        {error && (
          <div className="w-full p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={startCapture}
            disabled={
              isCapturing ||
              isLoading ||
              capturedFrames.length === 10 ||
              !cameraActive
            }
            className={`px-4 py-2 rounded-lg font-medium focus:outline-none ${
              isCapturing ||
              isLoading ||
              capturedFrames.length === 10 ||
              !cameraActive
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isCapturing ? "Capturing..." : "Capture Face"}
          </button>

          <button
            onClick={submitFaceData}
            disabled={capturedFrames.length < 10 || isLoading}
            className={`px-4 py-2 rounded-lg font-medium focus:outline-none ${
              capturedFrames.length < 10 || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Submitting..." : "Submit for Registration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceCapture;
