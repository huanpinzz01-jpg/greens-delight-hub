import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { CheckCircle2, LogOut, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "會員中心｜萍日有光" },
      { name: "description", content: "萍日有光會員登入與帳號管理。" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (mode === "login") {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setError("登入失敗，請確認 Email 與密碼。");
      else setUser(result.data.user);
    } else {
      const result = await supabase.auth.signUp({ email, password });
      if (result.error) setError("註冊失敗，請確認 Email 是否已使用或密碼是否符合規定。");
      else {
        setUser(result.data.user);
        setMessage(result.data.session ? "會員帳號已建立。" : "會員帳號已建立，請至信箱完成驗證。 ");
      }
    }
    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-cream text-forest">
      <header className="border-b border-forest/10 bg-white/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="font-serif text-xl font-black tracking-[0.08em]">萍日有光</Link>
          <Link to="/" className="text-sm font-bold text-moss">回到商店</Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">Member</p>
          <h1 className="mt-4 font-serif text-4xl font-black leading-tight sm:text-5xl">讓喜歡的天然選物，<br />成為日常的一點光。</h1>
          <p className="mt-6 max-w-lg leading-8 text-forest/60">會員功能將逐步加入訂單查詢、常購清單與專屬通知。目前可先建立帳號，後續功能會沿用同一組會員資料。</p>
          <div className="mt-8 space-y-3 text-sm font-bold text-forest/70">
            <p className="flex items-center gap-3"><CheckCircle2 className="size-5 text-moss" /> 安全管理會員帳號</p>
            <p className="flex items-center gap-3"><CheckCircle2 className="size-5 text-moss" /> 預留訂單與常購商品功能</p>
            <p className="flex items-center gap-3"><CheckCircle2 className="size-5 text-moss" /> 不影響訪客直接選購</p>
          </div>
        </div>

        <div className="rounded-3xl border border-forest/10 bg-white p-7 shadow-[0_28px_80px_rgba(20,60,37,0.1)] sm:p-10">
          {loading ? <p className="text-center text-forest/50">載入中…</p> : user ? <div className="text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-[#eef3ee]"><UserRound className="size-7 text-moss" /></div><h2 className="mt-5 font-serif text-2xl font-black">歡迎回到萍日有光</h2><p className="mt-3 text-sm text-forest/55">{user.email}</p><p className="mt-7 rounded-xl bg-cream p-4 text-sm leading-6 text-forest/60">會員訂單查詢功能將在金流與訂單帳號關聯完成後開放。</p><button type="button" onClick={logout} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-forest/15 px-5 py-3 text-sm font-bold"><LogOut className="size-4" /> 登出</button></div> : <>
            <div className="flex rounded-xl bg-cream p-1">
              <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${mode === "login" ? "bg-white shadow-sm" : "text-forest/50"}`}>會員登入</button>
              <button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${mode === "signup" ? "bg-white shadow-sm" : "text-forest/50"}`}>建立帳號</button>
            </div>
            <form onSubmit={handleSubmit} className="mt-7">
              <label className="block text-sm font-bold">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-forest/15 bg-cream/40 px-4 outline-none focus:border-moss" /></label>
              <label className="mt-5 block text-sm font-bold">密碼<input required minLength={6} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-forest/15 bg-cream/40 px-4 outline-none focus:border-moss" /></label>
              {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {message && <p className="mt-4 rounded-lg bg-[#eef3ee] p-3 text-sm text-moss">{message}</p>}
              <button disabled={loading} className="mt-6 w-full rounded-xl bg-forest py-4 font-black text-cream hover:bg-moss">{mode === "login" ? "登入會員" : "建立會員帳號"}</button>
            </form>
          </>}
        </div>
      </main>
    </div>
  );
}
