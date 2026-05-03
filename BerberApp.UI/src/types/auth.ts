export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: "User" | "Admin";
  emailConfirmed: boolean;
};

export type AuthActionResponse = {
  message: string;
  developmentToken: string | null;
};
