"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Brain,
  CalendarDays,
  ChevronRight,
  CloudOff,
  LayoutDashboard,
  Leaf,
  ListChecks,
  LogOut,
  MessageCircle,
  RotateCcw,
  Route,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { useGrowth } from "./providers";
import { api } from "@/lib/api";
import { TONES } from "./shared";
import { Btn, RouteAccent, Tag } from "./ui";

const NAV = [
  { href: "/", label: "总览", icon: LayoutDashboard },
  { href: "/tasks", label: "今日任务", icon: ListChecks },
  { href: "/review", label: "AI 复盘", icon: Brain },
  { href: "/achievements", label: "成就", icon: Trophy },
];

function Field({ label, value, onChange, type = "text", placeholder = "", ...rest }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-text2">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-line/90 bg-card/80 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-accent/50 focus:bg-card"
        {...rest}
      />
    </label>
  );
}

function LoginScreen() {
  const { login, startDemo } = useGrowth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [baseline, setBaseline] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event?.preventDefault();
    setErr("");
    if (name.trim().length < 2) {
      setErr("请输入至少 2 个字符的用户名");
      return;
    }
    if (!password || (mode === "register" && password.length < 8)) {
      setErr(mode === "register" ? "新账号密码至少需要 8 个字符" : "请输入密码");
      return;
    }
    setBusy(true);
    try {
      const u = mode === "login"
        ? await api.login({ name: name.trim(), password })
        : await api.register({ name: name.trim(), baseline: baseline.trim(), password });
      login(u);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section className="route-grid relative hidden overflow-hidden rounded-[24px] border border-accent/15 bg-[rgba(251,253,252,0.88)] p-8 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:block">
          <RouteAccent className="absolute -bottom-8 -right-8 h-52 w-64 opacity-50" />
          <div className="absolute right-8 top-8 flex items-center gap-2 text-accent2/40">
            <Leaf size={26} />
            <Route size={20} />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-ink text-white">
              <Route size={22} />
            </span>
            <div>
              <div className="text-xl font-bold tracking-tight text-ink">Growth OS</div>
              <div className="data-type text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Adaptive growth navigation</div>
            </div>
          </div>

          <h1 className="display-type mt-10 max-w-2xl text-[2.65rem] leading-[1.18] text-ink">
            计划会过期。<br />你的方向不必。
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-text2">
            Growth OS 把长期目标导航成今天的一个航点，再用真实完成质量、阻力和精力变化持续重规划。
          </p>

          <div className="mt-8 grid grid-cols-7 gap-1.5">
            {["方向", "拆解", "今日", "执行", "信号", "洞察", "重规划"].map((x, i) => (
              <div key={x} className={`rounded-[9px] px-2 py-2 text-center text-xs font-semibold ${i === 2 ? "bg-signal text-white" : i < 4 ? "bg-accentsoft text-accent" : "bg-paper text-text2"}`}>
                {x}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[16px] border border-line/80 bg-card/75 p-5 shadow-[var(--shadow-pressed)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-ink">
                <ShieldCheck size={17} className="text-accent" />
                今日航线预览
              </div>
              <Tag tone="signal">Live reroute</Tag>
            </div>
            <div className="space-y-3">
              {[
                ["长期方向", "90 天建立稳定输出系统"],
                ["下一航点", "关闭通知，完成 45 分钟核心方案写作"],
                ["重规划", "晚间精力偏低，把高认知任务移到上午"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-t border-line pt-3 first:border-t-0 first:pt-0">
                  <span className="shrink-0 text-xs font-semibold text-muted">{label}</span>
                  <span className="text-right text-sm leading-6 text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-line/80 bg-[rgba(251,253,252,0.92)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-ink text-white">
              <Route size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink">Growth OS</h1>
              <p className="text-xs text-text2">自适应成长导航器</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="display-type text-3xl text-ink">{mode === "login" ? "继续你的航线" : "建立成长坐标"}</div>
            <p className="mt-2 text-sm leading-6 text-text2">
              {mode === "login" ? "登录后继续今天的下一个航点。" : "写下时间和现实限制，计划才会真正适合你。"}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-md bg-paper/70 p-1">
            {[
              ["login", "登录"],
              ["register", "注册"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`rounded px-3 py-2 text-sm font-semibold transition ${mode === key ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <form className="space-y-3" onSubmit={submit}>
            <Field label="用户名" value={name} onChange={setName} autoComplete="username" />
            {mode === "register" ? (
              <Field label="当前基础" value={baseline} onChange={setBaseline} placeholder="身份 / 可投入时间 / 强弱项" />
            ) : null}
            <Field label="密码" value={password} onChange={setPassword} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />

            {err ? <div role="alert" className="rounded-[10px] bg-dangersoft px-3 py-2 text-sm text-danger">{err}</div> : null}

            <Btn type="submit" disabled={busy} size="lg" className="mt-2 w-full">
              {busy ? "正在连接..." : mode === "login" ? "登录并继续" : "创建账号"}
            </Btn>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] text-muted"><span className="h-px flex-1 bg-line" />无需后端也能体验<span className="h-px flex-1 bg-line" /></div>
          <Btn variant="outline" onClick={startDemo} size="lg" className="w-full">
            <CloudOff size={16} />
            进入离线完整演示
          </Btn>
          <p className="mt-3 text-center text-[11px] leading-5 text-muted">演示数据只保存在当前浏览器，可随时重置。</p>
        </section>
      </div>
    </main>
  );
}

function ProfileModal({ onClose }) {
  const { me, updateMe, tone } = useGrowth();
  const [baseline, setBaseline] = useState(me?.baseline || "");
  const [t, setT] = useState(tone);
  const [err, setErr] = useState("");

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function save() {
    try {
      const u = await api.updateUser(me.id, { baseline, tone: t });
      updateMe(u);
      onClose();
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-5 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="profile-title" className="w-full max-w-md rounded-[18px] border border-line/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="profile-title" className="display-type text-2xl text-ink">编辑成长坐标</h3>
            <p className="mt-1 text-xs leading-5 text-text2">基础状态会进入 AI 规划上下文。</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accentsoft text-accent">
            <Settings size={17} />
          </span>
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-semibold text-text2">当前基础</span>
          <textarea
            value={baseline}
            onChange={(e) => setBaseline(e.target.value)}
            rows={4}
            placeholder="身份 / 可投入时间 / 强弱项"
            className="w-full rounded-md border border-line/90 bg-card/65 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-accent/50 focus:bg-card"
          />
        </label>

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold text-text2">陪伴语气</div>
          <div className="grid grid-cols-3 gap-2">
            {TONES.map((x) => (
              <button
                key={x}
                onClick={() => setT(x)}
                className={`rounded-md border px-2 py-2 text-sm font-semibold transition ${t === x ? "border-accent bg-accent text-white" : "border-line bg-card/65 text-text2 hover:text-ink"}`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {err ? <div className="mt-3 rounded-md bg-dangersoft px-3 py-2 text-sm text-danger">{err}</div> : null}

        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="quiet" onClick={onClose}>取消</Btn>
          <Btn onClick={save}>保存</Btn>
        </div>
      </div>
    </div>
  );
}

function Companion() {
  const { compOpen, messages, toggleCompanion, sendCompanion, tone } = useGrowth();
  const [text, setText] = useState("");

  function submit() {
    sendCompanion(text);
    setText("");
  }

  return (
    <>
      <button
        onClick={toggleCompanion}
        aria-label="成长伙伴"
        aria-expanded={compOpen}
        aria-controls="growth-companion"
        className={`fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition lg:bottom-6 lg:right-6 ${compOpen ? "bg-accent text-white" : "border border-line/80 bg-card/85 text-accent backdrop-blur-xl hover:scale-105"}`}
      >
        {compOpen ? <MessageCircle size={24} /> : <Bot size={24} />}
      </button>

      {compOpen ? (
        <div id="growth-companion" role="dialog" aria-label="成长伙伴对话" className="fixed bottom-36 right-5 z-40 flex h-[420px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-[18px] border border-line/80 bg-card/95 shadow-2xl backdrop-blur-xl lg:bottom-24 lg:right-6 lg:w-[22rem]">
          <div className="flex items-center justify-between border-b border-line/80 bg-accentsoft/80 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-accent">
                <Bot size={19} />
              </span>
              <div>
                <div className="text-sm font-bold text-ink">成长伙伴</div>
                <div className="text-[11px] text-text2">语气: {tone}</div>
              </div>
            </div>
            <Sparkles size={16} className="text-accent" />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-paper/55 px-4 py-3" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-6 ${m.role === "user" ? "bg-accent text-white" : "border border-line/80 bg-card/75 text-ink"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-line/80 p-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="跟伙伴说点什么..."
              className="min-w-0 flex-1 rounded-md border border-line/90 bg-card/65 px-3 py-2 text-sm outline-none transition focus:border-accent/50 focus:bg-card"
            />
            <button onClick={submit} aria-label="发送" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-white">
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function NavLink({ item, active }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-accentsoft text-accent" : "text-text2 hover:bg-paper hover:text-ink"}`}
    >
      <Icon size={18} strokeWidth={active ? 2.4 : 2} />
      <span>{item.label}</span>
    </Link>
  );
}

function MobileNav({ path }) {
  return (
    <nav aria-label="主要导航" className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-[rgba(247,251,250,0.9)] px-2 py-2 shadow-[0_-8px_24px_rgba(25,61,66,0.1)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold ${active ? "bg-accentsoft text-accent" : "text-muted"}`}>
              <Icon size={18} />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function CelebrationModal({ goals, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-5" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="celebration-title" className="w-full max-w-md rounded-[18px] border border-warn/30 bg-card p-7 text-center shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warn text-white shadow-[var(--shadow-pressed)]"><Trophy size={30} /></div>
        <div id="celebration-title" className="display-type text-2xl text-ink">新的抵达记录</div>
        <div className="mt-3 space-y-1.5">
          {goals.map((g) => <div key={g.id} className="rounded-md bg-warnsoft px-3 py-2 text-sm font-semibold text-ink">{g.title}</div>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-text2">系统检测到这个目标已到完成日,自动移入成就墙。</p>
        <button onClick={onClose} className="mt-5 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#72965e]">收下,继续成长</button>
      </div>
    </div>
  );
}

export default function Shell({ children }) {
  const { me, logout, simDate, dayN, tone, newlyCompleted, clearCelebration, isDemo, resetDemoData, dataStatus, dataError, serviceInfo } = useGrowth();
  const [profile, setProfile] = useState(false);
  const path = usePathname();

  if (!me) return <LoginScreen />;

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-line/70 bg-[rgba(247,251,250,0.86)] shadow-[var(--shadow-card)] backdrop-blur-xl lg:flex">
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-ink text-white">
              <Route size={20} />
            </span>
            <div>
              <div className="text-lg font-bold tracking-tight text-ink">Growth OS</div>
              <div className="data-type text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">Adaptive route</div>
            </div>
          </div>
        </div>

        <button onClick={() => setProfile(true)} className="mx-4 mb-4 flex items-center gap-3 rounded-lg border border-line/80 bg-card/55 px-3 py-3 text-left transition hover:border-accent/30 hover:bg-accentsoft/80">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">
            {(me.name || "?").slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-ink">{me.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
              <UserRound size={12} />
              {tone}
            </div>
          </div>
          <ChevronRight size={16} className="text-muted" />
        </button>

        <div className="mx-4 mb-5 rounded-lg border border-accent/15 bg-accentsoft/80 px-3 py-3 shadow-[var(--shadow-pressed)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent">
            <CalendarDays size={14} />
            模拟第 {dayN} 天
          </div>
          <div className="mt-1 text-sm font-bold text-ink">{simDate}</div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {NAV.map((n) => <NavLink key={n.href} item={n} active={path === n.href} />)}
        </nav>

        <div className="relative mx-4 mb-4 overflow-hidden rounded-[14px] border border-line/80 bg-card/60 p-3">
          <RouteAccent className="absolute -bottom-10 -right-12 h-28 w-36 rotate-[-18deg] opacity-25" />
          <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-ink">
            <Sparkles size={14} className="text-accent" />
            计划会根据你重新导航
          </div>
          <div className="relative z-10 mt-2 grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-text2">
            {["拆解", "执行", "识别偏航", "重规划"].map((x) => <span key={x} className="rounded bg-paper/70 px-2 py-1 text-center">{x}</span>)}
          </div>
          {isDemo ? <button onClick={resetDemoData} className="relative z-10 mt-3 flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-accent/20 bg-accentsoft px-2 py-1.5 text-[11px] font-semibold text-accent"><RotateCcw size={12} />重置演示数据</button> : null}
        </div>

        <div className="border-t border-line/70 px-4 py-3">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-paper hover:text-ink">
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/70 bg-[rgba(237,244,243,0.84)] px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-ink text-white">
            <Route size={18} />
          </span>
          <div>
            <div className="text-sm font-bold text-ink">Growth OS</div>
            <div className="text-[11px] text-muted">第 {dayN} 天 · {simDate}</div>
          </div>
        </div>
        <button onClick={() => setProfile(true)} className="flex h-9 w-9 items-center justify-center rounded-md border border-line/80 bg-card/75 text-accent">
          <Settings size={17} />
        </button>
      </header>

      <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {isDemo ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-info/20 bg-infosoft/90 px-4 py-3 text-xs text-text2" role="status">
              <span className="flex items-center gap-2"><CloudOff size={15} className="text-info" /><strong className="text-ink">离线演示</strong> 所有核心流程可用，数据只保存在当前浏览器。</span>
              <button onClick={resetDemoData} className="flex items-center gap-1.5 font-semibold text-info hover:text-ink"><RotateCcw size={13} />恢复初始数据</button>
            </div>
          ) : null}
          {!isDemo && serviceInfo?.ai_mode === "mock" ? (
            <div className="mb-5 rounded-[14px] border border-warn/20 bg-warnsoft px-4 py-3 text-xs leading-5 text-text2" role="status">
              <strong className="text-ink">当前使用演示 AI。</strong> 核心流程可用，但建议部署前配置模型 API Key，以获得针对真实目标的规划。
            </div>
          ) : null}
          {dataError ? <div role="alert" className="mb-5 rounded-[14px] border border-danger/20 bg-dangersoft px-4 py-3 text-sm text-danger">{dataError}</div> : null}
          {dataStatus === "loading" ? <div className="mb-4 h-1 overflow-hidden rounded-full bg-line"><div className="h-full w-1/3 animate-pulse rounded-full bg-signal" /></div> : null}
          {children}
        </div>
      </main>

      <Companion />
      <MobileNav path={path} />
      {profile ? <ProfileModal onClose={() => setProfile(false)} /> : null}
      {newlyCompleted && newlyCompleted.length > 0 ? <CelebrationModal goals={newlyCompleted} onClose={clearCelebration} /> : null}
    </div>
  );
}
