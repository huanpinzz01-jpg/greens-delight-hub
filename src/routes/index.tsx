import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import heroLifestyle from "@/assets/shop/hero-lifestyle.webp";
import platedRedSeaweed from "@/assets/shop/plated-red-seaweed.webp";
import packageLabel from "@/assets/shop/package-label.webp";
import redSeaweedCloseup from "@/assets/shop/red-seaweed-closeup.webp";
import redSeaweedServing from "@/assets/shop/red-seaweed-serving.webp";
import energyPowder from "@/assets/shop/energy-powder.webp";
import furikake from "@/assets/shop/furikake.webp";
import mushroomPowder from "@/assets/shop/mushroom-powder.webp";
import nutCracker from "@/assets/shop/nut-cracker.webp";
import {
  FLAVORS,
  OTHER_PRODUCTS,
  RAW_SHEET,
  SIZES,
  cartItemLabel,
  getGroupDiscount,
  getPrice,
  saveOrder,
  type CartItem,
  type FlavorId,
  type SizeId,
} from "@/lib/shop-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "萍日有光｜紅毛苔・天然蔬食・日常選物" },
      {
        name: "description",
        content: "原味、中藥風味、麻油薑香三種烘焙紅毛苔，依口味與重量清楚選購；另有無調味原片。官網直接下單。",
      },
      { property: "og:title", content: "萍日有光｜紅毛苔・天然蔬食・日常選物" },
      { property: "og:description", content: "從紅毛苔出發的天然蔬食與日常選物。" },
    ],
  }),
  component: Storefront,
});

const PRODUCT_IMAGES = [
  { src: redSeaweedServing, alt: "盤中酥香紅毛苔近拍" },
  { src: redSeaweedCloseup, alt: "烘焙紅毛苔酥脆片狀特寫" },
  { src: platedRedSeaweed, alt: "紅毛苔盛盤的日常食用情境" },
  { src: packageLabel, alt: "紅毛苔商品包裝與營養標示" },
];

const OTHER_PRODUCT_IMAGES = {
  furikake,
  "nut-cracker": nutCracker,
  "mushroom-powder": mushroomPowder,
  "energy-powder": energyPowder,
};

const NUTRITION = [
  ["熱量", "56 大卡", "564 大卡"],
  ["蛋白質", "2.62 公克", "26.2 公克"],
  ["脂肪", "4.02 公克", "39.92 公克"],
  ["飽和脂肪", "1.82 公克", "18.12 公克"],
  ["反式脂肪", "0 公克", "0 公克"],
  ["碳水化合物", "2.5 公克", "24.92 公克"],
  ["糖", "0.27 公克", "2.72 公克"],
  ["鈉", "74 毫克", "741 毫克"],
];

function Storefront() {
  const [flavor, setFlavor] = useState<FlavorId>("original");
  const [size, setSize] = useState<SizeId>("small");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", delivery: "宅配", note: "" });

  const selectedSize = SIZES.find((item) => item.id === size)!;
  const unitPrice = getPrice(flavor, size);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const groupDiscount = getGroupDiscount(subtotal);
  const discountAmount = Math.round(subtotal * groupDiscount.rate);
  const total = subtotal - discountAmount;

  function addItem(next: CartItem) {
    setCart((current) => {
      const found = current.find((item) => item.key === next.key);
      if (!found) return [...current, next];
      return current.map((item) => item.key === next.key ? { ...item, quantity: item.quantity + next.quantity } : item);
    });
    setCartOpen(true);
  }

  function addSeasoned() {
    addItem({
      key: `seasoned-${flavor}-${size}`,
      product: "seasoned",
      name: "烘焙紅毛苔",
      flavor,
      size,
      grams: selectedSize.grams,
      unitPrice,
      quantity,
    });
  }

  function updateQuantity(key: string, amount: number) {
    setCart((current) => current
      .map((item) => item.key === key ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length) return;
    setSubmitting(true);
    setSubmitError("");
    const orderNumber = `PPG${Date.now().toString().slice(-8)}`;
    const primary = cart.find((item) => item.product === "seasoned");
    const itemsForDatabase = cart.map((item) => ({
      key: item.key,
      product: item.product,
      name: item.name,
      flavor: item.flavor ?? null,
      size: item.size ?? null,
      grams: item.grams ?? null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    }));

    // The generated Database types do not include the orders table yet; cast the call.
    const { error } = (await supabase.from("orders" as never).insert({
      order_number: orderNumber,
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim(),
      delivery_method: form.delivery,
      note: form.note.trim() || null,
      items: itemsForDatabase,
      subtotal,
      discount_rate: Math.round(groupDiscount.rate * 100),
      discount_amount: discountAmount,
      shipping_fee: null,
      total,
      status: "待確認",
    } as never)) as { error: { message: string } | null };

    if (error) {
      setSubmitError("訂單暫時無法送出，請稍後再試；我們不會重複扣款或建立訂單。");
      setSubmitting(false);
      return;
    }

    saveOrder({
      id: orderNumber,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim(),
      flavor: primary?.flavor ?? "original",
      size: primary?.size ?? "small",
      quantity: cartCount,
      amount: total,
      items: cart,
      discountRate: groupDiscount.rate,
      discountAmount,
      delivery: form.delivery,
      note: form.note.trim() || undefined,
      status: "待確認",
      createdAt: new Date().toLocaleString("zh-TW", { hour12: false }),
    });
    setSubmittedOrder(orderNumber);
    setCart([]);
    setSubmitting(false);
    setForm({ name: "", phone: "", email: "", address: "", delivery: "宅配", note: "" });
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-forest">
      <div className="border-b border-forest/10 bg-[#eef3ee] px-4 py-2 text-center text-sm font-medium text-forest/75">
        台灣製造・官網直接選購・滿 NT$5,000 起享團購優惠
      </div>
      <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="font-serif text-xl font-black tracking-[0.08em] md:text-2xl">萍日有光</a>
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#buy" className="hover:text-moss">立即選購</a>
            <a href="#more-products" className="hover:text-moss">更多蔬食選物</a>
            <a href="#group-buy" className="hover:text-moss">團購優惠</a>
            <a href="#details" className="hover:text-moss">商品資訊</a>
            <Link to="/account" className="hover:text-moss">會員</Link>
          </nav>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-bold text-cream hover:bg-moss"
            aria-label={`購物袋，共 ${cartCount} 件`}
          >
            <ShoppingBag className="size-4" />
            <span>購物袋</span>
            {cartCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-sand text-xs text-forest">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main>
        <section id="top" className="relative overflow-hidden bg-white">
          <div className="mx-auto grid min-h-[620px] max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative z-10 flex flex-col justify-center px-6 py-16 lg:px-10 lg:py-24">
              <span className="mb-4 text-sm font-black tracking-[0.18em] text-moss">海味烘焙小食</span>
              <p className="mb-4 font-serif text-2xl font-black tracking-[0.12em]">紅毛苔</p>
              <h1 className="max-w-xl font-serif text-5xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
                從一包紅毛苔開始，<br /><span className="text-moss">把自然的好，帶進每一天。</span>
              </h1>
              <p className="mt-5 text-sm font-black tracking-[0.12em] text-moss">天然紅藻・低溫烘焙・酥脆鹹香</p>
              <p className="mt-6 max-w-lg text-lg font-medium leading-8 text-forest/80">
                紅毛苔經挑選與細火烘焙，成為一片片薄酥的海味點心。簡單鹹香與海洋鮮味在口中展開，開袋就是恰到好處的日常滋味。
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#buy" className="inline-flex items-center gap-2 rounded-xl bg-forest px-7 py-4 text-base font-black text-cream shadow-xl shadow-forest/20 hover:-translate-y-0.5 hover:bg-moss">
                  立即訂購 <ArrowRight className="size-5" />
                </a>
                <a href="#story" className="text-base font-bold text-moss hover:text-forest">認識紅毛苔</a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
                <span className="flex items-center gap-2"><Check className="size-4" /> 台灣製造</span>
                <span className="flex items-center gap-2"><Check className="size-4" /> 全素可食</span>
                <span className="flex items-center gap-2"><Check className="size-4" /> 開封即食</span>
              </div>
            </div>
            <div className="relative min-h-[470px] lg:min-h-full">
              <img src={heroLifestyle} alt="享用盤裝紅毛苔的溫暖食用情境" className="absolute inset-0 h-full w-full object-cover object-center" fetchPriority="high" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent lg:hidden" />
              <div className="absolute bottom-6 left-6 rounded-2xl bg-cream/95 p-4 shadow-2xl backdrop-blur md:left-8">
                <p className="text-xs font-bold text-moss">今天想吃哪一味？</p>
                <p className="mt-1 font-serif text-xl font-black">原味・中藥・麻油薑香</p>
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="scroll-mt-24 border-b border-forest/10 bg-[#f7f5ef] py-14 lg:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-black tracking-[0.16em] text-moss">品牌故事</p>
              <h2 className="mt-4 font-serif text-4xl font-black leading-tight">把海洋的鮮味，<br />烘成一口酥香。</h2>
              <p className="mt-5 max-w-2xl leading-8 text-forest/65">紅毛苔是天然紅藻，經烘焙調味後，成為方便享用的傳統海味小食。萍日有光從這份熟悉滋味出發，選進適合日常餐桌、親友分享與蔬食生活的天然選物。</p>
            </div>
            <div className="rounded-2xl border border-forest/10 bg-white p-7 shadow-[0_20px_55px_rgba(20,60,37,0.08)]">
              <p className="text-xs font-bold tracking-[0.14em] text-moss">製造資訊</p>
              <p className="mt-3 font-serif text-2xl font-black">百利有機科技有限公司</p>
              <p className="mt-3 text-sm leading-6 text-forest/55">以實際商品包裝所載製造業者資訊為準。萍日有光負責商品選購、內容整理與官網銷售服務。</p>
            </div>
          </div>
        </section>

        <section className="border-b border-forest/10 bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-forest/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
            {[
              [PackageCheck, "開封就能吃", "主力系列已烘焙調味"],
              [Sparkles, "三種風味", "口味與份量分開選"],
              [Truck, "團購自動折扣", "滿 5,000 元即享 97 折"],
            ].map(([Icon, title, text]) => (
              <div key={String(title)} className="flex items-center gap-4 py-6 sm:px-6">
                <Icon className="size-7 shrink-0 text-moss" />
                <div><p className="font-bold">{String(title)}</p><p className="mt-1 text-sm text-forest/55">{String(text)}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section id="buy" className="scroll-mt-24 py-16 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
            <div>
              <div className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(20,60,37,0.12)]">
                <img src={PRODUCT_IMAGES[activeImage].src} alt={PRODUCT_IMAGES[activeImage].alt} className="aspect-square w-full object-cover" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {PRODUCT_IMAGES.map((image, index) => (
                  <button key={image.src} type="button" onClick={() => setActiveImage(index)} className={`overflow-hidden rounded-xl border-2 bg-white ${activeImage === index ? "border-forest" : "border-transparent opacity-75 hover:opacity-100"}`} aria-label={`查看商品照片 ${index + 1}`}>
                    <img src={image.src} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:pl-4">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">百利烘焙紅毛苔</p>
              <h2 className="mt-3 font-serif text-4xl font-black sm:text-5xl">酥脆、夠香，<br />打開就想再拿一片</h2>
              <div className="mt-5 flex items-baseline gap-3">
                <strong className="text-3xl text-moss">NT${unitPrice.toLocaleString()}</strong>
                <span className="text-sm text-forest/50">／{selectedSize.grams}g</span>
              </div>
              <p className="mt-5 leading-7 text-forest/70">適合直接吃、配飯、配粥或當下午點心。先選喜歡的風味，再挑剛好的份量。</p>

              <fieldset className="mt-8">
                <legend className="mb-3 flex w-full items-center justify-between font-bold"><span>1. 選擇口味</span><span className="text-sm font-normal text-forest/50">原味價格較高</span></legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {FLAVORS.map((item) => (
                    <button key={item.id} type="button" onClick={() => setFlavor(item.id)} className={`relative rounded-xl border-2 p-4 text-left ${flavor === item.id ? "border-forest bg-forest text-cream shadow-lg" : "border-forest/10 bg-white hover:border-forest/35"}`}>
                      <span className={`text-xs font-bold ${flavor === item.id ? "text-sand" : "text-moss"}`}>{item.accent}</span>
                      <span className="mt-1 block font-black">{item.zh}</span>
                      <span className={`mt-2 block text-xs leading-5 ${flavor === item.id ? "text-cream/70" : "text-forest/50"}`}>{item.note}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-7">
                <legend className="mb-3 font-bold">2. 選擇份量</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SIZES.map((item) => {
                    const optionPrice = getPrice(flavor, item.id);
                    return (
                      <button key={item.id} type="button" onClick={() => setSize(item.id)} className={`rounded-xl border-2 p-4 text-left ${size === item.id ? "border-forest bg-sand/35" : "border-forest/10 bg-white hover:border-forest/35"}`}>
                        <span className="flex items-center justify-between font-black"><span>{item.grams}g</span>{size === item.id && <CheckCircle2 className="size-4" />}</span>
                        <span className="mt-1 block text-xs text-forest/50">{item.note}</span>
                        <span className="mt-3 block font-bold text-moss">NT${optionPrice}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-8 flex gap-3">
                <div className="flex h-14 items-center rounded-xl border border-forest/15 bg-white">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid size-12 place-items-center" aria-label="減少數量"><Minus className="size-4" /></button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="grid size-12 place-items-center" aria-label="增加數量"><Plus className="size-4" /></button>
                </div>
                <button type="button" onClick={addSeasoned} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-forest px-6 font-black text-cream shadow-xl shadow-forest/15 hover:-translate-y-0.5 hover:bg-moss">
                  <ShoppingBag className="size-5" /> 加入購物袋・NT${(unitPrice * quantity).toLocaleString()}
                </button>
              </div>
              <p className="mt-4 text-center text-xs leading-5 text-forest/50">商品小計不含運費；配送與付款資訊會在訂單確認時提供。</p>
            </div>
          </div>
        </section>

        <section id="more-products" className="scroll-mt-24 border-y border-forest/10 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">More selections</p>
                <h2 className="mt-3 font-serif text-4xl font-black">從紅毛苔出發的蔬食選物</h2>
              </div>
              <p className="max-w-lg leading-7 text-forest/60">紅毛苔延伸點心、廚房調味與沖泡粉品，一次放進購物袋，送禮、供養與家庭分享更方便。</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {OTHER_PRODUCTS.map((product) => (
                <article key={product.id} className="flex overflow-hidden rounded-2xl border border-forest/10 bg-cream shadow-[0_18px_45px_rgba(20,60,37,0.08)]">
                  <div className="flex w-full flex-col">
                    <div className="overflow-hidden bg-white"><img src={OTHER_PRODUCT_IMAGES[product.id]} alt={product.name} className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-[1.03]" /></div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-xs font-bold text-moss">{product.category}</span>
                      <h3 className="mt-2 font-serif text-xl font-black">{product.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-forest/60">{product.description}</p>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                        <div><strong className="text-xl text-moss">NT${product.price.toLocaleString()}</strong>{"grams" in product && <span className="ml-1 text-xs text-forest/45">／{product.grams}g</span>}</div>
                        <button
                          type="button"
                          onClick={() => addItem({ key: product.id, product: product.id, name: product.name, grams: "grams" in product ? product.grams : undefined, unitPrice: product.price, quantity: 1 })}
                          className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-cream hover:bg-moss"
                          aria-label={`將${product.name}加入購物袋`}
                        ><Plus className="size-5" /></button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-5 text-xs leading-6 text-forest/50">各商品完整成分、過敏原、營養標示與有效日期以實際包裝為準。孕婦、兒童、長輩及特殊飲食需求者，購買前請先核對產品標示。</p>
          </div>
        </section>

        <section id="group-buy" className="scroll-mt-24 border-y border-forest/10 bg-[#f3f0e7] py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:px-8">
            <div>
              <div className="flex items-center gap-3"><Users className="size-7" /><span className="text-sm font-black uppercase tracking-[0.16em]">Group order</span></div>
              <h2 className="mt-3 font-serif text-4xl font-black">揪團越多，分享更划算</h2>
              <p className="mt-4 leading-7 text-forest/70">寺院供養、道場分享、公司團購與親友合購，購物袋達門檻會自動套用優惠。</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["滿 NT$5,000", "97折", "現省 3%"],
                ["滿 NT$10,000", "95折", "現省 5%"],
                ["滿 NT$15,000", "93折", "現省 7%"],
              ].map(([threshold, rate, note]) => (
                <div key={threshold} className="rounded-2xl bg-forest p-5 text-cream shadow-xl shadow-forest/10">
                  <p className="text-sm text-cream/65">{threshold}</p><strong className="mt-2 block font-serif text-3xl text-sand">{rate}</strong><p className="mt-1 text-sm">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="details" className="scroll-mt-24 border-y border-forest/10 bg-white py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">Product details</p>
              <h2 className="mt-3 font-serif text-4xl font-black">買之前，<br />資訊先看清楚</h2>
              <p className="mt-5 max-w-md leading-7 text-forest/65">紅毛苔含蛋白質等營養成分，實際含量依包裝營養標示為準。不同風味的配方與營養會有差異，網站不以猜測補資料。</p>
              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-cream p-4"><span className="block text-forest/45">產地</span><b className="mt-1 block">台灣</b></div>
                <div className="rounded-xl bg-cream p-4"><span className="block text-forest/45">保存</span><b className="mt-1 block">陰涼乾燥處密封</b></div>
                <div className="rounded-xl bg-cream p-4"><span className="block text-forest/45">未開封保存期限</span><b className="mt-1 block">各規格皆為 10 個月</b></div>
                <div className="rounded-xl bg-cream p-4"><span className="block text-forest/45">出貨效期</span><b className="mt-1 block">保證至少剩餘 8 個月</b></div>
              </div>
            </div>

            <Accordion type="single" collapsible defaultValue="spec" className="border-t border-forest/15">
              <AccordionItem value="spec">
                <AccordionTrigger className="py-5 text-base font-black hover:no-underline">商品規格與保存方式</AccordionTrigger>
                <AccordionContent className="pb-6 leading-7 text-forest/70">
                  <ul className="space-y-2">
                    <li>品名：烘焙紅毛苔（原味／中藥風味／麻油薑香）</li>
                    <li>淨重：90g、150g、250g</li>
                    <li>食用方式：主力系列已烘焙調味，開封即可食用。</li>
                    <li>保存期限：未開封 10 個月，實際有效日期以包裝標示為準。</li>
                    <li>出貨效期：正常出貨保證至少剩餘 8 個月；若有例外會於出貨前先行告知。</li>
                    <li>保存方式：避免陽光直射與高溫潮濕；開封後密封保存並儘早食用。</li>
                    <li>製造業者：百利有機科技有限公司（依現有包裝資訊）</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ingredients">
                <AccordionTrigger className="py-5 text-base font-black hover:no-underline">三種風味成分說明</AccordionTrigger>
                <AccordionContent className="pb-6 leading-7 text-forest/70">
                  <p>三種風味的調味配方不同。現有照片只足以確認紅毛苔為主要原料，無法可靠辨識每一款完整成分與過敏原；待三種口味的包裝背標補齊後，網站會逐款列出，不會共用同一份成分資料。</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="nutrition">
                <AccordionTrigger className="py-5 text-base font-black hover:no-underline">營養標示（現有 90g 包裝照）</AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="mb-4 text-sm leading-6 text-forest/60">每一份量 10 公克，本包裝含 9 份。以下依您提供的現有包裝照片辨識；不同口味請以各自包裝標示為準。</p>
                  <div className="overflow-x-auto rounded-xl border border-forest/10">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="bg-cream"><tr><th className="p-3">項目</th><th className="p-3">每份</th><th className="p-3">每 100 公克</th></tr></thead>
                      <tbody className="divide-y divide-forest/10">{NUTRITION.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell} className="p-3">{cell}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="notice">
                <AccordionTrigger className="py-5 text-base font-black hover:no-underline">購買與食用提醒</AccordionTrigger>
                <AccordionContent className="pb-6 leading-7 text-forest/70">
                  本產品為一般食品，請依包裝建議方式食用。食品資訊與有效日期以實際到貨包裝為準；孕婦、兒童、長輩、過敏體質或有特殊飲食需求者，請先核對完整成分標示，必要時諮詢醫師或營養師。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section id="raw" className="scroll-mt-24 bg-forest py-16 text-cream lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-cream"><img src={redSeaweedCloseup} alt="未調味紅毛苔原片" className="aspect-[4/3] w-full object-cover" /></div>
            <div>
              <span className="rounded-full border border-cream/25 px-3 py-1 text-xs font-bold">喜歡自己料理的人</span>
              <h2 className="mt-5 font-serif text-4xl font-black">無調味紅毛苔原片</h2>
              <p className="mt-4 max-w-xl leading-7 text-cream/70">沒有油鹽、沒有調味，也不是開封即食。帶回家後可用平底鍋最小火乾烘，酥脆後再拌少量油、鹽或醬油；也能撕開加入熱湯。</p>
              <div className="mt-6 flex items-end gap-3"><strong className="text-3xl text-sand">NT${RAW_SHEET.price.toLocaleString()}</strong><span className="text-cream/55">／{RAW_SHEET.grams}g</span></div>
              <button type="button" onClick={() => addItem({ key: RAW_SHEET.id, product: "raw", name: RAW_SHEET.name, grams: RAW_SHEET.grams, unitPrice: RAW_SHEET.price, quantity: 1 })} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sand px-6 py-3.5 font-black text-forest hover:-translate-y-0.5">
                <ShoppingBag className="size-5" /> 加入購物袋
              </button>
              <details className="mt-7 max-w-xl border-t border-cream/20 pt-5 text-sm text-cream/70">
                <summary className="cursor-pointer font-bold text-cream">查看基本烘焙方式</summary>
                <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7"><li>先用手撕開，平底鍋不放油。</li><li>以最小火持續輕翻，或用預熱後的餘溫拌炒。</li><li>烘到乾燥酥脆後關火，再加入少量油與鹽調味。</li><li>若用烤箱，可從 100–120°C、3 分鐘開始測試，每 30–60 秒查看一次。</li></ol>
              </details>
            </div>
          </div>
        </section>

        <section id="checkout" className="scroll-mt-24 py-16 lg:py-24">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <div className="mb-8 text-center"><p className="text-sm font-black uppercase tracking-[0.18em] text-moss">Checkout</p><h2 className="mt-3 font-serif text-4xl font-black">確認購物袋，完成下單</h2></div>
            {submittedOrder ? (
              <div className="rounded-3xl border border-moss/20 bg-white p-8 text-center shadow-xl sm:p-12">
                <CheckCircle2 className="mx-auto size-14 text-moss" />
                <h3 className="mt-5 font-serif text-3xl font-black">訂單已送出</h3>
                <p className="mt-3 text-forest/65">訂單編號：<b className="text-forest">{submittedOrder}</b></p>
                <p className="mx-auto mt-3 max-w-lg leading-7 text-forest/60">我們會依您留下的聯絡資料確認配送、運費與付款方式。此頁目前不會直接扣款。</p>
                <button type="button" onClick={() => setSubmittedOrder(null)} className="mt-7 rounded-xl bg-forest px-6 py-3 font-bold text-cream">繼續選購</button>
              </div>
            ) : (
              <div className="grid overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-[0_30px_80px_rgba(20,60,37,0.1)] lg:grid-cols-[0.85fr_1.15fr]">
                <div className="bg-cream p-6 sm:p-8">
                  <h3 className="font-serif text-2xl font-black">您的商品</h3>
                  {cart.length ? <div className="mt-6 space-y-4">{cart.map((item) => (
                    <div key={item.key} className="border-b border-forest/10 pb-4">
                      <div className="flex justify-between gap-4"><div><p className="font-bold">{cartItemLabel(item)}</p><p className="mt-1 text-xs text-forest/50">NT${item.unitPrice.toLocaleString()} × {item.quantity}</p></div><b>NT${(item.unitPrice * item.quantity).toLocaleString()}</b></div>
                    </div>
                  ))}
                    <div className="space-y-2 pt-2 text-sm">
                      <div className="flex justify-between"><span>商品小計</span><span>NT${subtotal.toLocaleString()}</span></div>
                      {discountAmount > 0 && <div className="flex justify-between font-bold text-moss"><span>團購優惠 {groupDiscount.label}</span><span>省 NT${discountAmount.toLocaleString()}</span></div>}
                      <div className="flex justify-between border-t border-forest/10 pt-3 text-lg"><b>折後金額</b><strong className="text-moss">NT${total.toLocaleString()}</strong></div>
                    </div>
                    <p className="text-xs leading-5 text-forest/50">運費另計，確認訂單時告知。</p>
                  </div> : <div className="mt-6 rounded-xl border border-dashed border-forest/20 p-6 text-center"><ShoppingBag className="mx-auto size-8 text-forest/25" /><p className="mt-3 text-sm text-forest/55">購物袋目前是空的</p><a href="#buy" className="mt-4 inline-block font-bold text-moss">回去選購</a></div>}
                </div>
                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                  <h3 className="font-serif text-2xl font-black">收件資料</h3>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <FormField label="收件人姓名 *"><input required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField>
                    <FormField label="手機號碼 *"><input required inputMode="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></FormField>
                    <FormField label="Email（選填）" wide><input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></FormField>
                    <FormField label="配送方式 *" wide><select value={form.delivery} onChange={(event) => setForm({ ...form, delivery: event.target.value })}><option>宅配</option><option>超商取貨（客服確認門市）</option></select></FormField>
                    <FormField label="收件地址 *" wide><input required autoComplete="street-address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></FormField>
                    <FormField label="訂單備註（選填）" wide><textarea rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></FormField>
                  </div>
                  <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-forest/60"><input required type="checkbox" className="mt-1 size-4 accent-[#173f2a]" /><span>我已確認商品、口味與重量，並同意為處理訂單使用上述聯絡資料。</span></label>
                  {submitError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
                  <button disabled={!cart.length || submitting} className="mt-6 w-full rounded-xl bg-forest px-6 py-4 font-black text-cream shadow-lg hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40">{submitting ? "訂單送出中…" : `送出訂單・NT$${total.toLocaleString()}`}</button>
                  <p className="mt-3 text-center text-xs text-forest/45">送出後不會立即扣款，付款與運費由客服確認。</p>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-cream/10 bg-[#102f20] px-5 py-10 text-cream">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="font-serif text-2xl font-black tracking-[0.08em]">萍日有光</p><p className="mt-2 text-sm text-cream/55">從紅毛苔出發的天然蔬食與日常選物。</p></div>
          <div className="flex items-center gap-5 text-xs text-cream/50"><span>食品資訊以實際包裝為準</span><Link to="/account" className="hover:text-cream">會員中心</Link><Link to="/admin" className="hover:text-cream">訂單管理</Link></div>
        </div>
      </footer>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex w-full flex-col bg-cream sm:max-w-md">
          <SheetHeader><SheetTitle className="font-serif text-2xl font-black">購物袋</SheetTitle><SheetDescription>已選 {cartCount} 件商品</SheetDescription></SheetHeader>
          <div className="mt-5 flex-1 space-y-4 overflow-y-auto">
            {!cart.length && <div className="rounded-xl border border-dashed border-forest/20 p-8 text-center text-sm text-forest/50">購物袋目前是空的</div>}
            {cart.map((item) => (
              <div key={item.key} className="rounded-xl border border-forest/10 bg-white p-4">
                <div className="flex justify-between gap-4"><div><p className="font-bold">{cartItemLabel(item)}</p><p className="mt-1 text-sm text-forest/50">NT${item.unitPrice.toLocaleString()}</p></div><b>NT${(item.unitPrice * item.quantity).toLocaleString()}</b></div>
                <div className="mt-4 flex w-fit items-center rounded-lg border border-forest/10"><button type="button" onClick={() => updateQuantity(item.key, -1)} className="grid size-9 place-items-center" aria-label="減少數量"><Minus className="size-3" /></button><span className="w-8 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.key, 1)} className="grid size-9 place-items-center" aria-label="增加數量"><Plus className="size-3" /></button></div>
              </div>
            ))}
          </div>
          <div className="border-t border-forest/10 pt-5">
            {cart.length > 0 && groupDiscount.nextThreshold && <p className="mb-3 rounded-lg bg-sand/35 p-3 text-sm font-bold">再買 NT${(groupDiscount.nextThreshold - subtotal).toLocaleString()}，升級下一階團購優惠</p>}
            <div className="flex justify-between text-sm"><span>商品小計</span><span>NT${subtotal.toLocaleString()}</span></div>
            {discountAmount > 0 && <div className="mt-2 flex justify-between text-sm font-bold text-moss"><span>團購優惠 {groupDiscount.label}</span><span>省 NT${discountAmount.toLocaleString()}</span></div>}
            <div className="mt-3 flex justify-between border-t border-forest/10 pt-3 text-lg"><b>折後金額</b><strong>NT${total.toLocaleString()}</strong></div>
            <button type="button" disabled={!cart.length} onClick={() => { setCartOpen(false); document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-5 w-full rounded-xl bg-forest px-5 py-4 font-black text-cream disabled:opacity-40">前往結帳</button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FormField({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`block ${wide ? "sm:col-span-2" : ""}`}><span className="mb-2 block text-sm font-bold">{label}</span><div className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-forest/15 [&_input]:bg-cream/40 [&_input]:px-3 [&_input]:outline-none [&_input]:focus:border-moss [&_select]:h-11 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-forest/15 [&_select]:bg-cream/40 [&_select]:px-3 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-forest/15 [&_textarea]:bg-cream/40 [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea]:focus:border-moss">{children}</div></label>;
}
