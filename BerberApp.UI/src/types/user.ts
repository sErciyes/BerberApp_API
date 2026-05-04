export type User = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "User" | "Admin";
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
};
