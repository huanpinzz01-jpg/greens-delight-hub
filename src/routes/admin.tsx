import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BarChart3, LogOut, PackageCheck, ReceiptText, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cartItemLabel, type CartItem, type FlavorId, type Order, type SizeId } from "@/lib/shop-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "營運儀表板｜萍日有光" },
      { name: "description", content: "萍日有光訂單、營收、商品與團購成效管理。" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "overview" | "orders" | "marketing" | "line";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "營運總覽" },
  { id: "orders", label: "訂單管理" },
  { id: "marketing", label: "行銷追蹤" },
  { id: "line", label: "LINE 通知" },
];

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  async function loadOrders() {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error || !data) return;
    setOrders(data.map((row) => {
      const items = Array.isArray(row.items) ? row.items as unknown as CartItem[] : [];
      const primary = items.find((item) => item.product === "seasoned");
      return {
        id: row.order_number,
        name: row.customer_name,
        phone: row.phone,
        email: row.email ?? undefined,
        address: row.address,
        flavor: primary?.flavor ?? "original",
        size: primary?.size ?? "small",
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        amount: row.total,
        items,
        delivery: row.delivery_method,
        note: row.note ?? undefined,
        discountRate: row.discount_rate / 100,
        discountAmount: row.discount_amount,
        status: row.status as Order["status"],
        createdAt: row.created_at,
      };
    }));
  }

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const isAdmin = data.session?.user.app_metadata?.role === "admin";
      setAuthorized(isAdmin);
      if (isAdmin) await loadOrders();
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError("登入失敗，請確認帳號與密碼。");
      setLoading(false);
      return;
    }
    if (data.user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setAuthError("此帳號沒有後台管理權限。");
      setLoading(false);
      return;
    }
    setAuthorized(true);
    await loadOrders();
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAuthorized(false);
    setOrders([]);
  }

  const metrics = useMemo(() => {
    const today = new Date().toLocaleDateString("zh-TW");
    const todayOrders = orders.filter((order) => new Date(order.createdAt).toLocaleDateString("zh-TW") === today);
    const revenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const units = orders.reduce((sum, order) => sum + order.quantity, 0);
    const pending = orders.filter((order) => order.status === "待確認" || order.status === "待出貨").length;
    const groupOrders = orders.filter((order) => (order.discountAmount ?? 0) > 0).length;
    return {
      todayOrders: todayOrders.length,
      revenue,
      units,
      pending,
      average: orders.length ? Math.round(revenue / orders.length) : 0,
      groupRate: orders.length ? Math.round((groupOrders / orders.length) * 100) : 0,
    };
  }, [orders]);

  const topProducts = useMemo(() => {
    const totals = new Map<string, number>();
    orders.flatMap((order) => order.items ?? []).forEach((item) => {
      const label = cartItemLabel(item);
      totals.set(label, (totals.get(label) ?? 0) + item.quantity);
    });
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-cream text-forest">資料載入中…</div>;

  if (!authorized) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-5 text-forest">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-forest/10 bg-white p-8 shadow-[0_30px_80px_rgba(20,60,37,0.12)]">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-moss">Admin</p>
          <h1 className="mt-3 font-serif text-3xl font-black">營運後台登入</h1>
          <p className="mt-3 text-sm leading-6 text-forest/55">僅限已授權管理員查看顧客與訂單資料。</p>
          <label className="mt-7 block text-sm font-bold">管理員 Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-forest/15 px-3 outline-none focus:border-moss" /></label>
          <label className="mt-4 block text-sm font-bold">密碼<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-forest/15 px-3 outline-none focus:border-moss" /></label>
          {authError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{authError}</p>}
          <button className="mt-6 w-full rounded-xl bg-forest py-3.5 font-black text-cream hover:bg-moss">登入後台</button>
          <Link to="/" className="mt-5 block text-center text-sm font-bold text-moss">返回商店</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-forest">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-forest/10 px-5 py-4 shadow-[0_8px_30px_rgba(18,53,36,0.06)] md:px-8">
        <div className="font-serif text-xl font-black md:text-2xl">萍日有光後台</div>
        <div className="flex items-center gap-3"><Link to="/" className="rounded-full border border-forest/20 px-4 py-2 text-xs font-bold">回到商店</Link><button type="button" onClick={handleLogout} className="grid size-9 place-items-center rounded-full bg-forest text-cream" aria-label="登出"><LogOut className="size-4" /></button></div>
      </nav>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 lg:flex-row lg:px-8 lg:py-12">
        <aside className="w-full space-y-1 lg:w-52">
          {TABS.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold ${tab === item.id ? "bg-forest text-cream" : "hover:bg-white"}`}>{item.label}</button>)}
        </aside>

        <main className="min-w-0 flex-1 space-y-8">
          {tab === "overview" && <>
            <div><p className="text-sm font-black uppercase tracking-[0.16em] text-moss">Dashboard</p><h1 className="mt-2 font-serif text-3xl font-black">營運總覽</h1><p className="mt-2 text-sm text-forest/50">依官網實際成立訂單統計</p></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                [ReceiptText, "今日訂單", `${metrics.todayOrders} 筆`],
                [TrendingUp, "累積營業額", `NT$${metrics.revenue.toLocaleString()}`],
                [ShoppingBag, "平均客單", `NT$${metrics.average.toLocaleString()}`],
                [PackageCheck, "銷售件數", `${metrics.units} 件`],
                [BarChart3, "待處理訂單", `${metrics.pending} 筆`],
                [Users, "團購訂單占比", `${metrics.groupRate}%`],
              ].map(([Icon, label, value]) => <div key={String(label)} className="rounded-2xl border border-forest/10 bg-white p-5"><Icon className="size-6 text-moss" /><p className="mt-5 text-sm text-forest/50">{String(label)}</p><p className="mt-1 font-serif text-2xl font-black">{String(value)}</p></div>)}
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-forest/10 bg-white p-6"><h2 className="font-serif text-xl font-black">熱銷商品排行</h2>{topProducts.length ? <div className="mt-5 space-y-4">{topProducts.map(([name, count], index) => <div key={name} className="flex items-center gap-4"><span className="grid size-8 place-items-center rounded-full bg-sand/45 text-sm font-black">{index + 1}</span><span className="flex-1 text-sm font-bold">{name}</span><b>{count} 件</b></div>)}</div> : <EmptyState />}</div>
              <div className="rounded-2xl border border-forest/10 bg-forest p-6 text-cream"><h2 className="font-serif text-xl font-black">建議每日關注</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-cream/70"><li>待確認與待出貨訂單是否清零</li><li>今日營業額與平均客單變化</li><li>團購門檻帶來的折扣與件數</li><li>熱銷口味、重量與搭配商品</li><li>庫存與剩餘效期是否足夠</li></ul></div>
            </div>
          </>}

          {tab === "orders" && <><h1 className="font-serif text-3xl font-black">訂單管理</h1><div className="overflow-x-auto rounded-2xl border border-forest/10 bg-white"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-forest/10 bg-cream/60 text-forest/50"><tr><th className="p-4">單號／時間</th><th className="p-4">訂購人</th><th className="p-4">商品</th><th className="p-4">折扣</th><th className="p-4">金額</th><th className="p-4">狀態</th></tr></thead><tbody className="divide-y divide-forest/10">{orders.map((order) => <tr key={order.id}><td className="p-4"><b>{order.id}</b><span className="mt-1 block text-xs text-forest/45">{new Date(order.createdAt).toLocaleString("zh-TW", { hour12: false })}</span></td><td className="p-4">{order.name}<span className="mt-1 block text-xs text-forest/45">{order.phone}</span></td><td className="max-w-xs p-4 text-forest/65">{(order.items ?? []).map((item) => `${cartItemLabel(item)} × ${item.quantity}`).join("、")}</td><td className="p-4">{order.discountAmount ? `省 NT$${order.discountAmount}` : "原價"}</td><td className="p-4 font-bold">NT${order.amount.toLocaleString()}</td><td className="p-4"><span className="rounded-full bg-sand/35 px-3 py-1 text-xs font-bold">{order.status}</span></td></tr>)}</tbody></table>{!orders.length && <EmptyState />}</div></>}

          {tab === "marketing" && <><h1 className="font-serif text-3xl font-black">行銷追蹤</h1><div className="grid gap-5 md:grid-cols-2"><IntegrationCard title="Meta Pixel" copy="串接後可查看瀏覽商品、加入購物袋與完成訂單的廣告轉換。" /><IntegrationCard title="Google Analytics 4" copy="串接後可查看流量來源、熱門頁面、結帳漏斗與轉換率。" /></div></>}
          {tab === "line" && <><h1 className="font-serif text-3xl font-black">LINE 新訂單通知</h1><IntegrationCard title="LINE Messaging API" copy="串接後，新訂單成立時可自動通知指定官方帳號或管理群組。" /></>}
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return <div className="p-8 text-center text-sm text-forest/45">目前尚無訂單資料</div>;
}

function IntegrationCard({ title, copy }: { title: string; copy: string }) {
  return <div className="rounded-2xl border border-forest/10 bg-white p-6"><span className="rounded-full bg-sand/35 px-3 py-1 text-xs font-bold">尚未串接</span><h2 className="mt-5 font-serif text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-6 text-forest/60">{copy}</p></div>;
}
