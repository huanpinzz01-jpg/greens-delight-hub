import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  loadOrders,
  flavorLabel,
  sizeLabel,
  type Order,
} from "@/lib/shop-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "後台管理 ｜ 瓶瓶罐罐蔬食味" },
      {
        name: "description",
        content: "訂單管理、Meta 與 Google 行銷數據追蹤設定，以及 LINE 通知串接的後台管理系統。",
      },
      { property: "og:title", content: "後台管理 ｜ 瓶瓶罐罐蔬食味" },
      { property: "og:description", content: "訂單、行銷數據與 LINE 通知的整合管理後台。" },
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

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="min-h-screen bg-cream font-sans text-forest">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-forest/10 px-8 py-5 shadow-[0_8px_30px_rgba(18,53,36,0.06)]">
        <div className="font-serif text-2xl font-bold italic tracking-tight">瓶瓶罐罐蔬食味 後台</div>
        <Link
          to="/"
          className="rounded-full border border-forest/20 px-4 py-2 text-xs uppercase tracking-tighter transition-colors hover:border-forest"
        >
          回到官網
        </Link>
      </nav>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-8 py-12 lg:flex-row">
        <aside className="w-full space-y-1 lg:w-56">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded px-4 py-3 text-left text-sm font-medium transition-colors ${
                tab === t.id ? "bg-forest text-cream" : "text-forest/70 hover:bg-card"
              }`}
            >
              {t.label}
            </button>
          ))}
          <p className="px-4 pt-6 text-[10px] leading-relaxed uppercase tracking-widest text-forest/40">
            目前為示範資料
          </p>
        </aside>

        <main className="flex-1 space-y-8">
          {tab === "overview" && (
            <>
              <h1 className="font-serif text-3xl font-bold">營運總覽</h1>
              <div className="grid gap-6 md:grid-cols-4">
                {[
                  { label: "今日訂單", value: `${orders.length} 筆` },
                  { label: "累積營收", value: `NT$ ${revenue.toLocaleString()}` },
                  { label: "廣告轉換率", value: "3.8%" },
                  { label: "客單價", value: "NT$ 1,040" },
                ].map((c) => (
                  <div key={c.label} className="rounded-2xl border border-forest/10 bg-card p-6">
                    <p className="mb-2 text-[10px] uppercase tracking-widest text-forest/40">{c.label}</p>
                    <p className="font-serif text-2xl font-bold">{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { name: "Meta Ads", spend: "NT$ 4,200", roas: "3.4x" },
                  { name: "Google Ads", spend: "NT$ 3,100", roas: "2.8x" },
                  { name: "自然流量", spend: "—", roas: "—" },
                ].map((s) => (
                  <div key={s.name} className="rounded-2xl border border-forest/10 bg-card p-6">
                    <p className="mb-3 font-medium">{s.name}</p>
                    <p className="text-sm text-forest/60">廣告花費 {s.spend}</p>
                    <p className="text-sm text-forest/60">ROAS {s.roas}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              <h1 className="font-serif text-3xl font-bold">訂單管理</h1>
              <div className="overflow-x-auto rounded-2xl border border-forest/10 bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-forest/10 text-forest/40">
                    <tr>
                      <th className="p-4 font-normal">單號</th>
                      <th className="p-4 font-normal">訂購人</th>
                      <th className="p-4 font-normal">聯絡電話</th>
                      <th className="p-4 font-normal">品項</th>
                      <th className="p-4 font-normal">金額</th>
                      <th className="p-4 font-normal">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/5">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="p-4 font-medium">{o.id}</td>
                        <td className="p-4">{o.name}</td>
                        <td className="p-4 text-forest/60">{o.phone}</td>
                        <td className="p-4 text-forest/60">
                          {flavorLabel(o.flavor)} {sizeLabel(o.size)} × {o.quantity}
                        </td>
                        <td className="p-4">NT$ {o.amount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="rounded-full border border-sand/70 bg-sand/25 px-3 py-1 text-[10px] font-bold text-forest">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-forest/40">
                官網送出的訂單會即時顯示於此（目前暫存於瀏覽器，正式串接資料庫後即可跨裝置同步）。
              </p>
            </>
          )}

          {tab === "marketing" && (
            <>
              <h1 className="font-serif text-3xl font-bold">行銷追蹤設定</h1>
              <div className="grid gap-6 md:grid-cols-2">
                <SettingCard
                  title="Meta（Facebook / Instagram）"
                  fields={[
                    { label: "Meta Pixel ID", placeholder: "例：123456789012345" },
                    { label: "轉換 API Token", placeholder: "尚未串接", type: "password" },
                  ]}
                  note="填入 Pixel ID 後，官網瀏覽、加入訂購與完成訂單事件會回傳至 Meta 廣告管理員。"
                />
                <SettingCard
                  title="Google（GA4 / Google Ads）"
                  fields={[
                    { label: "GA4 評估 ID", placeholder: "G-XXXXXXXXXX" },
                    { label: "Google Ads 轉換 ID", placeholder: "AW-XXXXXXXXX" },
                  ]}
                  note="填入後可在 GA4 與 Google Ads 中看到訂單轉換與廣告成效。"
                />
              </div>
            </>
          )}

          {tab === "line" && (
            <>
              <h1 className="font-serif text-3xl font-bold">LINE 通知串接</h1>
              <div className="max-w-2xl space-y-6 rounded-2xl border border-forest/10 bg-card p-8">
                <Field label="LINE Channel Access Token" placeholder="尚未串接" type="password" />
                <Field label="通知對象 User ID / 群組 ID" placeholder="U1234567890abcdef" />
                <div className="flex items-center justify-between border-t border-forest/10 pt-6">
                  <span className="text-sm text-forest/70">新訂單成立時自動發送通知</span>
                  <div className="relative h-5 w-10 rounded-full bg-sand">
                    <div className="absolute right-1 top-1 size-3 rounded-full bg-card"></div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full rounded-sm border border-forest/20 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-forest hover:text-cream"
                >
                  發送測試通知
                </button>
                <p className="text-xs leading-relaxed text-forest/50">
                  目前為示範介面，尚未連線。提供 LINE 官方帳號的 Channel Access Token
                  後即可開通真實通知。
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded border border-forest/10 bg-cream/40 px-4 py-3 text-sm transition-colors focus:border-sand focus:outline-none"
      />
    </div>
  );
}

function SettingCard({
  title,
  fields,
  note,
}: {
  title: string;
  fields: { label: string; placeholder?: string; type?: string }[];
  note: string;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-forest/10 bg-card p-8">
      <h2 className="font-serif text-xl font-bold">{title}</h2>
      {fields.map((f) => (
        <Field key={f.label} {...f} />
      ))}
      <p className="text-xs leading-relaxed text-forest/50">{note}</p>
      <button
        type="button"
        className="rounded-xl bg-forest px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-cream transition-colors hover:bg-moss hover:shadow-md"
      >
        儲存設定
      </button>
    </div>
  );
}
