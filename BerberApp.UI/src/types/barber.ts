export type Barber = {
  id: number;
  shopId: number | null;
  shopName: string;
  fullName: string;
  specialty: string;
  profileImageUrl: string;
};

export type BarberRequest = {
  shopId: number | null;
  fullName: string;
  specialty: string;
  profileImageUrl: string;
};
