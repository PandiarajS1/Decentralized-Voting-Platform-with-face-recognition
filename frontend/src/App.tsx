import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Auth from "./components/Auth";
import LandingPage from "./components/Home/LandingPage";
import AdminPanel from "./components/Dashboard/AdminPanel";
import UserHome from "./components/Dashboard/UserHome";
import Voteid from "./components/Vote/Voteid";
import Navbar from "./components/Home/Navbar";
import Auth from "./components/Auth/Auth";
import ProtectedRoute from "./ProtectedRoute";
import Faceapp from "./components/Auth/Faceapp";

const App: React.FC = () => {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/face" element={<Faceapp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/dashboard" element={<UserHome />} />
            <Route path="/id" element={<Voteid />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
