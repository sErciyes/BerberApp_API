export type User = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string;
  role: "User" | "Admin" | "Barber" | "ShopAdmin";
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
};
