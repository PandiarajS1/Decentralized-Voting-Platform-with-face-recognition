// features/user/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';
import { UpdateProfileRequest, UserState, CastVoteRequest, User } from '../../types';

// Get User Profile
export const getUserProfile = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: any }
>(
  'user/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch profile' });
    }
  }
);

// Update User Profile
export const updateUserProfile = createAsyncThunk<
  { user: User, message: string },
  UpdateProfileRequest,
  { rejectValue: any }
>(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/user/profile', profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update profile' });
    }
  }
);

// Cast Vote
export const castVote = createAsyncThunk<
  { message: string },
  CastVoteRequest,
  { rejectValue: any }
>(
  'user/castVote',
  async (voteData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/user/vote', voteData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to cast vote' });
    }
  }
);

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
  updateSuccess: false,
  voteSuccess: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    resetVoteSuccess: (state) => {
      state.voteSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(getUserProfile.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch profile';
      })
      
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.updateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })
      
      // Cast Vote
      .addCase(castVote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(castVote.fulfilled, (state) => {
        state.isLoading = false;
        state.voteSuccess = true;
      })
      .addCase(castVote.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to cast vote';
      });
  }
});

export const { clearError, resetUpdateSuccess, resetVoteSuccess } = userSlice.actions;
export default userSlice.reducer;