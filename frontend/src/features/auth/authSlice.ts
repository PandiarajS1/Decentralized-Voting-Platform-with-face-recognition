import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";
import {
  AuthState,
  RegisterUserRequest,
  LoginUserRequest,
  VerifyOTPRequest,
  AuthResponse,
} from "../../types";

// Register User
export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterUserRequest,
  { rejectValue: any }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/auth/register/user", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", "user");
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Registration failed" }
    );
  }
});

// Login User
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginUserRequest,
  { rejectValue: any }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    console.log(credentials);
    const response = await axiosInstance.post("/auth/login/user", credentials);

    // Save token to localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", "user");
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || { message: "Login failed" });
  }
});

// Verify User OTP
export const verifyOTP = createAsyncThunk<
  AuthResponse,
  VerifyOTPRequest,
  { rejectValue: any }
>("auth/verifyOTP", async (otpData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otp", otpData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "OTP verification failed" }
    );
  }
});

// Register Admin
export const registerAdmin = createAsyncThunk<
  AuthResponse,
  RegisterUserRequest,
  { rejectValue: any }
>("auth/registerAdmin", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/auth/register/admin", userData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Admin registration failed" }
    );
  }
});

// Login Admin
export const loginAdmin = createAsyncThunk<
  AuthResponse,
  LoginUserRequest,
  { rejectValue: any }
>("auth/loginAdmin", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/auth/login/admin", credentials);

    // Save token to localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", "admin");
    }

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Admin login failed" }
    );
  }
});

// Verify Admin OTP
export const verifyAdminOTP = createAsyncThunk<
  AuthResponse,
  VerifyOTPRequest,
  { rejectValue: any }
>("auth/verifyAdminOTP", async (otpData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      "/auth/verify-admin-otp",
      otpData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Admin OTP verification failed" }
    );
  }
});

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  return null;
});

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"),
  isAuthenticated: !!localStorage.getItem("token"),
  otpSent: false,
  otpVerified: false,
  isLoading: false,
  error: null,
  registrationSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Registration failed";
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
        state.role = "user";
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
        state.role = "user";
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpVerified = true;
      })
      .addCase(verifyOTP.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || "OTP verification failed";
      })

      // Register Admin
      .addCase(registerAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
        state.registrationSuccess = true;
      })
      .addCase(registerAdmin.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Admin registration failed";
      })

      // Login Admin
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
        state.role = "admin";
      })
      .addCase(loginAdmin.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Admin login failed";
      })

      // Verify Admin OTP
      .addCase(verifyAdminOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyAdminOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpVerified = true;
      })
      .addCase(verifyAdminOTP.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Admin OTP verification failed";
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.role = null;
      });
  },
});

export const { clearError, resetRegistrationSuccess } = authSlice.actions;
export default authSlice.reducer;
