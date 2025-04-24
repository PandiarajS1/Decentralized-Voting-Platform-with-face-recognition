// types/index.ts

// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  aadharNumber: string;
  voterId: string;
  blockchainId?: string;
  hasVoted?: boolean;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  otpSent: boolean;
  otpVerified: boolean;
  isLoading: boolean;
  error: string | null;
  registrationSuccess: boolean;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  mobileNumber: string;
  aadharNumber: string;
  voterId: string;
  password: string;
  faceFrames: number[][]; // Array of 10 arrays
}

export interface LoginUserRequest {
  email: string;
  password: string;
  faceFrames: number[][];
}

export interface VerifyOTPRequest {
  email: string | undefined;
  otp: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
}

// Admin Types
export interface AdminState {
  users: User[];
  votingStats: VotingStats | null;
  isLoading: boolean;
  error: string | null;
  blockchainAssignSuccess: boolean;
}

export interface VotingStats {
  totalVoters: number;
  totalVoted: number;
  percentageVoted: number;
  candidateStats: CandidateStats[];
}

export interface CandidateStats {
  candidateId: string;
  candidateName: string;
  votes: number;
  percentage: number;
}

export interface BlockchainIdRequest {
  userId: string;
  blockchainId: string;
}

// User Types
export interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  updateSuccess: boolean;
  voteSuccess: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  mobileNumber: string;
}

export interface CastVoteRequest {
  candidateId: string; // This is the blockchainId
}
