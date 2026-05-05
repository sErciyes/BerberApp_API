export type Shop = {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  ownerUserId: number | null;
  ownerFullName: string;
  barberCount: number;
  distanceKm: number | null;
};

export type ShopRequest = {
  name: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  ownerUserId: number | null;
};
