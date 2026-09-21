export type FlavorId = "original" | "herbal" | "ginger";
export type SizeId = "large" | "medium" | "small";

export const FLAVORS: {
  id: FlavorId;
  zh: string;
  note: string;
  accent: string;
}[] = [
  { id: "original", zh: "原味", note: "海味最純粹｜價格最高", accent: "人氣首選" },
  { id: "herbal", zh: "中藥風味", note: "溫潤回甘、香氣有層次", accent: "經典風味" },
  { id: "ginger", zh: "麻油薑香", note: "薑香暖口、越嚼越香", accent: "暖香推薦" },
];

export const SIZES: { id: SizeId; zh: string; grams: number; note: string }[] = [
  { id: "small", zh: "小包", grams: 90, note: "初次嘗鮮" },
  { id: "medium", zh: "中包", grams: 150, note: "家庭分享" },
  { id: "large", zh: "大包", grams: 250, note: "常吃更划算" },
];

export const PRICE_MATRIX: Record<FlavorId, Record<SizeId, number>> = {
  original: { small: 350, medium: 535, large: 880 },
  herbal: { small: 320, medium: 515, large: 850 },
  ginger: { small: 320, medium: 515, large: 850 },
};

export const RAW_SHEET = {
  id: "raw-sheet" as const,
  name: "無調味紅毛苔原片",
  grams: 300,
  price: 1050,
};

export type CartItem = {
  key: string;
  product: "seasoned" | "raw";
  name: string;
  flavor?: FlavorId;
  size?: SizeId;
  grams: number;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  flavor: FlavorId;
  size: SizeId;
  quantity: number;
  amount: number;
  items?: CartItem[];
  delivery?: string;
  note?: string;
  status: "待確認" | "待出貨" | "運送中" | "已完成";
  createdAt: string;
};

export const DEMO_ORDERS: Order[] = [];

const STORAGE_KEY = "pingpingguanguan.orders";

export function getPrice(flavor: FlavorId, size: SizeId) {
  return PRICE_MATRIX[flavor][size];
}

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return DEMO_ORDERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_ORDERS;
    const parsed = JSON.parse(raw) as Order[];
    return [...parsed, ...DEMO_ORDERS];
  } catch {
    return DEMO_ORDERS;
  }
}

export function saveOrder(order: Order) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as Order[]) : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existing]));
  } catch {
    /* Browser storage is only a resilience fallback for the current device. */
  }
}

export function flavorLabel(id: FlavorId) {
  return FLAVORS.find((flavor) => flavor.id === id)?.zh ?? id;
}

export function sizeLabel(id: SizeId) {
  const size = SIZES.find((item) => item.id === id);
  return size ? `${size.zh} ${size.grams}g` : id;
}

export function cartItemLabel(item: CartItem) {
  if (item.product === "raw") return `${item.name} ${item.grams}g`;
  return `${flavorLabel(item.flavor!)} ${sizeLabel(item.size!)}`;
}
