"use client";

export function Card({ children, className = "", tone = "plain" }) {
  const tones = {
    plain: "border-line/90 bg-[rgba(251,253,252,0.9)]",
    soft: "border-accent2/25 bg-[rgba(241,248,247,0.92)]",
    accent: "border-accent/25 bg-[rgba(232,244,241,0.92)]",
    info: "border-info/25 bg-[rgba(234,243,247,0.92)]",
    warn: "border-warn/25 bg-[rgba(250,241,226,0.94)]",
  };
  return (
    <section className={`rounded-[18px] border p-5 shadow-[var(--shadow-card)] backdrop-blur-xl ${tones[tone] || tones.plain} ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({ kicker, title, desc, right }) {
  return (
    <div className="enter-rise mb-7 flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        {kicker ? <div className="data-type mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{kicker}</div> : null}
        <h1 className="display-type max-w-4xl text-[1.8rem] leading-tight text-ink sm:text-[2.4rem]">{title}</h1>
        {desc ? <p className="mt-2 max-w-3xl text-sm leading-7 text-text2">{desc}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, desc, right }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-accent/15 bg-accentsoft text-accent shadow-[var(--shadow-pressed)]">
            <Icon size={17} />
          </span>
        ) : null}
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-ink">{title}</div>
          {desc ? <div className="mt-0.5 max-w-xl text-xs leading-5 text-text2">{desc}</div> : null}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, sub, icon: Icon, tone = "accent" }) {
  const styles = {
    accent: "bg-accentsoft text-accent",
    info: "bg-infosoft text-info",
    warn: "bg-warnsoft text-warn",
    danger: "bg-dangersoft text-danger",
  };
  return (
    <Card className="min-h-[132px]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-text2">{label}</div>
        {Icon ? <span className={`flex h-8 w-8 items-center justify-center rounded-[9px] border border-white/70 shadow-[var(--shadow-pressed)] ${styles[tone] || styles.accent}`}><Icon size={17} /></span> : null}
      </div>
      <div className="data-type mt-4 text-3xl font-bold tracking-tight text-ink">{value}</div>
      {sub ? <div className="mt-2 text-xs leading-5 text-muted">{sub}</div> : null}
    </Card>
  );
}

export function Bar({ label, rate, suffix = "%" }) {
  const percent = Math.max(0, Math.min(100, Math.round((rate || 0) * 100)));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-text2">{label}</span>
        <span className="data-type font-semibold text-ink">{percent}{suffix}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#dce8e6] shadow-[inset_0_1px_2px_rgba(23,52,58,0.08)]">
        <div className="relative h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }}>
          {percent > 8 ? <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-signal ring-2 ring-card" /> : null}
        </div>
      </div>
    </div>
  );
}

export function Btn({ children, variant = "primary", size = "md", className = "", ...rest }) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-[10px] font-semibold transition active:translate-y-px disabled:translate-y-0 disabled:opacity-45";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  const styles = {
    primary: "bg-accent text-white shadow-[0_10px_24px_rgba(47,125,120,0.22)] hover:bg-[#286e69]",
    signal: "bg-signal text-white shadow-[0_10px_24px_rgba(239,106,91,0.22)] hover:bg-[#dd5c50]",
    outline: "border border-accent/35 bg-card/75 text-accent hover:bg-accentsoft",
    quiet: "border border-line bg-card/75 text-ink hover:border-accent/35 hover:text-accent",
    ghost: "text-accent hover:bg-accentsoft",
    danger: "bg-danger text-white hover:bg-[#a33f3d]",
  };
  return <button type="button" className={`${base} ${sizes[size] || sizes.md} ${styles[variant] || styles.primary} ${className}`} {...rest}>{children}</button>;
}

export function Tag({ children, tone = "accent", className = "" }) {
  const tones = {
    accent: "bg-accentsoft text-accent",
    signal: "bg-signalsoft text-signal",
    info: "bg-infosoft text-info",
    warn: "bg-warnsoft text-warn",
    danger: "bg-dangersoft text-danger",
    neutral: "bg-paper text-text2",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone] || tones.accent} ${className}`}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="route-grid flex min-h-[170px] flex-col items-center justify-center rounded-[14px] border border-dashed border-accent/25 bg-card/55 px-5 py-8 text-center">
      {Icon ? <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accentsoft text-accent"><Icon size={20} /></span> : null}
      <div className="text-sm font-semibold text-ink">{title}</div>
      {desc ? <div className="mt-1 max-w-sm text-xs leading-5 text-text2">{desc}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function RouteRibbon({ steps, active = 0 }) {
  return (
    <div className="route-grid overflow-hidden rounded-[16px] border border-accent/15 bg-card/60 p-4">
      <div className="relative grid gap-3" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        <span className="absolute left-[6%] right-[6%] top-[13px] h-px bg-accent/25" />
        {steps.map((step, index) => (
          <div key={step.label || step} className="relative z-10 min-w-0 text-center">
            <span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold ${index === active ? "border-signal bg-signal text-white shadow-[0_0_0_5px_rgba(239,106,91,0.12)]" : index < active ? "border-accent bg-accent text-white" : "border-line bg-card text-muted"}`}>
              {index + 1}
            </span>
            <div className={`mt-2 truncate text-[11px] font-semibold ${index === active ? "text-signal" : "text-text2"}`}>{step.label || step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BotanicalAccent({ className = "" }) {
  return (
    <svg viewBox="0 0 220 180" aria-hidden="true" className={`pointer-events-none select-none text-accent2 ${className}`} fill="none">
      <path d="M12 142C42 72 84 159 119 87C145 33 176 44 211 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M5 169C48 104 74 174 113 128C145 89 173 104 216 63" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7" opacity=".7" />
      <path d="M43 19C57 52 82 48 95 73C110 102 91 128 103 164" stroke="currentColor" strokeWidth="1" opacity=".45" />
      <circle cx="119" cy="87" r="7" fill="#ef6a5b" />
      <circle cx="211" cy="16" r="5" fill="#fbfdfc" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
