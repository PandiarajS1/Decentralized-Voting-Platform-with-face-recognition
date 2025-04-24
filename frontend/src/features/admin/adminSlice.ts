import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";
import {
  AdminState,
  BlockchainIdRequest,
  User,
  VotingStats,
} from "../../types";

// Get All Users
export const getAllUsers = createAsyncThunk<
  { users: User[] },
  void,
  { rejectValue: any }
>("admin/getAllUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/admin/users");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Failed to fetch users" }
    );
  }
});

// Assign Blockchain ID
export const assignBlockchainId = createAsyncThunk<
  { message: string },
  BlockchainIdRequest,
  { rejectValue: any }
>("admin/assignBlockchainId", async (blockchainData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      "/admin/assign-blockchain-id",
      blockchainData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Failed to assign blockchain ID" }
    );
  }
});

// Get Voting Stats
export const getVotingStats = createAsyncThunk<
  VotingStats,
  void,
  { rejectValue: any }
>("admin/getVotingStats", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/admin/voting-stats");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { message: "Failed to fetch voting stats" }
    );
  }
});

const initialState: AdminState = {
  users: [],
  votingStats: null,
  isLoading: false,
  error: null,
  blockchainAssignSuccess: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetBlockchainAssignSuccess: (state) => {
      state.blockchainAssignSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
      })
      .addCase(getAllUsers.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      })

      // Assign Blockchain ID
      .addCase(assignBlockchainId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignBlockchainId.fulfilled, (state) => {
        state.isLoading = false;
        state.blockchainAssignSuccess = true;
      })
      .addCase(
        assignBlockchainId.rejected,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.error =
            action.payload?.message || "Failed to assign blockchain ID";
        }
      )

      // Get Voting Stats
      .addCase(getVotingStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVotingStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.votingStats = action.payload;
      })
      .addCase(getVotingStats.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch voting stats";
      });
  },
});

export const { clearError, resetBlockchainAssignSuccess } = adminSlice.actions;
export default adminSlice.reducer;
