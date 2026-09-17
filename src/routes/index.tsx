import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import heroImage from "@/assets/hero-seaweed.jpg";
import {
  FLAVORS,
  SIZES,
  saveOrder,
  type FlavorId,
  type SizeId,
} from "@/lib/shop-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "瓶瓶罐罐蔬食味 ｜ 金門紅毛苔 蔬食海苔專門" },
      {
        name: "description",
        content:
          "天然日曬金門紅毛苔，原味、中藥、薑香三種口味，90g/150g/250g 三種規格，全素可食，線上訂購宅配到府。",
      },
      { property: "og:title", content: "瓶瓶罐罐蔬食味 ｜ 金門紅毛苔" },
      {
        property: "og:description",
        content: "手工採集、天然日曬的蔬食紅毛苔，三種口味與三種規格，線上訂購宅配到府。",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [flavor, setFlavor] = useState<FlavorId>("original");
  const [size, setSize] = useState<SizeId>("medium");
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [submitted, setSubmitted] = useState<string | null>(null);

  const price = useMemo(() => SIZES.find((s) => s.id === size)!.price, [size]);
  const total = price * quantity;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = `#${Math.floor(3000 + Math.random() * 6999)}`;
    saveOrder({
      id,
      name: form.name,
      phone: form.phone,
      address: form.address,
      flavor,
      size,
      quantity,
      amount: total,
      status: "待出貨",
      createdAt: new Date().toLocaleString("zh-TW", { hour12: false }),
    });
    setSubmitted(id);
    setForm({ name: "", phone: "", address: "", note: "" });
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-forest">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-forest/10 px-8 py-6">
        <div className="font-serif text-2xl font-bold italic tracking-tight">瓶瓶罐罐蔬食味</div>
        <div className="hidden gap-8 text-sm font-medium uppercase tracking-widest md:flex">
          <a href="#story" className="transition-colors hover:text-sand">
            品牌故事
          </a>
          <a href="#shop" className="transition-colors hover:text-sand">
            線上訂購
          </a>
          <a href="#contact" className="transition-colors hover:text-sand">
            聯絡我們
          </a>
        </div>
        <div className="flex gap-4">
          <Link
            to="/admin"
            className="rounded-full border border-forest/20 px-4 py-2 text-xs uppercase tracking-tighter transition-colors hover:border-forest"
          >
            Admin Portal
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="story" className="mx-auto grid max-w-7xl gap-16 px-8 py-20 md:grid-cols-2 md:items-center">
        <div>
          <span className="mb-6 inline-block rounded bg-moss/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-moss">
            Traditional Vegan Delicacy
          </span>
          <h1 className="mb-8 font-serif text-6xl font-bold leading-tight md:text-7xl">
            紅毛苔
            <br />
            <span className="italic text-sand">The Sea&apos;s Gift</span>
          </h1>
          <p className="mb-10 max-w-md text-lg leading-relaxed text-forest/80">
            來自金門礁岩的手工採集紅毛苔，天然日曬、全素可食。三種口味、三種規格，
            為餐桌帶回大海最原始的鮮甜與礦物質感。
          </p>
          <a
            href="#shop"
            className="inline-block rounded-sm bg-forest px-10 py-4 text-sm font-bold uppercase tracking-widest text-cream transition-all hover:bg-moss"
          >
            探索口味
          </a>
        </div>
        <div className="relative">
          <img
            src={heroImage}
            alt="白瓷盤上的天然日曬紅毛苔"
            width={1008}
            height={1200}
            className="aspect-[4/5] w-full rounded-sm object-cover"
          />
          <div className="absolute -bottom-8 -left-8 hidden max-w-[200px] bg-sand p-8 text-cream lg:block">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest">Heritage Selection</p>
            <p className="text-sm italic">100% 植物性、營養豐富，適合現代日常的蔬食點心。</p>
          </div>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-16 md:flex-row">
            <div className="w-full space-y-12 md:w-1/2">
              <h2 className="border-b border-forest/10 pb-4 font-serif text-3xl font-bold">訂購選項</h2>

              <div>
                <label className="mb-4 block text-xs font-bold uppercase tracking-widest text-forest/50">
                  Step 01. 選擇口味
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {FLAVORS.map((f) => {
                    const active = f.id === flavor;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFlavor(f.id)}
                        className={`cursor-pointer p-4 text-center transition-all ${
                          active
                            ? "border-2 border-forest bg-forest text-cream"
                            : "border border-forest/20 hover:border-forest"
                        }`}
                      >
                        <span className="mb-1 block font-bold">{f.zh}</span>
                        <span className="text-[10px] uppercase tracking-tighter opacity-60">{f.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-4 block text-xs font-bold uppercase tracking-widest text-forest/50">
                  Step 02. 選擇規格
                </label>
                <div className="space-y-3">
                  {SIZES.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center justify-between rounded border border-forest/10 p-4 transition-colors hover:bg-cream/50"
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="weight"
                          className="accent-sand"
                          checked={size === s.id}
                          onChange={() => setSize(s.id)}
                        />
                        <span className="text-lg font-medium">
                          {s.zh} {s.grams}g
                        </span>
                      </div>
                      <span className="font-bold text-sand">NT$ {s.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-forest/10 pt-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-forest/50">數量</span>
                  <div className="flex items-center border border-forest/10">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-4 py-2 transition-colors hover:bg-cream"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      className="px-4 py-2 transition-colors hover:bg-cream"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-forest/50">合計</p>
                  <p className="font-serif text-3xl font-bold">NT$ {total}</p>
                </div>
              </div>
            </div>

            {/* Customer form */}
            <div className="w-full rounded-lg border border-forest/5 bg-cream/30 p-10 md:w-1/2">
              <h2 className="mb-8 font-serif text-3xl font-bold">收件資料</h2>
              {submitted ? (
                <div className="space-y-6">
                  <p className="font-serif text-2xl italic text-sand">訂單已送出</p>
                  <p className="leading-relaxed text-forest/80">
                    您的訂單編號為 <span className="font-bold">{submitted}</span>，
                    我們將於 1–2 個工作天內與您聯繫確認出貨。
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(null)}
                    className="rounded-sm bg-forest px-8 py-3 text-sm font-bold uppercase tracking-widest text-cream transition-all hover:bg-moss"
                  >
                    再訂一筆
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60">
                        姓名
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        type="text"
                        className="w-full rounded border border-forest/10 bg-card px-4 py-3 transition-colors focus:border-sand focus:outline-none"
                        placeholder="陳大文"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60">
                        聯絡電話
                      </label>
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        type="tel"
                        className="w-full rounded border border-forest/10 bg-card px-4 py-3 transition-colors focus:border-sand focus:outline-none"
                        placeholder="0912-345-678"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60">
                      收件地址
                    </label>
                    <input
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      type="text"
                      className="w-full rounded border border-forest/10 bg-card px-4 py-3 transition-colors focus:border-sand focus:outline-none"
                      placeholder="台北市大安區..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest/60">
                      訂單備註
                    </label>
                    <textarea
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      rows={3}
                      className="w-full resize-none rounded border border-forest/10 bg-card px-4 py-3 transition-colors focus:border-sand focus:outline-none"
                      placeholder="指定配送時間、發票抬頭..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-sm bg-forest py-4 text-sm font-bold uppercase tracking-widest text-cream shadow-lg shadow-forest/20 transition-all hover:bg-moss"
                  >
                    確認送出訂單
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Admin preview */}
      <section className="overflow-hidden bg-forest py-24 text-cream">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-20 lg:flex-row">
            <div className="lg:w-1/3">
              <h3 className="mb-6 font-serif text-4xl font-bold italic">
                Intelligent
                <br />
                Management
              </h3>
              <p className="mb-8 leading-relaxed text-cream/60">
                內建後台管理系統，串接 Meta 與 Google 行銷數據，並透過 LINE
                即時接收訂單通知。目前顯示示範資料，之後可逐步填入正式金鑰。
              </p>
              <div className="space-y-4">
                {["Meta Pixel 追蹤", "Google Ads / GA4", "LINE 訂單通知"].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-sand"></div>
                    <span className="text-sm font-medium">{t}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/admin"
                className="mt-10 inline-block rounded-sm border border-cream/30 px-8 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-cream hover:text-forest"
              >
                進入後台
              </Link>
            </div>

            <div className="rounded-xl border border-cream/10 bg-cream/5 p-6 backdrop-blur-sm lg:w-2/3">
              <div className="mb-8 flex items-center justify-between border-b border-cream/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest">Admin Dashboard v1.0</span>
                <div className="flex gap-2">
                  <div className="size-2 rounded-full bg-cream/20"></div>
                  <div className="size-2 rounded-full bg-cream/20"></div>
                  <div className="size-2 rounded-full bg-cream/20"></div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-cream/5 p-4">
                  <p className="mb-1 text-[10px] uppercase text-cream/40">今日營收</p>
                  <p className="font-serif text-2xl">NT$ 12,480</p>
                </div>
                <div className="rounded-lg bg-cream/5 p-4">
                  <p className="mb-1 text-[10px] uppercase text-cream/40">廣告轉換率</p>
                  <p className="font-serif text-2xl">3.8%</p>
                </div>
                <div className="rounded-lg bg-cream/5 p-4">
                  <p className="mb-1 text-[10px] uppercase text-cream/40">新訂單</p>
                  <p className="font-serif text-2xl text-sand">18</p>
                </div>
              </div>

              <div className="rounded-lg bg-cream/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="size-4 rounded-sm bg-sand"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Recent LINE Notification
                  </span>
                </div>
                <div className="rounded bg-forest/40 p-3 text-sm italic">
                  「新訂單 #2840：中藥口味（250g）× 2，寄送至 台北市大安區⋯」
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-forest/10 px-8 py-12 text-center">
        <p className="mb-4 text-sm text-forest/60">服務信箱 service@pingpingguanguan.tw ｜ 客服專線 (049) 256-3493</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-forest/40">
          &copy; 2026 瓶瓶罐罐蔬食味. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
