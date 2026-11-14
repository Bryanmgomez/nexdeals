export interface Game {
  id: number;
  title: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  developer?: string;
  publisher?: string;
  genres?: string;
  releaseDate?: string;
  bestPrice?: number;
  bestOriginalPrice?: number;
  bestPriceStore?: string;
  bestDiscount?: number;
}

export interface Offer {
  id: number;
  gameId: number;
  gameTitle: string;
  storeCode: string;
  storeName: string;
  currentPrice: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  currency: string;
  available: boolean;
  region: string;
  url: string;
  lastCheckedAt: string;
}

export interface PricePoint {
  recordedAt: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  currency: string;
  storeCode: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}