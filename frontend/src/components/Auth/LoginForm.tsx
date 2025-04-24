// components/auth/LoginForm.tsx
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { loginUser } from "../../features/auth/authSlice";
import { LoginUserRequest } from "../../types";

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<
    Omit<LoginUserRequest, "faceFrames">
  >({
    email: "",
    password: "",
  });
  const [faceFrames, setfaceFrames] = useState<number[][]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // This function would be called from your face recognition component
  const handleFaceCapture: React.MouseEventHandler<HTMLInputElement> = () => {
    // Assuming you extract face data from somewhere
    const capturedFaceData: number[][] = [
      [0.22, 0.88, 0.56, 0.69, 0.79, 0.24, 0.38, 0.59, 0.81, 0.92],
      [0.21, 0.87, 0.57, 0.7, 0.78, 0.23, 0.37, 0.58, 0.8, 0.93],
      [0.2, 0.86, 0.58, 0.71, 0.77, 0.22, 0.36, 0.57, 0.79, 0.94],
      [0.19, 0.85, 0.59, 0.72, 0.76, 0.21, 0.35, 0.56, 0.78, 0.95],
      [0.18, 0.84, 0.6, 0.73, 0.75, 0.2, 0.34, 0.55, 0.77, 0.96],
      [0.17, 0.83, 0.61, 0.74, 0.74, 0.19, 0.33, 0.54, 0.76, 0.97],
      [0.16, 0.82, 0.62, 0.75, 0.73, 0.18, 0.32, 0.53, 0.75, 0.98],
      [0.15, 0.81, 0.63, 0.76, 0.72, 0.17, 0.31, 0.52, 0.74, 0.99],
      [0.14, 0.8, 0.64, 0.77, 0.71, 0.16, 0.3, 0.51, 0.73, 1.0],
      [0.13, 0.79, 0.65, 0.78, 0.7, 0.15, 0.29, 0.5, 0.72, 1.01],
    ]; // Example
    setfaceFrames(capturedFaceData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (faceFrames.length !== 10) {
      alert("Please complete the face capture process");
      return;
    }

    dispatch(
      loginUser({
        ...formData,
        faceFrames,
      })
    );
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <input type="button" value={"face"} onClick={handleFaceCapture} />

        <div></div>

        {/* Your face recognition component would go here */}
        {/* <FaceRecognition onCapture={handleFaceCapture} /> */}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
