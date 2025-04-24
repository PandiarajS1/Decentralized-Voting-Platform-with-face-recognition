import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RootState, useAppDispatch, useAppSelector } from "../../app/store";
import {
  loginUser,
  registerUser,
  verifyOTP,
} from "../../features/auth/authSlice";
import {
  LoginUserRequest,
  RegisterUserRequest,
  VerifyOTPRequest,
} from "../../types";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShineBorder } from "../magicui/shine-border";
import clsx from "clsx";
import { Camera } from "lucide-react";

function Auth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSignin, setisSignin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [mobileNumber, setMobileNumber] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const Authemail = useAppSelector(
    (state: RootState) => state.auth.user?.email || undefined
  );
  const otpVerified = useAppSelector(
    (state: RootState) => state.auth.otpVerified
  );
  // const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);
  const isadmin = useAppSelector(
    (state: RootState) => state.auth.user?.role === "admin"
  );
  // data states

  const [LoginformData, setLoginFormData] = useState<
    Omit<LoginUserRequest, "faceFrames">
  >({
    email: "",
    password: "",
  });

  const [SigninformData, setSigninFormData] = useState<
    Omit<RegisterUserRequest, "faceFrames">
  >({
    name: "",
    email: "",
    mobileNumber: "",
    aadharNumber: "",
    voterId: "",
    password: "",
  });

  const [otp, setotp] = useState<VerifyOTPRequest>({
    email: "",
    otp: "",
  });

  // const [faceFrames, setfaceFrames] = useState<number[][]>([
  //   [0.22, 0.88, 0.56, 0.69, 0.79, 0.24, 0.38, 0.59, 0.81, 0.92],
  //   [0.21, 0.87, 0.57, 0.7, 0.78, 0.23, 0.37, 0.58, 0.8, 0.93],
  //   [0.2, 0.86, 0.58, 0.71, 0.77, 0.22, 0.36, 0.57, 0.79, 0.94],
  //   [0.19, 0.85, 0.59, 0.72, 0.76, 0.21, 0.35, 0.56, 0.78, 0.95],
  //   [0.18, 0.84, 0.6, 0.73, 0.75, 0.2, 0.34, 0.55, 0.77, 0.96],
  //   [0.17, 0.83, 0.61, 0.74, 0.74, 0.19, 0.33, 0.54, 0.76, 0.97],
  //   [0.16, 0.82, 0.62, 0.75, 0.73, 0.18, 0.32, 0.53, 0.75, 0.98],
  //   [0.15, 0.81, 0.63, 0.76, 0.72, 0.17, 0.31, 0.52, 0.74, 0.99],
  //   [0.14, 0.8, 0.64, 0.77, 0.71, 0.16, 0.3, 0.51, 0.73, 1.0],
  //   [0.13, 0.79, 0.65, 0.78, 0.7, 0.15, 0.29, 0.5, 0.72, 1.01],
  // ]);

  //// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [faceFrames, setfaceFrames] = useState<number[][]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Initialize camera on component mount
  useEffect(() => {
    initCamera();
    console.log(otpVerified);
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
    setfaceFrames([]);
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
        setfaceFrames([...frames]);

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

  // const submitFaceData = async () => {
  //   if (faceFrames.length < 10) {
  //     setError("Please capture all required frames first.");
  //     return;
  //   }

  //   setIsLoading(true);

  //   console.log(faceFrames);

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/api/auth/register/user",
  //       {
  //         faceData: faceFrames,
  //       }
  //     );

  //     onRegistrationComplete(true, "Face registration successful!");
  //   } catch (err) {
  //     console.error("Registration error:", err);
  //     onRegistrationComplete(
  //       false,
  //       "Face registration failed. Please try again."
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const retryCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    setError("");
    setTimeout(initCamera, 500);
  };
  //// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData({
      ...LoginformData,
      [name]: value,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSigninFormData({
      ...SigninformData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ ...LoginformData, faceFrames });
    if (!isSignin) dispatch(loginUser({ ...LoginformData, faceFrames }));
    else dispatch(registerUser({ ...SigninformData, faceFrames }));

    sendOTP();
  };

  const handleSignin = (e: React.FormEvent) => {
    e.preventDefault();
    setisSignin(!isSignin);
  };

  const sendOTP = () => {
    // In a real application, you would send OTP to the user's mobile number
    console.log(`Sending OTP to ${isAdmin}`);
    setShowOTP(true);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOTPValues = [...otpValues];
      newOTPValues[index] = value;
      setOtpValues(newOTPValues);

      // Move to next input if value is entered
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
    console.log(otpValues);
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTPHandler = () => {
    const otp = otpValues.join("");
    // In a real application, you would verify the OTP with your backend
    console.log(`Verifying OTP: ${otp}`);
    console.log("email :" + Authemail);
    // if (!Authemail) {
    //   console.error("Email is missing!");
    //   return;
    // }

    dispatch(verifyOTP({ email: Authemail, otp }));
    console.log(otpVerified);
    console.log(isAdmin);

    // if (isLogin) {
    //   if (isAdmin) {
    //     navigate("/admin");
    //   } else {
    //     navigate("/dashboard");
    //   }
    // } else {
    //   navigate("/");
    // }
  };

  useEffect(() => {
    if (otpVerified) {
      navigate(isAdmin ? "/admin" : "/dashboard");
    }
  }, [otpVerified, isAdmin, navigate]);

  if (showOTP) {
    return (
      <div className="flex flex-col items-center translate-y-[50%] justify-center w-full h-full gap-5">
        <Card className="relative overflow-hidden">
          <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
          <CardHeader>
            <CardTitle>Enter OTP</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to {mobileNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex gap-2 mb-6">
                {otpValues.map((value, index) => (
                  <Input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ))}
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={verifyOTPHandler} className="w-full">
              verify OTP
            </Button>
          </CardFooter>
        </Card>
        <p className="text-center text-sm text-gray-600">
          Didn't receive the code?{" "}
          <Button
            variant={"secondary"}
            onClick={sendOTP}
            className="text-blue-600 bg-transparent hover:underline"
          >
            Resend OTP
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-12">
      <Card
        className={clsx(
          !isSignin ? "translate-y-[30%]" : "translate-y-[6%]",
          "relative overflow-hidden  md:w-3/5 lg:w-[40%]  sm:w-3/4"
        )}
      >
        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        <CardHeader>
          <CardTitle>{isSignin ? "Sign in" : "Login"}</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSignin ? (
            <form>
              <div className="grid gap-6">
                <div className="flex flex-row justify-between gap-4">
                  <div className="grid gap-2 w-1/2">
                    <Label htmlFor="email">Name</Label>
                    <Input
                      name="name"
                      onChange={handleChange}
                      id="name"
                      type="text"
                      placeholder="moulidharan"
                      value={SigninformData.name}
                      required
                    />
                  </div>
                  <div className="grid gap-2 w-1/2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="mouli@example.com"
                      name="email"
                      onChange={handleChange}
                      value={SigninformData.email}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    name="password"
                    onChange={handleChange}
                    id="password"
                    type="password"
                    placeholder="********"
                    value={SigninformData.password}
                    required
                  />
                </div>
                <div className="flex flex-row justify-between gap-4">
                  <div className="grid gap-2 w-1/2">
                    <Label htmlFor="aadhar">Aadhar Number</Label>
                    <Input
                      id="aadharNumber"
                      type="text"
                      placeholder="8484 2343 1232"
                      name="aadharNumber"
                      onChange={handleChange}
                      value={SigninformData.aadharNumber}
                      required
                    />
                  </div>
                  <div className="grid gap-2 w-1/2">
                    <Label htmlFor="VoterId">Voter Id</Label>
                    <Input
                      name="voterId"
                      onChange={handleChange}
                      id="VoterId"
                      type="text"
                      placeholder="ABC76345M"
                      value={SigninformData.voterId}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    name="mobileNumber"
                    onChange={handleChange}
                    id="mobilenumber"
                    type="tel"
                    placeholder="+91-7339076543"
                    value={SigninformData.mobileNumber}
                    required
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      <Camera /> Capture Face
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] w-4/5">
                    <DialogHeader>
                      <DialogTitle>Capture Your Face</DialogTitle>
                      <DialogDescription>
                        make sure the lighting in the room is clear
                      </DialogDescription>
                    </DialogHeader>
                    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
                      <div className="flex flex-col items-center">
                        <div
                          className="relative w-full max-w-md mb-6 bg-gray-200 rounded-lg overflow-hidden"
                          style={{ height: "320px" }}
                        >
                          {!cameraActive && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-gray-700 mb-4">
                                  Initializing camera...
                                </p>
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
                            className={
                              cameraActive
                                ? "w-full h-full object-cover"
                                : "hidden"
                            }
                            autoPlay
                            playsInline
                            muted
                          />
                          <canvas ref={canvasRef} className="hidden" />

                          {isCapturing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <p className="text-white font-bold text-lg">
                                Capturing... {Math.min(faceFrames.length, 10)}
                                /10
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
                            {progress}% - {faceFrames.length}/10 frames captured
                          </p>
                        </div>

                        {error && (
                          <div className="w-full p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                          </div>
                        )}

                        <div className="flex space-x-4">
                          <Button
                            onClick={startCapture}
                            disabled={
                              isCapturing ||
                              isLoading ||
                              faceFrames.length === 10 ||
                              !cameraActive
                            }
                            className={`px-4 py-2 rounded-lg font-medium focus:outline-none ${
                              isCapturing ||
                              isLoading ||
                              faceFrames.length === 10 ||
                              !cameraActive
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {isCapturing ? "Capturing..." : "Capture Face"}
                          </Button>

                          {/* <button
            onClick={submitFaceData}
            disabled={faceFrames.length < 10 || isLoading}
            className={`px-4 py-2 rounded-lg font-medium focus:outline-none ${
              faceFrames.length < 10 || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Submitting..." : "Submit for Registration"}
          </button> */}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="submit">Submit</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          ) : (
            <form>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    onChange={handleLoginChange}
                    value={LoginformData.email}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    onChange={handleLoginChange}
                    value={LoginformData.password}
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                </div>
                {/* <Button variant={"secondary"} className="w-full">
                  capture face
                </Button> */}
                {/* //// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      <Camera /> Capture Face
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] w-4/5">
                    <DialogHeader>
                      <DialogTitle>Capture Your Face</DialogTitle>
                      <DialogDescription>
                        make sure the lighting in the room is clear
                      </DialogDescription>
                    </DialogHeader>
                    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
                      <div className="flex flex-col items-center">
                        <div
                          className="relative w-full max-w-md mb-6 bg-gray-200 rounded-lg overflow-hidden"
                          style={{ height: "320px" }}
                        >
                          {!cameraActive && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-gray-700 mb-4">
                                  Initializing camera...
                                </p>
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
                            className={
                              cameraActive
                                ? "w-full h-full object-cover"
                                : "hidden"
                            }
                            autoPlay
                            playsInline
                            muted
                          />
                          <canvas ref={canvasRef} className="hidden" />

                          {isCapturing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <p className="text-white font-bold text-lg">
                                Capturing... {Math.min(faceFrames.length, 10)}
                                /10
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
                            {progress}% - {faceFrames.length}/10 frames captured
                          </p>
                        </div>

                        {error && (
                          <div className="w-full p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                          </div>
                        )}

                        <div className="flex space-x-4">
                          <Button
                            onClick={startCapture}
                            disabled={
                              isCapturing ||
                              isLoading ||
                              faceFrames.length === 10 ||
                              !cameraActive
                            }
                            className={`px-4 py-2 rounded-lg font-medium focus:outline-none ${
                              isCapturing ||
                              isLoading ||
                              faceFrames.length === 10 ||
                              !cameraActive
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {isCapturing ? "Capturing..." : "Capture Face"}
                          </Button>

                          {/* <button
            onClick={submitFaceData}
            disabled={faceFrames.length < 10 || isLoading}
            className={`px-4 py-2 rounded-lg font-medium focus:outline-none ${
              faceFrames.length < 10 || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Submitting..." : "Submit for Registration"}
          </button> */}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="submit">Submit</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* ///// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& */}
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            {isSignin ? "Sign In" : "Login"}
          </Button>
        </CardFooter>
      </Card>

      <div className={clsx(!isSignin ? "mt-20" : "", "text-center text-sm")}>
        {!isSignin ? "Don't have an account?" : "Already have an account"}{" "}
        <a
          onClick={handleSignin}
          href="#"
          className="underline underline-offset-4"
        >
          {!isSignin ? "Sign up" : "login"}
        </a>
      </div>
    </div>
  );
}

export default Auth;
