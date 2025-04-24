import React, { useState } from "react";
import FaceCapture from "./FaceRecognition";

function App() {
  const [registrationStatus, setRegistrationStatus] = useState<{
    completed: boolean;
    success: boolean;
    message: string;
  }>({
    completed: false,
    success: false,
    message: "",
  });

  const handleRegistrationComplete = (success: boolean, message: string) => {
    setRegistrationStatus({
      completed: true,
      success,
      message,
    });
  };

  const resetRegistration = () => {
    setRegistrationStatus({
      completed: false,
      success: false,
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Decentralized Voting Application
          </h1>
        </header>

        <main>
          {registrationStatus.completed ? (
            <div
              className={`max-w-md mx-auto p-6 rounded-lg shadow-md ${
                registrationStatus.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <h2
                className={`text-xl font-bold mb-4 ${
                  registrationStatus.success ? "text-green-700" : "text-red-700"
                }`}
              >
                {registrationStatus.success
                  ? "Registration Successful"
                  : "Registration Failed"}
              </h2>
              <p className="mb-6 text-gray-700">{registrationStatus.message}</p>
              <div className="flex justify-center">
                <button
                  onClick={resetRegistration}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {registrationStatus.success ? "Continue" : "Try Again"}
                </button>
              </div>
            </div>
          ) : (
            <FaceCapture onRegistrationComplete={handleRegistrationComplete} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

// import React, { useState } from "react";
// import FaceCapture from "./FaceRecognition"; // Ensure correct import path
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// function App() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [faceData, setFaceData] = useState<number[][] | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const handleRegistrationComplete = (
//     success: boolean,
//     message: string,
//     data?: number[][]
//   ) => {
//     if (success && data) {
//       setFaceData(data);
//     }
//     setIsModalOpen(false);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Username:", username);
//     console.log("Password:", password);
//     console.log("Face Data:", faceData);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 py-8 flex justify-center items-center">
//       <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             placeholder="Username"
//             className="w-full px-4 py-2 border rounded-md"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full px-4 py-2 border rounded-md"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <Button type="button" onClick={() => setIsModalOpen(true)}>
//             Capture Face
//           </Button>
//           {faceData && (
//             <p className="text-sm text-green-600">
//               Face data captured successfully.
//             </p>
//           )}
//           <Button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//           >
//             Login
//           </Button>
//         </form>
//       </div>

//       {/* Face Capture Modal */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Face Capture</DialogTitle>
//           </DialogHeader>
//           <FaceCapture onRegistrationComplete={handleRegistrationComplete} />
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default App;
