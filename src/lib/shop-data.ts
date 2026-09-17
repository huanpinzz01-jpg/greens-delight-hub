export type FlavorId = "original" | "herbal" | "ginger";
export type SizeId = "large" | "medium" | "small";

export const FLAVORS: { id: FlavorId; zh: string; en: string }[] = [
  { id: "original", zh: "原味", en: "Original" },
  { id: "herbal", zh: "中藥", en: "Herbal" },
  { id: "ginger", zh: "薑香", en: "Ginger" },
];

export const SIZES: { id: SizeId; zh: string; grams: number; price: number }[] = [
  { id: "large", zh: "大包", grams: 250, price: 850 },
  { id: "medium", zh: "中包", grams: 150, price: 550 },
  { id: "small", zh: "小包", grams: 90, price: 380 },
];

export type Order = {
  id: string;
  name: string;
  phone: string;
  address: string;
  flavor: FlavorId;
  size: SizeId;
  quantity: number;
  amount: number;
  status: "待出貨" | "運送中" | "已完成";
  createdAt: string;
};

export const DEMO_ORDERS: Order[] = [
  {
    id: "#2840",
    name: "陳惠敏",
    phone: "0912-345-678",
    address: "台北市大安區復興南路一段 100 號",
    flavor: "herbal",
    size: "large",
    quantity: 2,
    amount: 1700,
    status: "待出貨",
    createdAt: "2026-09-16 14:22",
  },
  {
    id: "#2839",
    name: "張泰山",
    phone: "0922-118-902",
    address: "台中市西屯區market路 3 號",
    flavor: "original",
    size: "medium",
    quantity: 1,
    amount: 550,
    status: "運送中",
    createdAt: "2026-09-16 10:05",
  },
  {
    id: "#2838",
    name: "林建宏",
    phone: "0933-771-220",
    address: "高雄市左營區博愛二路 55 號",
    flavor: "ginger",
    size: "small",
    quantity: 3,
    amount: 1140,
    status: "已完成",
    createdAt: "2026-09-15 19:48",
  },
];

const STORAGE_KEY = "pingpingguanguan.orders";

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
    /* ignore */
  }
}

export function flavorLabel(id: FlavorId) {
  return FLAVORS.find((f) => f.id === id)?.zh ?? id;
}

export function sizeLabel(id: SizeId) {
  const s = SIZES.find((x) => x.id === id);
  return s ? `${s.zh} ${s.grams}g` : id;
}
