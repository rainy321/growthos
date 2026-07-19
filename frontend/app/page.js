"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Flower2,
  Leaf,
  ListChecks,
  MessageCircle,
  Moon,
  Sparkles,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
} from "lucide-react";
import { useGrowth } from "./providers";
import { api } from "@/lib/api";
import { Bar, Card, EmptyState, PageHeader, RouteAccent, RouteRibbon, SectionTitle, Stat, Tag } from "./ui";

const pct = (n) => Math.round((n || 0) * 100);
const ROUTE_STEPS = ["目标", "拆解", "今日行动", "行为信号", "复盘", "重规划"];

export default function Overview() {
  const { me, dash, mem, tasks, simDate, dayN, tone } = useGrowth();
  const uid = me?.id || "";
  const [doneCount, setDoneCount] = useState(0);
  useEffect(() => {
    if (!uid) return;
    api.goals(uid).then((gs) => setDoneCount((gs || []).filter((g) => g.status === "done").length)).catch(() => {});
  }, [uid]);
  const todays = tasks.filter((t) => t.date === simDate);
  const doneToday = todays.filter((t) => t.status === "completed").length;
  const skippedToday = todays.filter((t) => t.status === "skipped").length;
  const pendingToday = Math.max(0, todays.length - doneToday - skippedToday);
  const completion = dash?.completion_rate || 0;
  const categories = dash?.categories || [];
  const recent = dash?.recent_7d || { done: 0, total: 0, rate: 0 };
  const quietHint = pendingToday
    ? `今天还剩 ${pendingToday} 个动作,先挑最轻的一件。`
    : "今天的执行已经收束,适合做一次轻复盘。";

  return (
    <>
      <PageHeader
        kicker="Adaptive route · live"
        title={`${me?.name || "成长者"}，今天只需要抵达下一个航点`}
        desc={`第 ${dayN} 天 · ${simDate} · ${tone}。Growth OS 会根据真实执行信号持续重规划，而不是让过期计划追着你跑。`}
        right={
          <Link href="/tasks" className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-signal px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(239,106,91,0.22)] transition hover:bg-[#dd5c50]">
            查看下一航点
            <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card tone="soft" className="route-grid relative min-h-[310px] overflow-hidden">
          <RouteAccent className="absolute -right-8 -top-4 h-40 w-48 opacity-55" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_180px] lg:items-center">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <Tag tone="signal">实时航线</Tag>
                <Tag tone="neutral">{tone}</Tag>
                <Tag tone={pendingToday ? "warn" : "accent"}>{pendingToday ? `${pendingToday} 个动作待完成` : "今日已安定"}</Tag>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-accent text-white shadow-[var(--shadow-pressed)]">
                  <UserRound size={24} />
                </span>
                <div>
                  <div className="display-type text-3xl leading-tight text-ink">{me?.name || "成长者"}</div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-text2">
                    <CalendarDays size={15} className="text-accent" />
                    {simDate}
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-text2">
                {quietHint} 完成质量、疲惫原因与时段变化都会成为导航信号，系统据此调整后面的路线。
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["今日任务", todays.length, ListChecks],
                  ["已完成", doneToday, CheckCircle2],
                  ["被跳过", skippedToday, Moon],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="rounded-lg border border-line/70 bg-card/60 px-3 py-3 shadow-[var(--shadow-pressed)]">
                    <Icon size={16} className="text-accent" />
                    <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
                    <div className="text-xs text-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full p-2" style={{ background: `conic-gradient(#2f7d78 ${pct(completion)}%, #d4e1df 0)` }}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/70 bg-card/85 shadow-[var(--shadow-pressed)]">
                <span className="data-type text-4xl font-bold tracking-tight text-ink">{pct(completion)}%</span>
                <span className="mt-1 text-xs font-semibold text-muted">航线完成度</span>
              </div>
            </div>
          </div>
        </Card>

        <Card tone="accent" className="relative overflow-hidden">
          <Leaf size={86} className="absolute -right-4 -top-5 text-accent/10" />
          <SectionTitle icon={Brain} title="重规划建议" desc="把行为信号翻译成更现实的下一步。" />
          <div className="rounded-lg border border-accent/15 bg-card/65 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accentsoft text-accent">
                <MessageCircle size={18} />
              </span>
              <div>
                <div className="text-sm font-bold text-ink">系统判断</div>
                <p className="mt-1 text-sm leading-6 text-text2">
                  {pendingToday ? "先抵达一个低难度航点。保持路线连续，比一次性冲刺更重要。" : "今日航线已收束，适合保存一次洞察，让下次规划更贴近你的节奏。"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/review" className="rounded-lg border border-line/70 bg-card/55 px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent/35 hover:text-accent">
              查看偏航分析
            </Link>
            <Link href="/tasks" className="rounded-lg border border-line/70 bg-card/55 px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent/35 hover:text-accent">
              继续执行
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="完成率" value={dash ? `${pct(dash.completion_rate)}%` : "-"} sub={dash ? `累计 ${dash.done}/${dash.total}` : "等待数据"} icon={Target} />
        <Stat label="连续天数" value={dash ? dash.streak : "-"} sub="至少完成一项" icon={Flame} tone="warn" />
        <Stat label="平均质量" value={dash ? dash.avg_quality : "-"} sub="5 分制评分" icon={Star} tone="info" />
        <Stat label="近 7 天" value={dash ? `${pct(recent.rate)}%` : "-"} sub={dash ? `${recent.done}/${recent.total} 条记录` : "等待打卡"} icon={TrendingUp} />
      </div>

      <Link href="/achievements" className="mt-5 flex items-center gap-4 rounded-lg border border-warn/25 bg-warnsoft p-5 shadow-[var(--shadow-card)] transition hover:border-warn/45">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-warn text-white shadow-[var(--shadow-pressed)]"><Trophy size={22} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-ink">抵达记录 · 已完成 {doneCount} 个长期目标</div>
          <div className="text-xs leading-5 text-text2">完成不是一次打卡，而是一条真实走完的路线。</div>
        </div>
        <ArrowRight size={18} className="shrink-0 text-warn" />
      </Link>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionTitle icon={ListChecks} title="下一航点" desc="只显示今天真正需要推进的动作。" />
          <div className="space-y-0">
            {todays.slice(0, 5).map((t) => {
              const settled = t.status === "completed" || t.status === "skipped";
              return (
                <div key={t.id} className="flex items-start gap-3 border-t border-line/75 py-3 first:border-t-0 first:pt-0">
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${t.status === "completed" ? "border-accent bg-accent text-white" : t.status === "skipped" ? "border-danger bg-dangersoft text-danger" : "border-line bg-card text-muted"}`}>
                    {t.status === "completed" ? <CheckCircle2 size={14} /> : <Clock3 size={13} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm leading-6 ${settled ? "text-muted line-through" : "text-ink"}`}>{t.content}</div>
                    <div className="mt-1">
                      <Tag tone={t.difficulty === "高" ? "danger" : t.difficulty === "中" ? "warn" : "accent"}>{t.difficulty || "中"}</Tag>
                    </div>
                  </div>
                </div>
              );
            })}
            {!todays.length ? <EmptyState icon={Flower2} title="今天还没有任务" desc="去任务页生成今天的动作,这里会变成安静的执行清单。" /> : null}
          </div>
        </Card>

        <Card tone="soft">
          <SectionTitle icon={Sprout} title="自适应成长航线" desc="偏航不是失败，而是下一次重规划所需的信号。" />
          <RouteRibbon steps={ROUTE_STEPS} active={pendingToday ? 2 : 3} />
          <p className="mt-4 text-xs leading-6 text-text2">目标决定方向，今天的行为决定路线。每次记录都会让计划从“理论上正确”变得“对你有效”。</p>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <SectionTitle icon={TrendingUp} title="各航线稳定度" desc="观察不同生活维度的真实执行，而不是只看总分。" />
          <div className="space-y-4">
            {categories.map((c) => <Bar key={c.category} label={c.category} rate={c.rate} />)}
            {!categories.length ? <EmptyState icon={Leaf} title="暂无维度数据" desc="先创建目标并完成一次打卡,进度会自动出现在这里。" /> : null}
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <RouteAccent className="absolute -bottom-12 -right-12 h-40 w-48 rotate-[-18deg] opacity-35" />
          <SectionTitle icon={Sparkles} title="导航记忆" desc="系统从长期行为里学到的个人规律。" />
          <div className="relative z-10 space-y-3">
            {(mem || []).slice(0, 4).map((m) => (
              <div key={m.id} className="border-t border-line/75 pt-3 first:border-t-0 first:pt-0">
                <Tag tone="accent">{m.insight_type}</Tag>
                <div className="mt-2 text-sm leading-6 text-text2">{m.content}</div>
              </div>
            ))}
            {!(mem || []).length ? <EmptyState icon={Sparkles} title="还没有系统记忆" desc="完成几天打卡并保存洞察后,这里会开始增长。" /> : null}
          </div>
        </Card>
      </div>
    </>
  );
}
