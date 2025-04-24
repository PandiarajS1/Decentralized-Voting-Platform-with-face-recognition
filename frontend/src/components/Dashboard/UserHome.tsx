import { useNavigate } from "react-router-dom";
import { Vote, User, FileCheck, LogOut } from "lucide-react";
import { useAppSelector } from "@/app/store";
import { Button } from "../ui/button";
import { SidebarDemo } from "./Sidebar";

function UserHome() {
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  const handlevote = () => {
    navigate("/id");
  };

  // Mock user data - in a real app, this would come from your authentication context
  const userData = {
    name: user?.name,
    voterId: user?.voterId,
    aadharNumber: user?.aadharNumber,
    mobileNumber: user?.mobileNumber,
  };

  return (
    <div className="">
      <div className="relative h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <User className="w-8 h-8 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800 ml-3">
                Your Profile
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Full Name
                </label>
                <p className="mt-1 text-lg text-gray-900">{userData.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Voter ID
                </label>
                <p className="mt-1 text-lg text-gray-900">{userData.voterId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Aadhar Number
                </label>
                <p className="mt-1 text-lg text-gray-900">
                  {userData.aadharNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Mobile Number
                </label>
                <p className="mt-1 text-lg text-gray-900">
                  {userData.mobileNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Active Elections Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <Vote className="w-8 h-8 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800 ml-3">
                Active Elections
              </h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "Local Council Election 2025",
                  date: "March 15, 2025",
                  status: "Open",
                },
                {
                  title: "State Assembly Election",
                  date: "April 1, 2025",
                  status: "Coming Soon",
                },
              ].map((election, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {election.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Date: {election.date}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        election.status === "Open"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {election.status}
                    </span>
                  </div>
                  {election.status === "Open" && (
                    <Button
                      onClick={handlevote}
                      className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FileCheck className="w-5 h-5 mr-2" />
                      Cast Vote
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserHome;
