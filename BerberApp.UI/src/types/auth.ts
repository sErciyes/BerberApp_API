export type LoginRequest = {
  emailOrPhone: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "User" | "Admin";
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
};

export type AuthActionResponse = {
  message: string;
  developmentToken: string | null;
};
